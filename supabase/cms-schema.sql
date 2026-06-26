-- ============================================================
-- DITAMES CMS — Schema Fase 1 + Fase 2
-- Execute no SQL Editor do Supabase APÓS o schema.sql base
-- ============================================================

-- ─── ENUM: roles ─────────────────────────────────────────────
create type cms_role as enum ('director', 'dev');

-- ─── ENUM: news status ───────────────────────────────────────
create type news_status as enum ('published', 'draft', 'archived');

-- ─── ENUM: news source ───────────────────────────────────────
create type news_source as enum ('manual', 'instagram');

-- ─── TABELA: cms_users ───────────────────────────────────────
-- Usuários do painel CMS (separado do auth.users do Supabase)
-- O Supabase Auth gerencia a autenticação; esta tabela guarda metadados e permissões
create table if not exists cms_users (
  id              uuid primary key references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  name            text not null,
  email           text not null unique,
  role            cms_role not null default 'dev',
  status          text not null default 'active' check (status in ('active', 'inactive')),
  permissions     jsonb not null default '{}'::jsonb
  -- permissions shape:
  -- {
  --   "edit_homepage": true,
  --   "edit_homepage_images": true,
  --   "edit_cases": true,
  --   "create_edit_news": true,
  --   "create_edit_blog": true,
  --   "create_edit_services": true,
  --   "edit_seo": true,
  --   "create_users": true,
  --   "edit_users": true,
  --   "remove_users": true,
  --   "manage_permissions": true,
  --   "view_audit_log": true,
  --   "publish_archive_content": true
  -- }
);

-- ─── TABELA: audit_logs ──────────────────────────────────────
create table if not exists audit_logs (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  user_id         uuid references cms_users(id) on delete set null,
  user_name       text,                    -- snapshot do nome no momento da ação
  action          text not null,           -- 'create' | 'update' | 'delete' | 'publish' | 'archive' | 'login'
  module          text not null,           -- 'news' | 'blog' | 'cases' | 'faq' | 'services' | 'users' | 'homepage'
  record_id       text,                    -- id do registro afetado
  field           text,                    -- campo específico alterado
  previous_value  text,                    -- valor anterior (serializado)
  new_value       text,                    -- valor novo (serializado)
  metadata        jsonb default '{}'::jsonb
);

-- ─── TABELA: news ────────────────────────────────────────────
-- Substituirá news_posts para suportar Instagram + manual
create table if not exists news (
  id                  uuid primary key default uuid_generate_v4(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  title               text not null,
  content             text not null default '',
  excerpt             text not null default '',
  slug                text unique,
  category            text not null default 'Institucional',
  cover_image         text,                -- URL da imagem de capa
  images              text[] not null default '{}',  -- todas as URLs de imagens
  source              news_source not null default 'manual',
  instagram_post_id   text unique,         -- ID único do post no Instagram (previne duplicidade)
  instagram_url       text,                -- URL do post original
  status              news_status not null default 'draft',
  published_at        timestamptz,
  read_time           text not null default '3 min de leitura',
  created_by          uuid references cms_users(id) on delete set null,
  updated_by          uuid references cms_users(id) on delete set null,
  seo_title           text,
  seo_description     text
);

-- ─── TRIGGERS: updated_at ────────────────────────────────────
create trigger trg_cms_users_updated_at
  before update on cms_users
  for each row execute function update_updated_at();

create trigger trg_news_updated_at
  before update on news
  for each row execute function update_updated_at();

-- ─── ÍNDICES ─────────────────────────────────────────────────
create index if not exists idx_audit_logs_user       on audit_logs(user_id);
create index if not exists idx_audit_logs_module     on audit_logs(module);
create index if not exists idx_audit_logs_created    on audit_logs(created_at desc);
create index if not exists idx_news_status           on news(status);
create index if not exists idx_news_source           on news(source);
create index if not exists idx_news_instagram_id     on news(instagram_post_id) where instagram_post_id is not null;
create index if not exists idx_news_published        on news(published_at desc) where status = 'published';

-- ─── RLS ─────────────────────────────────────────────────────
alter table cms_users   enable row level security;
alter table audit_logs  enable row level security;
alter table news        enable row level security;

-- cms_users: só autenticados leem/escrevem
create policy "Auth — cms_users select"  on cms_users  for select using (auth.role() = 'authenticated');
create policy "Auth — cms_users all"     on cms_users  for all    using (auth.role() = 'authenticated');

-- audit_logs: só autenticados leem; insert via service role (server-side)
create policy "Auth — audit_logs select" on audit_logs for select using (auth.role() = 'authenticated');
create policy "Auth — audit_logs insert" on audit_logs for insert with check (auth.role() = 'authenticated');

-- news: leitura pública (publicadas), escrita autenticada
create policy "Público — news select published" on news for select using (status = 'published' or auth.role() = 'authenticated');
create policy "Auth — news all"                 on news for all    using (auth.role() = 'authenticated');
