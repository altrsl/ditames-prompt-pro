-- ============================================================
-- DITAMES — Migração definitiva: estrutura completa de publicações
-- Execute no SQL Editor do Supabase, NESTA ORDEM, após schema.sql e cms-schema.sql
-- ============================================================

-- ─── 1. MIGRAR DADOS ANTIGOS (se news_posts tiver conteúdo real) ──
INSERT INTO news (
  slug, title, excerpt, content, category, cover_image,
  status, published_at, read_time, seo_title, seo_description,
  source, created_at, updated_at
)
SELECT
  slug, title, excerpt, body, category, cover_url,
  CASE WHEN published THEN 'published'::news_status ELSE 'draft'::news_status END,
  published_at, read_time, seo_title, seo_description,
  'manual'::news_source, created_at, updated_at
FROM news_posts
ON CONFLICT (slug) DO NOTHING;

-- ─── 2. COMPLETAR ESTRUTURA DE "news" ──────────────────────────
ALTER TABLE news ADD COLUMN IF NOT EXISTS author text;
ALTER TABLE news ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}';

-- ─── 3. COMPLETAR ESTRUTURA DE "blog_posts" ────────────────────
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES cms_users(id) ON DELETE SET NULL;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES cms_users(id) ON DELETE SET NULL;

-- ─── 4. REMOVER TABELA OBSOLETA news_posts ─────────────────────
-- Só execute esta linha DEPOIS de confirmar que os dados foram migrados (passo 1)
-- e que o site está lendo corretamente da tabela "news".
-- DROP TABLE IF EXISTS news_posts;
-- (deixado comentado por segurança — remova o comentário quando quiser apagar definitivamente)

-- ─── 5. ÍNDICES DE PERFORMANCE ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_news_status_published_at
  ON news(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_published_at
  ON blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- ─── 6. VALIDAÇÃO ────────────────────────────────────────────────
-- Rode estas queries após a migration para conferir:
-- SELECT count(*) FROM news;
-- SELECT count(*) FROM blog_posts;
-- SELECT id, title, status, source FROM news ORDER BY created_at DESC LIMIT 5;
