const { sql } = require('../lib/db');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const result = await sql`
        SELECT value FROM settings WHERE key = 'music_tracks'
      `;
      const tracks = result.length > 0 ? JSON.parse(result[0].value) : [];
      return res.status(200).json({ tracks });
    }

    if (req.method === 'POST') {
      const { tracks } = req.body;
      
      const existing = await sql`
        SELECT key FROM settings WHERE key = 'music_tracks'
      `;

      if (existing.length > 0) {
        await sql`
          UPDATE settings SET value = ${JSON.stringify(tracks)}, updated_at = NOW()
          WHERE key = 'music_tracks'
        `;
      } else {
        await sql`
          INSERT INTO settings (key, value) VALUES ('music_tracks', ${JSON.stringify(tracks)})
        `;
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Music tracks API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
