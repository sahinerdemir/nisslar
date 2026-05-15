const fs = require('fs');
const path = require('path');

function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const parts = auth.slice(7).split('.');
  if (parts.length < 2) return false;
  const expiry = parseInt(parts[parts.length - 1]);
  return Date.now() < expiry;
}

const DATA_PATH = path.join(process.cwd(), 'src', '_data', 'content.json');

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')); }
  catch { return {}; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') return res.status(200).json(readData());

  if (req.method === 'PUT') {
    const data = req.body;
    if (typeof data !== 'object') return res.status(400).json({ error: 'Expected object' });
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
