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
      const characters = await sql`
        SELECT * FROM characters 
        ORDER BY created_at DESC
      `;
      return res.status(200).json(characters);
    }

    if (req.method === 'POST') {
      const c = req.body;
      const [character] = await sql`
        INSERT INTO characters (
          name, title, fullname, element, weapon, region, rarity, gender,
          affiliation, constellation, vision, dish, birthday,
          va_cn, va_jp, description, artwork, artwork2, portrait, avatar,
          skill_normal_name, skill_normal_desc,
          skill_elemental_name, skill_elemental_desc,
          skill_burst_name, skill_burst_desc, story
        ) VALUES (
          ${c.name}, ${c.title || null}, ${c.fullname || null},
          ${c.element}, ${c.weapon}, ${c.region}, ${c.rarity}, ${c.gender || null},
          ${c.affiliation || null}, ${c.constellation || null}, ${c.vision || null},
          ${c.dish || null}, ${c.birthday || null},
          ${c.vaCn || c.va_cn || null}, ${c.vaJp || c.va_jp || null},
          ${c.description || null}, ${c.artwork || null}, ${c.artwork2 || null},
          ${c.portrait || null}, ${c.avatar || null},
          ${c.skillNormalName || c.skill_normal_name || null},
          ${c.skillNormalDesc || c.skill_normal_desc || null},
          ${c.skillElementalName || c.skill_elemental_name || null},
          ${c.skillElementalDesc || c.skill_elemental_desc || null},
          ${c.skillBurstName || c.skill_burst_name || null},
          ${c.skillBurstDesc || c.skill_burst_desc || null},
          ${c.story || null}
        ) RETURNING *
      `;
      return res.status(201).json(character);
    }

    if (req.method === 'PUT') {
      const { id, _id, ...updates } = req.body;
      const characterId = id || _id;

      if (!characterId) {
        return res.status(400).json({ error: 'Missing id' });
      }

      const [character] = await sql`
        UPDATE characters SET
          name = COALESCE(${updates.name}, name),
          title = COALESCE(${updates.title || updates.title === null ? updates.title : sql`title`}, title),
          fullname = COALESCE(${updates.fullname || updates.fullname === null ? updates.fullname : sql`fullname`}, fullname),
          element = COALESCE(${updates.element}, element),
          weapon = COALESCE(${updates.weapon}, weapon),
          region = COALESCE(${updates.region}, region),
          rarity = COALESCE(${updates.rarity}, rarity),
          gender = COALESCE(${updates.gender || updates.gender === null ? updates.gender : sql`gender`}, gender),
          affiliation = COALESCE(${updates.affiliation || updates.affiliation === null ? updates.affiliation : sql`affiliation`}, affiliation),
          constellation = COALESCE(${updates.constellation || updates.constellation === null ? updates.constellation : sql`constellation`}, constellation),
          vision = COALESCE(${updates.vision || updates.vision === null ? updates.vision : sql`vision`}, vision),
          dish = COALESCE(${updates.dish || updates.dish === null ? updates.dish : sql`dish`}, dish),
          birthday = COALESCE(${updates.birthday || updates.birthday === null ? updates.birthday : sql`birthday`}, birthday),
          va_cn = COALESCE(${updates.va_cn || updates.vaCn || null}, va_cn),
          va_jp = COALESCE(${updates.va_jp || updates.vaJp || null}, va_jp),
          description = COALESCE(${updates.description || updates.description === null ? updates.description : sql`description`}, description),
          artwork = COALESCE(${updates.artwork || updates.artwork === null ? updates.artwork : sql`artwork`}, artwork),
          artwork2 = COALESCE(${updates.artwork2 || updates.artwork2 === null ? updates.artwork2 : sql`artwork2`}, artwork2),
          portrait = COALESCE(${updates.portrait || updates.portrait === null ? updates.portrait : sql`portrait`}, portrait),
          avatar = COALESCE(${updates.avatar || updates.avatar === null ? updates.avatar : sql`avatar`}, avatar),
          skill_normal_name = COALESCE(${updates.skill_normal_name || updates.skillNormalName || null}, skill_normal_name),
          skill_normal_desc = COALESCE(${updates.skill_normal_desc || updates.skillNormalDesc || null}, skill_normal_desc),
          skill_elemental_name = COALESCE(${updates.skill_elemental_name || updates.skillElementalName || null}, skill_elemental_name),
          skill_elemental_desc = COALESCE(${updates.skill_elemental_desc || updates.skillElementalDesc || null}, skill_elemental_desc),
          skill_burst_name = COALESCE(${updates.skill_burst_name || updates.skillBurstName || null}, skill_burst_name),
          skill_burst_desc = COALESCE(${updates.skill_burst_desc || updates.skillBurstDesc || null}, skill_burst_desc),
          story = COALESCE(${updates.story || updates.story === null ? updates.story : sql`story`}, story),
          updated_at = NOW()
        WHERE id = ${characterId}
        RETURNING *
      `;
      return res.status(200).json(character);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }
      await sql`DELETE FROM characters WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}