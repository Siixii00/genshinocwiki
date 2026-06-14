const { sql } = require('../lib/db');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const items = await sql`
        SELECT * FROM gallery 
        ORDER BY created_at DESC
      `;
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const item = req.body;
      const [result] = await sql`
        INSERT INTO gallery (title, description, image_url, category)
        VALUES (${item.title}, ${item.description || null}, ${item.image_url || item.imageUrl}, ${item.category || null})
        RETURNING *
      `;
      return res.status(201).json(result);
    }

    if (req.method === 'PUT') {
      const { id, _id, ...updates } = req.body;
      const itemId = id || _id;

      if (!itemId) {
        return res.status(400).json({ error: 'Missing id' });
      }

      const [result] = await sql`
        UPDATE gallery SET
          title = COALESCE(${updates.title}, title),
          description = COALESCE(${updates.description || updates.description === null ? updates.description : sql`description`}, description),
          image_url = COALESCE(${updates.image_url || updates.imageUrl}, image_url),
          category = COALESCE(${updates.category || updates.category === null ? updates.category : sql`category`}, category),
          updated_at = NOW()
        WHERE id = ${itemId}
        RETURNING *
      `;
      return res.status(200).json(result);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }
      await sql`DELETE FROM gallery WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}