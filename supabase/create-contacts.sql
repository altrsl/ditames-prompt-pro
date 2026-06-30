-- ============================================================
-- DITAMES — Tabela contacts (Formulário de Contato)
-- Execute no SQL Editor do Supabase
-- ============================================================

create table if not exists contacts (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  phone       text,
  service     text,
  message     text not null,
  source      text not null default 'site_form',  -- 'site_form' | 'recepcionista_ia'
  status      text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  forwarded_to_whatsapp boolean not null default false
);

-- ─── ÍNDICES ─────────────────────────────────────────────────
create index if not exists idx_contacts_created_at on contacts(created_at desc);
create index if not exists idx_contacts_status on contacts(status);

-- ─── RLS ───────────────────────────────────────────────────────
alter table contacts enable row level security;

-- Qualquer visitante do site pode CRIAR um contato (formulário público)
-- mas não pode ler, atualizar ou apagar os contatos de outras pessoas.
create policy "Público — contacts insert" on contacts
  for insert
  with check (true);

-- Apenas usuários autenticados (equipe Ditames) podem visualizar e gerenciar
create policy "Auth — contacts select" on contacts
  for select
  using (auth.role() = 'authenticated');

create policy "Auth — contacts update" on contacts
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Auth — contacts delete" on contacts
  for delete
  using (auth.role() = 'authenticated');
