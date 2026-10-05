const WORKER_API = 'https://gmc-mission-archive.tyzm.workers.dev/api';

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const target = req.query?.url;
      if (!target) return res.status(200).json({ ok: true, service: 'gmc-vercel-proxy' });

      let url;
      try { url = new URL(target); } catch (_) {
        return res.status(400).json({ ok: false, message: 'Invalid file URL' });
      }

      const allowed = ['drive.google.com','docs.google.com','drive.usercontent.google.com','googleusercontent.com'];
      if (!allowed.some(host => url.hostname === host || url.hostname.endsWith('.' + host))) {
        return res.status(403).json({ ok: false, message: 'File host is not allowed' });
      }

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
    return res.status(502).json({ ok: false, message: 'Vercel API proxy error' });
  }
};
