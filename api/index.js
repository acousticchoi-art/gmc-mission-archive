const WORKER_API = 'https://gmc-mission-archive.tyzm.workers.dev/api';

function allowedGoogleUrl(value) {
  let url;
  try { url = new URL(value); } catch (_) { return null; }
  const allowed = ['googleapis.com','google.com','googleusercontent.com','drive.google.com','docs.google.com','drive.usercontent.google.com'];
  if (!allowed.some(host => url.hostname === host || url.hostname.endsWith('.' + host))) return null;
  return url;
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const target = req.query?.url;
      if (!target) return res.status(200).json({ ok: true, service: 'gmc-vercel-proxy' });

      const url = allowedGoogleUrl(target);
      if (!url) return res.status(403).json({ ok: false, message: 'File host is not allowed' });

      const upstream = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
      const contentLength = upstream.headers.get('content-length');
      res.status(upstream.status);
      res.setHeader('content-type', contentType);
      if (contentLength) res.setHeader('content-length', contentLength);
      res.setHeader('cache-control', 'private, max-age=300');
      return res.send(Buffer.from(await upstream.arrayBuffer()));
    }

    if (req.method === 'POST' && req.query?.upload === '1') {
      const url = allowedGoogleUrl(req.query?.url);
      if (!url) return res.status(403).json({ ok: false, message: 'Upload host is not allowed' });

      const contentRange = req.headers['content-range'];
      if (!contentRange) return res.status(400).json({ ok: false, message: 'Content-Range is required' });

      const upstream = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Range': String(contentRange),
          'Content-Type': req.headers['content-type'] || 'application/octet-stream',
          ...(req.headers['content-length'] ? { 'Content-Length': String(req.headers['content-length']) } : {})
        },
        body: req,
        duplex: 'half'
      });

      const text = await upstream.text();
      res.status(upstream.status);
      const ct = upstream.headers.get('content-type');
      if (ct) res.setHeader('content-type', ct);
      const range = upstream.headers.get('range');
      if (range) res.setHeader('range', range);
      return res.end(text);
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) {}
    }

    const upstream = await fetch(WORKER_API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body || {})
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json; charset=UTF-8');
    return res.end(text);
  } catch (e) {
    return res.status(502).json({ ok: false, message: 'Vercel API proxy error: ' + (e?.message || 'unknown error') });
  }
};


module.exports.config = { api: { bodyParser: false } };
