const WORKER_API = 'https://gmc-mission-archive.tyzm.workers.dev/api';

function allowedGoogleUrl(value) {
  let url;
  try { url = new URL(value); } catch (_) { return null; }
  const allowed = ['googleapis.com','google.com','googleusercontent.com','drive.google.com','docs.google.com','drive.usercontent.google.com'];
  if (url.protocol !== 'https:' || !allowed.some(host => url.hostname === host || url.hostname.endsWith('.' + host))) return null;
  return url;
}

async function fetchGoogleDownload(initialUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    let url = initialUrl;
    for (let hop = 0; hop <= 5; hop++) {
      const response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: controller.signal
      });
      const location = response.headers.get('location');
      if (![301, 302, 303, 307, 308].includes(response.status) || !location) {
        const contentLength = Number(response.headers.get('content-length') || 0);
        if (contentLength > 250 * 1024 * 1024) {
          await response.body?.cancel();
          throw new Error('File is too large to proxy');
        }
        const reader = response.body?.getReader();
        const chunks = [];
        let total = 0;
        if (reader) {
          while (true) {
            const part = await reader.read();
            if (part.done) break;
            total += part.value.byteLength;
            if (total > 250 * 1024 * 1024) {
              await reader.cancel();
              throw new Error('File is too large to proxy');
            }
            chunks.push(Buffer.from(part.value));
          }
        }
        return { response, body: Buffer.concat(chunks, total) };
      }
      await response.body?.cancel();
      const next = allowedGoogleUrl(new URL(location, url).toString());
      if (!next) throw new Error('Redirect host is not allowed');
      if (hop === 5) throw new Error('Too many Google download redirects');
      url = next;
    }
    throw new Error('Unable to complete Google download');
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchTextWithTimeout(url, options, milliseconds = 30000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), milliseconds);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const upstreamText = await response.text();
    return { response, upstreamText };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const target = req.query?.url;
      if (!target) return res.status(200).json({ ok: true, service: 'gmc-vercel-proxy' });

      const url = allowedGoogleUrl(target);
      if (!url) return res.status(403).json({ ok: false, message: 'File host is not allowed' });

      const { response: upstream, body } = await fetchGoogleDownload(url);

      const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
      res.status(upstream.status);
      res.setHeader('content-type', contentType);
      res.setHeader('content-disposition', 'inline');
      res.setHeader('content-length', String(body.length));
      res.setHeader('cache-control', 'private, max-age=300');
      return res.send(body);
    }

    if (req.method === 'POST' && req.query?.upload === '1') {
      const url = allowedGoogleUrl(req.query?.url);
      if (!url) return res.status(403).json({ ok: false, message: 'Upload host is not allowed' });

      const contentRange = req.headers['content-range'];
      if (!contentRange) return res.status(400).json({ ok: false, message: 'Content-Range is required' });

      const chunks = [];
      let total = 0;
      for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
        total += chunk.length;
        if (total > 4 * 1024 * 1024) {
          return res.status(413).json({ ok: false, message: 'Upload chunk is too large' });
        }
      }
      const body = Buffer.concat(chunks, total);

      const { response: upstream, upstreamText } = await fetchTextWithTimeout(url.toString(), {
        method: 'PUT',
        redirect: 'manual',
        headers: {
          'Content-Range': String(contentRange),
          'Content-Type': 'application/octet-stream',
          'Content-Length': String(body.length)
        },
        body
      }, 60000);
      const redirectLocation = upstream.headers.get('location');
      if (redirectLocation && !allowedGoogleUrl(new URL(redirectLocation, url).toString())) {
        await upstream.body?.cancel();
        return res.status(502).json({ ok: false, message: 'Upload redirect host is not allowed' });
      }

      res.status(upstream.status);
      const ct = upstream.headers.get('content-type');
      if (ct) res.setHeader('content-type', ct);
      const range = upstream.headers.get('range');
      if (range) res.setHeader('range', range);
      return res.end(upstreamText);
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) {}
    }

    const { response: upstream, upstreamText } = await fetchTextWithTimeout(WORKER_API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body || {})
    }, 30000);

    res.status(upstream.status);
    res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json; charset=UTF-8');
    return res.end(upstreamText);
  } catch (e) {
    return res.status(502).json({ ok: false, message: 'Vercel API proxy error: ' + (e?.message || 'unknown error') });
  }
};


module.exports.config = { api: { bodyParser: false } };
