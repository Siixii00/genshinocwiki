-- Neon PostgreSQL Schema
-- 在 Neon Console 的 SQL Editor 執行此腳本

-- ============================================
-- 如果資料庫已存在，執行以下 MIGRATION
-- ============================================

-- 新增缺少的欄位（如果不存在）
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'image';
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS date TEXT;

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
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  type TEXT DEFAULT 'image',
  category TEXT,
  date TEXT,
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