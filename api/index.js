const WORKER_API = 'https://gmc-mission-archive.tyzm.workers.dev/api';

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, service: 'gmc-vercel-proxy' });
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
    return res.status(502).json({
      ok: false,
      message: 'Vercel API proxy error'
    });
  }
};
