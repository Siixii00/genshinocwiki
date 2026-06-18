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
        SELECT * FROM products 
        ORDER BY created_at DESC
      `;
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const item = req.body;
      const images = Array.isArray(item.images) ? item.images : (item.images ? item.images.split('\n').filter(Boolean) : []);
      
      const [result] = await sql`
        INSERT INTO products (name, price, category, main_image, images, description, link, image_position, featured, series)
        VALUES (${item.name}, ${item.price || null}, ${item.category}, ${item.mainImage || item.main_image}, ${JSON.stringify(images)}, ${item.description || null}, ${item.link || null}, ${item.imagePosition || 50}, ${item.featured || false}, ${item.series || null})
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

      const images = Array.isArray(updates.images) ? updates.images : (updates.images ? updates.images.split('\n').filter(Boolean) : []);

      const [result] = await sql`
        UPDATE products SET
          name = COALESCE(${updates.name}, name),
          price = COALESCE(${updates.price || updates.price === null ? updates.price : sql`price`}, price),
          category = COALESCE(${updates.category}, category),
          main_image = COALESCE(${updates.mainImage || updates.main_image}, main_image),
          images = COALESCE(${JSON.stringify(images)}, images),
          description = COALESCE(${updates.description || updates.description === null ? updates.description : sql`description`}, description),
          link = COALESCE(${updates.link || updates.link === null ? updates.link : sql`link`}, link),
          image_position = COALESCE(${updates.imagePosition || updates.image_position}, image_position),
          featured = COALESCE(${updates.featured !== undefined ? updates.featured : sql`featured`}, featured),
          series = COALESCE(${updates.series || updates.series === null ? updates.series : sql`series`}, series),
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
      await sql`DELETE FROM products WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}