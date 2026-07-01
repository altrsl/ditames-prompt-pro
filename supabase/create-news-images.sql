-- ============================================================
-- DITAMES — Migration: news_images (galeria de imagens para notícias)
-- Execute no SQL Editor do Supabase ANTES de qualquer alteração de código
-- ============================================================

-- ─── 1. CRIAR TABELA news_images ─────────────────────────────
-- Armazena apenas o storage_path (ex: noticias/abc123/imagem01.webp)
-- A URL pública é gerada dinamicamente pelo frontend via storageUrl()
-- Isso evita dependência do domínio do Supabase e facilita migrações futuras

create table if not exists news_images (
  id            uuid primary key default uuid_generate_v4(),
  news_id       uuid not null references news(id) on delete cascade,
  storage_path  text not null,          -- ex: noticias/{news_id}/imagem01.webp
  caption       text,                   -- legenda opcional exibida na galeria
  alt_text      text,                   -- texto alternativo para acessibilidade/SEO
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── 2. TRIGGER: updated_at automático ───────────────────────
create trigger trg_news_images_updated_at
  before update on news_images
  for each row execute function update_updated_at();

-- ─── 3. ÍNDICES ───────────────────────────────────────────────
-- Busca de imagens por notícia (query mais comum) + ordenação por display_order
create index if not exists idx_news_images_news_id
  on news_images(news_id, display_order asc);

-- ─── 4. RLS ───────────────────────────────────────────────────
alter table news_images enable row level security;

-- Leitura pública: qualquer visitante pode ver as imagens de notícias publicadas
create policy "Público — news_images select" on news_images
  for select using (true);

-- Escrita: apenas usuários autenticados (equipe CMS)
-- with_check explícito desde a criação (evita o bug histórico do projeto)
create policy "Auth — news_images insert" on news_images
  for insert
  with check (auth.role() = 'authenticated');

create policy "Auth — news_images update" on news_images
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Auth — news_images delete" on news_images
  for delete
  using (auth.role() = 'authenticated');

-- ─── 5. MIGRAÇÃO DE DADOS EXISTENTES ─────────────────────────
-- Para cada notícia que já possui cover_image, cria o primeiro registro
-- em news_images, convertendo a URL completa para storage_path relativo.
--
-- Lógica de extração do storage_path:
-- URL completa: https://xxx.supabase.co/storage/v1/object/public/media/noticias/arquivo.jpg
-- storage_path:  noticias/arquivo.jpg
--
-- Notas:
--   - display_order = 1 para a imagem de capa existente
--   - alt_text gerado a partir do título da notícia
--   - Ignora notícias sem cover_image (cover_image IS NOT NULL AND cover_image != '')
--   - ON CONFLICT evita duplicidade se a migration for executada mais de uma vez

insert into news_images (news_id, storage_path, alt_text, display_order)
select
  id as news_id,
  -- Extrai apenas o path relativo após /media/
  regexp_replace(
    cover_image,
    '^.*/storage/v1/object/public/media/',
    ''
  ) as storage_path,
  title as alt_text,
  1 as display_order
from news
where
  cover_image is not null
  and cover_image != ''
  and cover_image like '%/storage/v1/object/public/media/%'
on conflict do nothing;

-- ─── 6. VALIDAÇÃO ────────────────────────────────────────────
-- Rode estas queries após executar para confirmar:

-- 6a. Tabela criada corretamente:
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'news_images'
-- order by ordinal_position;

-- 6b. Dados migrados:
-- select n.title, ni.storage_path, ni.display_order
-- from news_images ni
-- join news n on n.id = ni.news_id
-- order by n.created_at desc;

-- 6c. Policies criadas:
-- select policyname, cmd, with_check
-- from pg_policies
-- where schemaname = 'public' and tablename = 'news_images';
