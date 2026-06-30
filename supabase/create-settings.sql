-- ============================================================
-- DITAMES — Tabela settings (Configurações do site)
-- Execute no SQL Editor do Supabase
-- ============================================================

create table if not exists settings (
  id          uuid primary key default uuid_generate_v4(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references cms_users(id) on delete set null,
  key         text not null unique,   -- ex: "phone", "whatsapp_number", "email"
  value       text not null,
  label       text not null,          -- rótulo legível exibido no painel
  group_name  text not null default 'geral'  -- agrupamento visual: "contato", "redes_sociais", "geral"
);

-- ─── TRIGGER: updated_at automático ───────────────────────────
create trigger trg_settings_updated_at
  before update on settings
  for each row execute function update_updated_at();

-- ─── ÍNDICE ────────────────────────────────────────────────────
create index if not exists idx_settings_key on settings(key);
create index if not exists idx_settings_group on settings(group_name);

-- ─── RLS ───────────────────────────────────────────────────────
alter table settings enable row level security;

-- Leitura pública (o site usa esses valores no Footer, contato, etc.)
create policy "Público — settings select" on settings
  for select using (true);

-- Escrita apenas autenticada (com with_check explícito — ver fix-rls-with-check.sql)
create policy "Auth — settings all" on settings
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── DADOS INICIAIS — valores atuais já hardcoded no Footer/services.ts ──
insert into settings (key, value, label, group_name) values
  ('phone',            '(47) 3300-3466',                                                          'Telefone fixo',          'contato'),
  ('whatsapp_number',  '5547996910055',                                                            'Número do WhatsApp',     'contato'),
  ('whatsapp_display', '(47) 9 9691-0055',                                                         'WhatsApp (exibição)',    'contato'),
  ('whatsapp_message', 'Olá, vim pelo site da Ditames',                                            'Mensagem inicial WhatsApp', 'contato'),
  ('email',            'comercial@ditames.com.br',                                                 'E-mail comercial',       'contato'),
  ('address',          'Rua Brasil, 22 — Sumaré, Rio do Sul, SC — CEP 89165-613',                  'Endereço',               'contato'),
  ('instagram_url',    'https://www.instagram.com/ditamesambiental',                               'Instagram',              'redes_sociais'),
  ('linkedin_url',     'https://www.linkedin.com/company/ditames-ambiental/',                      'LinkedIn',               'redes_sociais'),
  ('site_name',        'Ditames Ambiental',                                                        'Nome do site',           'geral'),
  ('founded_at',       '2022-08-16',                                                                'Data de fundação',       'geral')
on conflict (key) do nothing;
