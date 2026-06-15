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
      const result = await sql`SELECT value FROM settings WHERE key = 'totp_secret'`;
      const secret = result.length > 0 ? result[0].value : null;
      return res.status(200).json({ secret });
    }

    if (req.method === 'POST') {
      const { secret } = req.body;
      if (!secret) {
        return res.status(400).json({ error: 'Secret required' });
      }

      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES ('totp_secret', ${secret}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = ${secret}, updated_at = NOW()
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}