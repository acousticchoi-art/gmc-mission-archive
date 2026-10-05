const WORKER_API = 'https://gmc-mission-archive.tyzm.workers.dev/api';

module.exports = async function handler(req, res) {
  try {
    const headers = {
      'content-type': req.headers['content-type'] || 'application/json'
    };

    const response = await fetch(WORKER_API, {
      method: req.method || 'POST',
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
    });

    const text = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json; charset=utf-8');
    res.send(text);
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: 'API proxy failed'
    });
  }
};