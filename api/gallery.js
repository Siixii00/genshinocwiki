const { connectToDatabase } = require('../lib/mongodb');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('gallery');

    if (req.method === 'GET') {
      const items = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const item = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(item);
      return res.status(201).json({ ...item, _id: result.insertedId });
    }

    if (req.method === 'PUT') {
      const { id, _id, ...updates } = req.body;
      const filter = id ? { id } : _id ? { _id } : null;

      if (!filter) {
        return res.status(400).json({ error: 'Missing id or _id' });
      }

      updates.updatedAt = new Date();
      const result = await collection.updateOne(filter, { $set: updates });

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Gallery item not found' });
      }

      const updated = await collection.findOne(filter);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const { id, _id } = req.query;
      const filter = id ? { id } : _id ? { _id } : null;

      if (!filter) {
        return res.status(400).json({ error: 'Missing id or _id' });
      }

      await collection.deleteOne(filter);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}