-- ============================================================
-- DITAMES CMS — Migração: expandir roles
-- Execute no SQL Editor do Supabase após cms-schema.sql
-- ============================================================

-- Adiciona novos valores ao enum cms_role
alter type cms_role add value if not exists 'editor';
alter type cms_role add value if not exists 'moderator';
alter type cms_role add value if not exists 'analyst';
