const crypto = require('crypto');
const { head } = require('@vercel/blob');

const BLOB_KEY = 'cms/auth.json';

async function readPassword() {
  try {
    const meta = await head(BLOB_KEY);
    const res = await fetch(`${meta.url}?t=${Date.now()}`);
    const data = await res.json();
    return data.password;
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body || {};
  
  let adminPassword = await readPassword();
  if (!adminPassword) {
    adminPassword = process.env.ADMIN_PASSWORD || 'nisslar2026';
  }

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = Date.now() + 24 * 60 * 60 * 1000;

  res.status(200).json({ token: `${token}.${expiry}` });
};
