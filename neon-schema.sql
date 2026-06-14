-- Neon PostgreSQL Schema
-- 在 Neon Console 的 SQL Editor 執行此腳本

-- 角色表
CREATE TABLE characters (
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
  artwork2 TEXT,
  portrait TEXT,
  avatar TEXT,
  skill_normal_name TEXT,
  skill_normal_desc TEXT,
  skill_elemental_name TEXT,
  skill_elemental_desc TEXT,
  skill_burst_name TEXT,
  skill_burst_desc TEXT,
  story TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 圖庫表
CREATE TABLE gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
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