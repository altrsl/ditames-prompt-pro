-- ============================================================
-- DITAMES — Tabela leads (Recepcionista Ambiental)
-- Execute no SQL Editor do Supabase
-- ============================================================

create table if not exists leads (
  id                uuid primary key default uuid_generate_v4(),
  created_at        timestamptz not null default now(),
  conversation       jsonb not null default '[]'::jsonb,  -- histórico completo: [{role, text}]
  summary           text,                                  -- resumo gerado para o WhatsApp
  service_suggested text,                                  -- serviço recomendado pela IA, se identificado
  status            text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  forwarded_to_whatsapp boolean not null default false
);

-- ─── ÍNDICES ─────────────────────────────────────────────────
create index if not exists idx_leads_created_at on leads(created_at desc);
create index if not exists idx_leads_status on leads(status);

-- ─── RLS ───────────────────────────────────────────────────────
alter table leads enable row level security;

-- Qualquer visitante pode CRIAR um lead (a IA grava em nome do usuário anônimo do site)
create policy "Público — leads insert" on leads
  for insert
  with check (true);

-- Apenas usuários autenticados (equipe Ditames) podem visualizar e gerenciar
create policy "Auth — leads select" on leads
  for select
  using (auth.role() = 'authenticated');

create policy "Auth — leads update" on leads
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Auth — leads delete" on leads
  for delete
  using (auth.role() = 'authenticated');
