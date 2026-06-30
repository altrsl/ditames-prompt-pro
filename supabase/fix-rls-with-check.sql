-- ============================================================
-- DITAMES — Correção definitiva de RLS (with_check ausente)
--
-- PROBLEMA: todas as policies abaixo foram criadas como
--   for all using (auth.role() = 'authenticated')
-- sem o "with_check" explícito. No Postgres/Supabase isso pode
-- bloquear silenciosamente INSERT e UPDATE mesmo para usuários
-- autenticados, porque o "using" e o "with_check" são avaliados
-- separadamente — sem with_check definido, o comportamento de
-- escrita fica inconsistente.
--
-- Esta migration recria cada policy com using + with_check
-- explícitos e idênticos. Execute uma vez no SQL Editor do Supabase.
-- ============================================================

-- ─── media ───────────────────────────────────────────────────
drop policy if exists "Admin — media" on media;
create policy "Admin — media" on media
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── cases ───────────────────────────────────────────────────
drop policy if exists "Admin — cases" on cases;
create policy "Admin — cases" on cases
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── faq ─────────────────────────────────────────────────────
drop policy if exists "Admin — faq" on faq;
create policy "Admin — faq" on faq
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── services ────────────────────────────────────────────────
drop policy if exists "Admin — services" on services;
create policy "Admin — services" on services
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── homepage_content ────────────────────────────────────────
drop policy if exists "Admin — homepage_content" on homepage_content;
create policy "Admin — homepage_content" on homepage_content
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── cms_users (mesma checagem, por segurança) ──────────────
drop policy if exists "Auth — cms_users all" on cms_users;
create policy "Auth — cms_users all" on cms_users
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- NOTA: news e blog_posts já foram corrigidas manualmente
-- nesta sessão (drop/create com with_check). Incluídas aqui
-- novamente apenas para tornar este script idempotente e
-- seguro de rodar do zero em qualquer ambiente novo.

drop policy if exists "Auth — news all" on news;
create policy "Auth — news all" on news
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin — blog_posts" on blog_posts;
create policy "Admin — blog_posts" on blog_posts
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── VALIDAÇÃO ───────────────────────────────────────────────
-- Rode esta query depois para confirmar que with_check não está mais nulo:
-- select tablename, policyname, cmd, with_check
-- from pg_policies
-- where schemaname = 'public' and cmd = 'ALL';
