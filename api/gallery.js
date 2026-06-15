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
        SELECT id, title, description, url, type, category, date, image_position, sort_order, created_at, updated_at 
        FROM gallery 
        ORDER BY sort_order ASC, created_at DESC
      `;
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const item = req.body;
      const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), -1) as max FROM gallery`;
      const sortOrder = (maxOrder[0]?.max ?? -1) + 1;
      
      const [result] = await sql`
        INSERT INTO gallery (title, description, url, type, category, date, image_position, sort_order)
        VALUES (${item.title}, ${item.description || null}, ${item.url || item.videoUrl}, ${item.type || 'image'}, ${item.category || null}, ${item.date || null}, ${item.imagePosition || 50}, ${sortOrder})
        RETURNING id, title, description, url, type, category, date, image_position, sort_order, created_at, updated_at
      `;
      return res.status(201).json(result);
    }

    if (req.method === 'PUT') {
      const { id, _id, ...updates } = req.body;
      const itemId = id || _id;

      if (!itemId) {
        return res.status(400).json({ error: 'Missing id' });
      }

      if (updates.sortOrder !== undefined) {
        await sql`UPDATE gallery SET sort_order = ${updates.sortOrder} WHERE id = ${itemId}`;
        return res.status(200).json({ success: true });
      }

      const [result] = await sql`
        UPDATE gallery SET
          title = COALESCE(${updates.title}, title),
          description = COALESCE(${updates.description || updates.description === null ? updates.description : sql`description`}, description),
          url = COALESCE(${updates.url || updates.videoUrl}, url),
          type = COALESCE(${updates.type}, type),
          category = COALESCE(${updates.category || updates.category === null ? updates.category : sql`category`}, category),
          date = COALESCE(${updates.date}, date),
          image_position = COALESCE(${updates.imagePosition || updates.image_position}, image_position),
          updated_at = NOW()
        WHERE id = ${itemId}
        RETURNING id, title, description, url, type, category, date, image_position, sort_order, created_at, updated_at
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