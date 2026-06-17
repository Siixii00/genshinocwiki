-- Neon PostgreSQL Schema
-- 在 Neon Console 的 SQL Editor 執行此腳本

-- ============================================
-- 如果資料庫已存在，執行以下 MIGRATION
-- ============================================

-- 新增缺少的欄位（如果不存在）
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'image';
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS image_position INTEGER DEFAULT 50;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 遷移舊的 image_url 到 url
UPDATE gallery SET url = image_url WHERE url IS NULL AND image_url IS NOT NULL;

-- 刪除舊欄位（可選，建議備份後執行）
-- ALTER TABLE gallery DROP COLUMN IF EXISTS image_url;

-- ============================================
-- 建立新表（如果不存在）
-- ============================================

-- 角色表
CREATE TABLE IF NOT EXISTS characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  fullname TEXT,
  element TEXT NOT NULL,
  weapon TEXT NOT NULL,
  region TEXT NOT NULL,
  rarity INTEGER NOT NULL,
  gender TEXT,
  affiliation TEXT,
  constellation TEXT,
  vision TEXT,
  dish TEXT,
  birthday TEXT,
  va_cn TEXT,
  va_jp TEXT,
  description TEXT,
  artwork TEXT,
  gacha_image TEXT,
  portrait TEXT,
  avatar TEXT,
  skill_normal_name TEXT,
  skill_normal_desc TEXT,
  skill_elemental_name TEXT,
  skill_elemental_desc TEXT,
  skill_burst_name TEXT,
  skill_burst_desc TEXT,
  passive_1_name TEXT,
  passive_1_desc TEXT,
  passive_2_name TEXT,
  passive_2_desc TEXT,
  passive_3_name TEXT,
  passive_3_desc TEXT,
  passive_extra_name TEXT,
  passive_extra_desc TEXT,
  story_detail TEXT,
  story_1 TEXT,
  story_2 TEXT,
  story_3 TEXT,
  story_4 TEXT,
  story_5 TEXT,
  story_vision TEXT,
  story_extra TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE characters ADD COLUMN IF NOT EXISTS gacha_image TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS passive_1_name TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS passive_1_desc TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS passive_2_name TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS passive_2_desc TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS passive_3_name TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS passive_3_desc TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS passive_extra_name TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS passive_extra_desc TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS story_detail TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS story_1 TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS story_2 TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS story_3 TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS story_4 TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS story_5 TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS story_vision TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS story_extra TEXT;

ALTER TABLE characters ADD COLUMN IF NOT EXISTS constellations JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS custom_images JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS normal_voices JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS combat_voices JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS model_type TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS model_url TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS passives JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS avatar_position TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS avatar_scale TEXT;

ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_normal_icon TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_normal_table JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_elemental_icon TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_elemental_table JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_burst_icon TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_burst_table JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS constellation_image TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS constellation_bg_settings JSONB;

ALTER TABLE characters ADD COLUMN IF NOT EXISTS screenshots JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS dish_data JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS guide JSONB;

-- 圖庫表
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  type TEXT DEFAULT 'image',
  category TEXT,
  date TEXT,
  image_position INTEGER DEFAULT 50,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_gallery_updated_at
  BEFORE UPDATE ON gallery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 設定表（存儲 TOTP 密鑰等）
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT,
  category TEXT NOT NULL,
  main_image TEXT,
  images JSONB DEFAULT '[]',
  description TEXT,
  link TEXT,
  image_position INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS image_position INTEGER DEFAULT 50;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();