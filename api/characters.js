const { sql } = require('../lib/db');

const PASSIVE_FIELDS = ['passive_1_name', 'passive_1_desc', 'passive_2_name', 'passive_2_desc', 'passive_3_name', 'passive_3_desc', 'passive_extra_name', 'passive_extra_desc'];
const STORY_FIELDS = ['story_detail', 'story_1', 'story_2', 'story_3', 'story_4', 'story_5', 'story_vision', 'story_extra'];

function getCharacterFields() {
  return [
    'name', 'title', 'fullname', 'element', 'weapon', 'region', 'rarity', 'gender',
    'affiliation', 'constellation', 'vision', 'dish', 'birthday',
    'va_cn', 'va_jp', 'description', 'artwork', 'gacha_image', 'portrait', 'avatar',
    'skill_normal_name', 'skill_normal_desc', 'skill_elemental_name', 'skill_elemental_desc', 'skill_burst_name', 'skill_burst_desc',
    ...PASSIVE_FIELDS,
    ...STORY_FIELDS
  ];
}

function normalizeCharacter(c) {
  return {
    name: c.name,
    title: c.title || null,
    fullname: c.fullname || null,
    element: c.element,
    weapon: c.weapon,
    region: c.region,
    rarity: c.rarity,
    gender: c.gender || null,
    affiliation: c.affiliation || null,
    constellation: c.constellation || null,
    vision: c.vision || null,
    dish: c.dish || null,
    birthday: c.birthday || null,
    va_cn: c.vaCn || c.va_cn || null,
    va_jp: c.vaJp || c.va_jp || null,
    description: c.description || null,
    artwork: c.artwork || null,
    gacha_image: c.gachaImage || c.gacha_image || null,
    portrait: c.portrait || null,
    avatar: c.avatar || null,
    skill_normal_name: c.skillNormalName || c.skill_normal_name || null,
    skill_normal_desc: c.skillNormalDesc || c.skill_normal_desc || null,
    skill_elemental_name: c.skillElementalName || c.skill_elemental_name || null,
    skill_elemental_desc: c.skillElementalDesc || c.skill_elemental_desc || null,
    skill_burst_name: c.skillBurstName || c.skill_burst_name || null,
    skill_burst_desc: c.skillBurstDesc || c.skill_burst_desc || null,
    passive_1_name: c.passive1Name || c.passive_1_name || null,
    passive_1_desc: c.passive1Desc || c.passive_1_desc || null,
    passive_2_name: c.passive2Name || c.passive_2_name || null,
    passive_2_desc: c.passive2Desc || c.passive_2_desc || null,
    passive_3_name: c.passive3Name || c.passive_3_name || null,
    passive_3_desc: c.passive3Desc || c.passive_3_desc || null,
    passive_extra_name: c.passiveExtraName || c.passive_extra_name || null,
    passive_extra_desc: c.passiveExtraDesc || c.passive_extra_desc || null,
    story_detail: c.storyDetail || c.story_detail || null,
    story_1: c.story1 || c.story_1 || null,
    story_2: c.story2 || c.story_2 || null,
    story_3: c.story3 || c.story_3 || null,
    story_4: c.story4 || c.story_4 || null,
    story_5: c.story5 || c.story_5 || null,
    story_vision: c.storyVision || c.story_vision || null,
    story_extra: c.storyExtra || c.story_extra || null
  };
}

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
      const c = normalizeCharacter(req.body);
      const [character] = await sql`
        INSERT INTO characters (
          name, title, fullname, element, weapon, region, rarity, gender,
          affiliation, constellation, vision, dish, birthday,
          va_cn, va_jp, description, artwork, gacha_image, portrait, avatar,
          skill_normal_name, skill_normal_desc,
          skill_elemental_name, skill_elemental_desc,
          skill_burst_name, skill_burst_desc,
          passive_1_name, passive_1_desc, passive_2_name, passive_2_desc, passive_3_name, passive_3_desc, passive_extra_name, passive_extra_desc,
          story_detail, story_1, story_2, story_3, story_4, story_5, story_vision, story_extra
        ) VALUES (
          ${c.name}, ${c.title}, ${c.fullname},
          ${c.element}, ${c.weapon}, ${c.region}, ${c.rarity}, ${c.gender},
          ${c.affiliation}, ${c.constellation}, ${c.vision},
          ${c.dish}, ${c.birthday},
          ${c.va_cn}, ${c.va_jp},
          ${c.description}, ${c.artwork}, ${c.gacha_image}, ${c.portrait}, ${c.avatar},
          ${c.skill_normal_name}, ${c.skill_normal_desc},
          ${c.skill_elemental_name}, ${c.skill_elemental_desc},
          ${c.skill_burst_name}, ${c.skill_burst_desc},
          ${c.passive_1_name}, ${c.passive_1_desc}, ${c.passive_2_name}, ${c.passive_2_desc}, ${c.passive_3_name}, ${c.passive_3_desc}, ${c.passive_extra_name}, ${c.passive_extra_desc},
          ${c.story_detail}, ${c.story_1}, ${c.story_2}, ${c.story_3}, ${c.story_4}, ${c.story_5}, ${c.story_vision}, ${c.story_extra}
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

      const c = normalizeCharacter(updates);
      
      const [character] = await sql`
        UPDATE characters SET
          name = COALESCE(${c.name}, name),
          title = COALESCE(${c.title === null ? null : c.title || sql`title`}, title),
          fullname = COALESCE(${c.fullname === null ? null : c.fullname || sql`fullname`}, fullname),
          element = COALESCE(${c.element}, element),
          weapon = COALESCE(${c.weapon}, weapon),
          region = COALESCE(${c.region}, region),
          rarity = COALESCE(${c.rarity}, rarity),
          gender = COALESCE(${c.gender === null ? null : c.gender || sql`gender`}, gender),
          affiliation = COALESCE(${c.affiliation === null ? null : c.affiliation || sql`affiliation`}, affiliation),
          constellation = COALESCE(${c.constellation === null ? null : c.constellation || sql`constellation`}, constellation),
          vision = COALESCE(${c.vision === null ? null : c.vision || sql`vision`}, vision),
          dish = COALESCE(${c.dish === null ? null : c.dish || sql`dish`}, dish),
          birthday = COALESCE(${c.birthday === null ? null : c.birthday || sql`birthday`}, birthday),
          va_cn = COALESCE(${c.va_cn}, va_cn),
          va_jp = COALESCE(${c.va_jp}, va_jp),
          description = COALESCE(${c.description === null ? null : c.description || sql`description`}, description),
          artwork = COALESCE(${c.artwork === null ? null : c.artwork || sql`artwork`}, artwork),
          gacha_image = COALESCE(${c.gacha_image === null ? null : c.gacha_image || sql`gacha_image`}, gacha_image),
          portrait = COALESCE(${c.portrait === null ? null : c.portrait || sql`portrait`}, portrait),
          avatar = COALESCE(${c.avatar === null ? null : c.avatar || sql`avatar`}, avatar),
          skill_normal_name = COALESCE(${c.skill_normal_name}, skill_normal_name),
          skill_normal_desc = COALESCE(${c.skill_normal_desc}, skill_normal_desc),
          skill_elemental_name = COALESCE(${c.skill_elemental_name}, skill_elemental_name),
          skill_elemental_desc = COALESCE(${c.skill_elemental_desc}, skill_elemental_desc),
          skill_burst_name = COALESCE(${c.skill_burst_name}, skill_burst_name),
          skill_burst_desc = COALESCE(${c.skill_burst_desc}, skill_burst_desc),
          passive_1_name = COALESCE(${c.passive_1_name}, passive_1_name),
          passive_1_desc = COALESCE(${c.passive_1_desc}, passive_1_desc),
          passive_2_name = COALESCE(${c.passive_2_name}, passive_2_name),
          passive_2_desc = COALESCE(${c.passive_2_desc}, passive_2_desc),
          passive_3_name = COALESCE(${c.passive_3_name}, passive_3_name),
          passive_3_desc = COALESCE(${c.passive_3_desc}, passive_3_desc),
          passive_extra_name = COALESCE(${c.passive_extra_name}, passive_extra_name),
          passive_extra_desc = COALESCE(${c.passive_extra_desc}, passive_extra_desc),
          story_detail = COALESCE(${c.story_detail}, story_detail),
          story_1 = COALESCE(${c.story_1}, story_1),
          story_2 = COALESCE(${c.story_2}, story_2),
          story_3 = COALESCE(${c.story_3}, story_3),
          story_4 = COALESCE(${c.story_4}, story_4),
          story_5 = COALESCE(${c.story_5}, story_5),
          story_vision = COALESCE(${c.story_vision}, story_vision),
          story_extra = COALESCE(${c.story_extra}, story_extra),
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