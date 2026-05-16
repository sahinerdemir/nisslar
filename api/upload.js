const { put } = require('@vercel/blob');

function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const parts = auth.slice(7).split('.');
  if (parts.length < 2) return false;
  return Date.now() < parseInt(parts[parts.length - 1]);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Filename, X-Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const filename = req.headers['x-filename'] || `car-${Date.now()}.jpg`;
    const contentType = req.headers['x-content-type'] || req.headers['content-type'] || 'image/jpeg';

    // Read raw body buffer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (!buffer.length) return res.status(400).json({ error: 'No file data received' });

    const blob = await put(`cars/${filename}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: true
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};
