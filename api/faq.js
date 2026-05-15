const { put, list, del } = require('@vercel/blob');

const BLOB_KEY = 'cms/faq.json';

function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const parts = auth.slice(7).split('.');
  if (parts.length < 2) return false;
  return Date.now() < parseInt(parts[parts.length - 1]);
}

async function readData() {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      return res.json();
    }
  } catch {}
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const data = await readData();
    if (data) return res.status(200).json(data);
    const fs = require('fs'), path = require('path');
    try {
      const fallback = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', '_data', 'faq.json'), 'utf-8'));
      return res.status(200).json(fallback);
    } catch { return res.status(200).json([]); }
  }

  if (req.method === 'PUT') {
    const data = req.body;
    if (!Array.isArray(data)) return res.status(400).json({ error: 'Expected array' });
    const existing = await list({ prefix: BLOB_KEY });
    for (const blob of existing.blobs) { await del(blob.url); }
    await put(BLOB_KEY, JSON.stringify(data), { access: 'public', contentType: 'application/json' });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
