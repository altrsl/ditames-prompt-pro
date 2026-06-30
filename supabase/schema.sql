-- ============================================================
-- DITAMES AMBIENTAL — Schema completo do banco de dados
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- Habilitar extensão UUID
create extension if not exists "uuid-ossp";

-- ─── ENUMS ───────────────────────────────────────────────────
create type media_category as enum (
  'cases', 'blog', 'noticias', 'servicos', 'homepage', 'geral'
);

create type content_type as enum ('text', 'html', 'image_id');

-- ─── TABELA: media ───────────────────────────────────────────
-- Centraliza todas as imagens do site
create table if not exists media (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  filename      text not null,
  storage_path  text not null unique,        -- ex: "cases/logo-madefrahm.webp"
  public_url    text not null,               -- URL pública completa do Supabase Storage
  alt_text      text,
  category      media_category not null default 'geral',
  width         integer,
  height        integer,
  size_bytes    bigint,
  mime_type     text,
  uploaded_by   uuid references auth.users(id) on delete set null
);

-- ─── TABELA: cases ───────────────────────────────────────────
create table if not exists cases (
  id             uuid primary key default uuid_generate_v4(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  name           text not null,
  sector         text not null,
  description    text,
  logo_media_id  uuid references media(id) on delete set null,
  logo_url       text,                       -- URL temporária (texto ou imagem externa)
  published      boolean not null default true,
  order_index    integer not null default 0,
  slug           text unique
);

-- ─── TABELA: blog_posts ──────────────────────────────────────
create table if not exists blog_posts (
  id               uuid primary key default uuid_generate_v4(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  slug             text not null unique,
  title            text not null,
  excerpt          text not null,
  body             text not null default '',
  category         text not null default 'Geral',
  read_time        text not null default '5 min de leitura',
  cover_media_id   uuid references media(id) on delete set null,
  cover_url        text,
  published        boolean not null default false,
  published_at     timestamptz,
  author           text,
  seo_title        text,
  seo_description  text
);

-- ─── TABELA: news_posts (OBSOLETA — NÃO USE) ──────────────────
-- Substituída definitivamente pela tabela "news" (ver cms-schema.sql).
-- Mantida temporariamente apenas para migração de dados históricos.
-- Execute supabase/finalize-publications.sql para migrar e depois remova esta tabela.
create table if not exists news_posts (
  id               uuid primary key default uuid_generate_v4(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  slug             text not null unique,
  title            text not null,
  excerpt          text not null,
  body             text not null default '',
  category         text not null default 'Institucional',
  read_time        text not null default '3 min de leitura',
  cover_media_id   uuid references media(id) on delete set null,
  cover_url        text,
  published        boolean not null default false,
  published_at     timestamptz,
  seo_title        text,
  seo_description  text
);

-- ─── TABELA: faq ─────────────────────────────────────────────
create table if not exists faq (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  question     text not null,
  answer       text not null,
  order_index  integer not null default 0,
  published    boolean not null default true
);

-- ─── TABELA: services ────────────────────────────────────────
create table if not exists services (
  id               uuid primary key default uuid_generate_v4(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  slug             text not null unique,
  title            text not null,
  short            text not null,
  what_is          text not null default '',
  when_needed      text[] not null default '{}',
  steps            text[] not null default '{}',
  keywords         text[] not null default '{}',
  icon_name        text not null default 'Leaf',
  cover_media_id   uuid references media(id) on delete set null,
  published        boolean not null default true,
  order_index      integer not null default 0,
  seo_title        text,
  seo_description  text
);

-- ─── TABELA: homepage_content ────────────────────────────────
-- Textos editáveis da homepage sem precisar de código
create table if not exists homepage_content (
  id          uuid primary key default uuid_generate_v4(),
  updated_at  timestamptz not null default now(),
  key         text not null unique,   -- ex: "hero_title", "numeros_clientes"
  value       text not null,
  type        content_type not null default 'text'
);

-- ─── TRIGGERS: updated_at automático ─────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_media_updated_at
  before update on media
  for each row execute function update_updated_at();

create trigger trg_cases_updated_at
  before update on cases
  for each row execute function update_updated_at();

create trigger trg_blog_updated_at
  before update on blog_posts
  for each row execute function update_updated_at();

create trigger trg_news_updated_at
  before update on news_posts
  for each row execute function update_updated_at();

create trigger trg_faq_updated_at
  before update on faq
  for each row execute function update_updated_at();

create trigger trg_services_updated_at
  before update on services
  for each row execute function update_updated_at();

create trigger trg_homepage_updated_at
  before update on homepage_content
  for each row execute function update_updated_at();

-- ─── ÍNDICES ─────────────────────────────────────────────────
create index if not exists idx_media_category        on media(category);
create index if not exists idx_cases_order           on cases(order_index) where published = true;
create index if not exists idx_blog_published        on blog_posts(published_at desc) where published = true;
create index if not exists idx_news_published        on news_posts(published_at desc) where published = true;
create index if not exists idx_faq_order             on faq(order_index) where published = true;
create index if not exists idx_services_order        on services(order_index) where published = true;
create index if not exists idx_homepage_key          on homepage_content(key);

-- ─── ROW LEVEL SECURITY (RLS) ────────────────────────────────
-- Leitura pública para o site funcionar sem autenticação
-- Escrita apenas para usuários autenticados (painel admin)

alter table media             enable row level security;
alter table cases             enable row level security;
alter table blog_posts        enable row level security;
alter table news_posts        enable row level security;
alter table faq               enable row level security;
alter table services          enable row level security;
alter table homepage_content  enable row level security;

-- Leitura pública (SELECT)
create policy "Leitura pública — media"            on media            for select using (true);
create policy "Leitura pública — cases"            on cases            for select using (true);
create policy "Leitura pública — blog_posts"       on blog_posts       for select using (true);
create policy "Leitura pública — news_posts"       on news_posts       for select using (true);
create policy "Leitura pública — faq"              on faq              for select using (true);
create policy "Leitura pública — services"         on services         for select using (true);
create policy "Leitura pública — homepage_content" on homepage_content for select using (true);

-- Escrita autenticada (INSERT, UPDATE, DELETE)
create policy "Admin — media"            on media            for all using (auth.role() = 'authenticated');
create policy "Admin — cases"            on cases            for all using (auth.role() = 'authenticated');
create policy "Admin — blog_posts"       on blog_posts       for all using (auth.role() = 'authenticated');
create policy "Admin — news_posts"       on news_posts       for all using (auth.role() = 'authenticated');
create policy "Admin — faq"              on faq              for all using (auth.role() = 'authenticated');
create policy "Admin — services"         on services         for all using (auth.role() = 'authenticated');
create policy "Admin — homepage_content" on homepage_content for all using (auth.role() = 'authenticated');

-- ─── DADOS INICIAIS: cases ───────────────────────────────────
insert into cases (name, sector, description, order_index) values
  ('Madefrahm',              'Indústria moveleira',      'Regularização ambiental de empreendimento industrial.',    1),
  ('Metalúrgica Riosulense', 'Metalurgia',               'Apoio contínuo em processos de licenciamento.',            2),
  ('BIOCAL',                 'Insumos agrícolas',        'Estudos ambientais e suporte técnico.',                    3),
  ('Elber',                  'Refrigeração industrial',  'Gestão ambiental recorrente.',                             4),
  ('Prefabricar',            'Construção',               'Licenciamento e regularização de canteiro de obras.',      5),
  ('Construtora Sul',        'Empreendimentos',          'Estudos de impacto ambiental e aprovações.',               6),
  ('Loteadora Vale',         'Loteamentos urbanos',      'Gestão ambiental integrada de loteamento.',                7),
  ('Agro Catarinense',       'Agronegócio',              'Regularização fundiária e ambiental de propriedade rural.',8);

-- ─── DADOS INICIAIS: faq ─────────────────────────────────────
insert into faq (question, answer, order_index) values
  ('Ganhei uma multa ambiental. O que devo fazer?',
   'O primeiro passo é entender a origem e o embasamento legal da multa. A Ditames pode analisar o auto de infração, identificar as obrigações envolvidas e orientar sobre as possibilidades de defesa administrativa, regularização ou cumprimento de exigências. Cada situação é única e merece análise técnica especializada.',
   1),
  ('Como regularizar uma área rural?',
   'A regularização de áreas rurais envolve etapas como Cadastro Ambiental Rural (CAR), georreferenciamento, identificação de Áreas de Preservação Permanente (APP), Reserva Legal e, quando necessário, Programa de Regularização Ambiental (PRA). A Ditames conduz todo esse processo de forma integrada.',
   2),
  ('O que acontece quando existe uma APP na propriedade?',
   'Áreas de Preservação Permanente (APP) possuem restrições de uso estabelecidas pelo Código Florestal. Dependendo da situação — margem de rio, encosta, nascente — é necessário identificar as obrigações, avaliar passivos e, quando cabível, conduzir processos de recuperação ou regularização junto aos órgãos ambientais.',
   3),
  ('Como funciona um licenciamento ambiental?',
   'O licenciamento ambiental é o processo pelo qual o poder público autoriza a instalação e operação de atividades potencialmente poluidoras. Dependendo da atividade e do porte, pode envolver Licença Prévia (LP), Licença de Instalação (LI) e Licença de Operação (LO). A Ditames elabora os estudos necessários e conduz todo o processo junto aos órgãos competentes.',
   4),
  ('Preciso de autorização para suprimir vegetação?',
   'Sim, em grande parte dos casos. A supressão de vegetação nativa exige autorização do órgão ambiental estadual ou federal, dependendo do bioma e da área. A Ditames realiza o levantamento florístico, elabora o requerimento técnico e acompanha o processo de aprovação.',
   5),
  ('Tenho uma nascente na propriedade. O que fazer?',
   'Nascentes são protegidas pelo Código Florestal e exigem manutenção de faixa de APP ao redor. É necessário identificá-las corretamente no Cadastro Ambiental Rural e, caso haja ocupação indevida, conduzir processo de regularização. A Ditames realiza o mapeamento e orienta sobre as obrigações legais.',
   6),
  ('Como regularizar um loteamento?',
   'A regularização de loteamentos envolve aspectos fundiários, urbanísticos e ambientais. A Ditames apoia desde a elaboração de estudos ambientais e topográficos até a aprovação nos órgãos competentes, passando por licenciamento, elaboração de projetos de drenagem, arborização e demais exigências técnicas.',
   7),
  ('Como saber se minha atividade precisa de licenciamento?',
   'A necessidade de licenciamento depende da natureza, porte e localização da atividade. A Ditames realiza o enquadramento da atividade na legislação estadual e federal e orienta sobre os procedimentos necessários, evitando surpresas e autuações futuras.',
   8);

-- ─── DADOS INICIAIS: homepage_content ───────────────────────
insert into homepage_content (key, value, type) values
  ('numeros_anos',          '4',    'text'),
  ('numeros_clientes',      '687',  'text'),
  ('numeros_municipios',    '47',   'text'),
  ('numeros_profissionais', '40',   'text');

-- ─── STORAGE: criar buckets ──────────────────────────────────
-- Execute separadamente via Dashboard → Storage → New bucket
-- Ou via API (veja instruções abaixo)
--
-- Buckets necessários:
--   • "media"  → público → para todas as imagens do site
--
-- Política do bucket "media":
--   SELECT: público (qualquer um pode ver)
--   INSERT/UPDATE/DELETE: apenas autenticados
