const { sql } = require('../lib/db');

const STORY_FIELDS = ['story_detail', 'story_1', 'story_2', 'story_3', 'story_4', 'story_5', 'story_vision', 'story_extra'];

function getCharacterFields() {
  return [
    'name', 'title', 'fullname', 'element', 'weapon', 'region', 'rarity', 'gender',
    'affiliation', 'constellation', 'vision', 'dish', 'birthday',
    'va_cn', 'va_jp', 'description', 'artwork', 'gacha_image', 'portrait', 'avatar',
    'skill_normal_name', 'skill_normal_desc', 'skill_elemental_name', 'skill_elemental_desc', 'skill_burst_name', 'skill_burst_desc',
    'constellations', 'custom_images', 'normal_voices', 'combat_voices', 'model_type', 'model_url',
    'passives',
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
    avatar_position: c.avatarPosition || c.avatar_position || null,
    avatar_scale: c.avatarScale || c.avatar_scale || null,
    skill_normal_name: c.skillNormalName || c.skill_normal_name || null,
    skill_normal_desc: c.skillNormalDesc || c.skill_normal_desc || null,
    skill_normal_icon: c.skillNormalIcon || c.skill_normal_icon || null,
    skill_normal_table: c.skillNormalTable || c.skill_normal_table || null,
    skill_elemental_name: c.skillElementalName || c.skill_elemental_name || null,
    skill_elemental_desc: c.skillElementalDesc || c.skill_elemental_desc || null,
    skill_elemental_icon: c.skillElementalIcon || c.skill_elemental_icon || null,
    skill_elemental_table: c.skillElementalTable || c.skill_elemental_table || null,
    skill_burst_name: c.skillBurstName || c.skill_burst_name || null,
    skill_burst_desc: c.skillBurstDesc || c.skill_burst_desc || null,
    skill_burst_icon: c.skillBurstIcon || c.skill_burst_icon || null,
    skill_burst_table: c.skillBurstTable || c.skill_burst_table || null,
    constellations: c.constellations || null,
    custom_images: c.customImages || c.custom_images || null,
    normal_voices: c.normalVoices || c.normal_voices || null,
    combat_voices: c.combatVoices || c.combat_voices || null,
    model_type: c.modelType || c.model_type || null,
    model_url: c.modelUrl || c.model_url || null,
    passives: c.passives && Array.isArray(c.passives) && c.passives.length > 0 ? JSON.stringify(c.passives) : null,
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
          avatar_position, avatar_scale,
          skill_normal_name, skill_normal_desc, skill_normal_icon, skill_normal_table,
          skill_elemental_name, skill_elemental_desc, skill_elemental_icon, skill_elemental_table,
          skill_burst_name, skill_burst_desc, skill_burst_icon, skill_burst_table,
          constellations, custom_images, normal_voices, combat_voices, model_type, model_url,
          passives,
          story_detail, story_1, story_2, story_3, story_4, story_5, story_vision, story_extra
        ) VALUES (
          ${c.name}, ${c.title}, ${c.fullname},
          ${c.element}, ${c.weapon}, ${c.region}, ${c.rarity}, ${c.gender},
          ${c.affiliation}, ${c.constellation}, ${c.vision},
          ${c.dish}, ${c.birthday},
          ${c.va_cn}, ${c.va_jp},
          ${c.description}, ${c.artwork}, ${c.gacha_image}, ${c.portrait}, ${c.avatar},
          ${c.avatar_position}, ${c.avatar_scale},
          ${c.skill_normal_name}, ${c.skill_normal_desc}, ${c.skill_normal_icon}, ${c.skill_normal_table},
          ${c.skill_elemental_name}, ${c.skill_elemental_desc}, ${c.skill_elemental_icon}, ${c.skill_elemental_table},
          ${c.skill_burst_name}, ${c.skill_burst_desc}, ${c.skill_burst_icon}, ${c.skill_burst_table},
          ${c.constellations}, ${c.custom_images}, ${c.normal_voices}, ${c.combat_voices}, ${c.model_type}, ${c.model_url},
          ${c.passives},
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
          title = ${c.title},
          fullname = ${c.fullname},
          element = COALESCE(${c.element}, element),
          weapon = COALESCE(${c.weapon}, weapon),
          region = COALESCE(${c.region}, region),
          rarity = COALESCE(${c.rarity}, rarity),
          gender = ${c.gender},
          affiliation = ${c.affiliation},
          constellation = ${c.constellation},
          vision = ${c.vision},
          dish = ${c.dish},
          birthday = ${c.birthday},
          va_cn = COALESCE(${c.va_cn}, va_cn),
          va_jp = COALESCE(${c.va_jp}, va_jp),
          description = ${c.description},
          artwork = ${c.artwork},
          gacha_image = ${c.gacha_image},
          portrait = ${c.portrait},
          avatar = ${c.avatar},
          avatar_position = ${c.avatar_position},
          avatar_scale = ${c.avatar_scale},
          skill_normal_name = COALESCE(${c.skill_normal_name}, skill_normal_name),
          skill_normal_desc = COALESCE(${c.skill_normal_desc}, skill_normal_desc),
          skill_normal_icon = ${c.skill_normal_icon},
          skill_normal_table = COALESCE(${c.skill_normal_table}, skill_normal_table),
          skill_elemental_name = COALESCE(${c.skill_elemental_name}, skill_elemental_name),
          skill_elemental_desc = COALESCE(${c.skill_elemental_desc}, skill_elemental_desc),
          skill_elemental_icon = ${c.skill_elemental_icon},
          skill_elemental_table = COALESCE(${c.skill_elemental_table}, skill_elemental_table),
          skill_burst_name = COALESCE(${c.skill_burst_name}, skill_burst_name),
          skill_burst_desc = COALESCE(${c.skill_burst_desc}, skill_burst_desc),
          skill_burst_icon = ${c.skill_burst_icon},
          skill_burst_table = COALESCE(${c.skill_burst_table}, skill_burst_table),
          constellations = COALESCE(${c.constellations}, constellations),
          custom_images = COALESCE(${c.custom_images}, custom_images),
          normal_voices = COALESCE(${c.normal_voices}, normal_voices),
          combat_voices = COALESCE(${c.combat_voices}, combat_voices),
          model_type = COALESCE(${c.model_type}, model_type),
          model_url = COALESCE(${c.model_url}, model_url),
          passives = COALESCE(${c.passives}, passives),
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