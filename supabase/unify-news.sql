-- ============================================================
-- DITAMES — Migração de unificação: news_posts → news
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. Migrar dados existentes de news_posts para news (se houver)
INSERT INTO news (
  slug, title, excerpt, content,
  category, cover_image, status, published_at,
  read_time, seo_title, seo_description,
  source, created_at, updated_at
)
SELECT
  slug, title, excerpt, body,
  category, cover_url,
  CASE WHEN published THEN 'published'::news_status ELSE 'draft'::news_status END,
  published_at, read_time, seo_title, seo_description,
  'manual'::news_source, created_at, updated_at
FROM news_posts
ON CONFLICT (slug) DO NOTHING;

-- 2. Adicionar campo body à tabela news para compatibilidade de leitura
-- (alias de content para o frontend existente)
ALTER TABLE news ADD COLUMN IF NOT EXISTS body text
  GENERATED ALWAYS AS (content) STORED;

-- 3. Adicionar campo cover_url à tabela news (alias de cover_image)
ALTER TABLE news ADD COLUMN IF NOT EXISTS cover_url text
  GENERATED ALWAYS AS (cover_image) STORED;

-- 4. Adicionar campo published à tabela news (boolean derivado do status)
ALTER TABLE news ADD COLUMN IF NOT EXISTS published boolean
  GENERATED ALWAYS AS (status = 'published') STORED;

-- 5. Índice para leitura pública por status
CREATE INDEX IF NOT EXISTS idx_news_published_at
  ON news(published_at DESC) WHERE status = 'published';
