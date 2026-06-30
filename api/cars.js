const { put, head, del } = require('@vercel/blob');

const BLOB_KEY = 'cms/cars.json';

function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const parts = auth.slice(7).split('.');
  if (parts.length < 2) return false;
  return Date.now() < parseInt(parts[parts.length - 1]);
}

async function readBlob() {
  try {
    const meta = await head(BLOB_KEY);
    const res = await fetch(`${meta.url}?t=${Date.now()}`);
    return await res.json();
  } catch { return null; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const fs = require('fs'), path = require('path');
    let local = [];
    try { local = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', '_data', 'cars.json'), 'utf-8')); } catch {}
    const blob = await readBlob();
    if (!blob || blob.length === 0) return res.status(200).json(local);
    const localMap = {};
    local.forEach(c => { localMap[c.id] = c; });
    const merged = blob.map(c => {
      const base = localMap[c.id];
      if (!base) return c;
      return { ...base, ...c, features: (c.features && c.features.length > 0) ? c.features : (base.features || []), gallery: (c.gallery && c.gallery.length > 0) ? c.gallery : (base.gallery || []), gas: c.gas || base.gas || '', mpg: c.mpg || base.mpg || '' };
    });
    const blobIds = new Set(blob.map(c => c.id));
    merged.push(...local.filter(c => !blobIds.has(c.id)));
    const activeMerged = merged.filter(c => !c.deleted);
    return res.status(200).json(activeMerged);
  }

  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'PUT') {
    const data = req.body;
    if (!Array.isArray(data)) return res.status(400).json({ error: 'Expected array' });

    const fs = require('fs'), path = require('path');
    let local = [];
    try { local = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', '_data', 'cars.json'), 'utf-8')); } catch {}
    const blob = await readBlob();

    let existingList = [];
    if (blob && blob.length > 0) {
      const localMap = {};
      local.forEach(c => { localMap[c.id] = c; });
      const merged = blob.map(c => {
        const base = localMap[c.id];
        if (!base) return c;
        return { ...base, ...c };
      });
      const blobIds = new Set(blob.map(c => c.id));
      merged.push(...local.filter(c => !blobIds.has(c.id)));
      existingList = merged;
    } else {
      existingList = local;
    }

    const newIds = new Set(data.map(c => c.id));
    const newlyDeleted = existingList
      .filter(c => !newIds.has(c.id) && !c.deleted)
      .map(c => ({ id: c.id, deleted: true }));

    const previouslyDeleted = blob ? blob.filter(c => c.deleted) : [];
    const allDeleted = [...previouslyDeleted, ...newlyDeleted];
    const activeDeleted = allDeleted.filter(c => !newIds.has(c.id));

    const uniqueDeletedMap = {};
    activeDeleted.forEach(c => { uniqueDeletedMap[c.id] = c; });
    const finalPayload = [...data, ...Object.values(uniqueDeletedMap)];

    await put(BLOB_KEY, JSON.stringify(finalPayload), { access: 'public', contentType: 'application/json', addRandomSuffix: false });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
