/**
 * Ditames — Queries Supabase
 * Funções prontas para buscar dados do banco em qualquer componente/rota.
 */

import { supabase } from "./supabase";
import type { CaseRow, BlogPostRow, NewsPostRow, FaqRow, ServiceRow } from "./database.types";

// ─── CASES ────────────────────────────────────────────────────

export async function getCases(): Promise<CaseRow[]> {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("published", true)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getCaseBySlug(slug: string): Promise<CaseRow | null> {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

// ─── BLOG ─────────────────────────────────────────────────────

export async function getBlogPosts(limit?: number): Promise<BlogPostRow[]> {
  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostRow | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) return null;
  return data;
}

export async function getBlogCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("category")
    .eq("published", true);

  if (error) return [];
  return [...new Set(data?.map((p) => p.category) ?? [])];
}

// ─── NOTÍCIAS (tabela: news) ──────────────────────────────────
// IMPORTANTE: a tabela "news_posts" está obsoleta.
// Todas as queries de notícias usam a tabela "news" com status enum.

export async function getNewsPosts(limit?: number) {
  let query = supabase
    .from("news")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getNewsPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data;
}

// ─── FAQ ──────────────────────────────────────────────────────

export async function getFaq(): Promise<FaqRow[]> {
  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .eq("published", true)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ─── SERVIÇOS ─────────────────────────────────────────────────

export async function getServices(): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("published", true)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getServiceBySlug(slug: string): Promise<ServiceRow | null> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) return null;
  return data;
}

// ─── HOMEPAGE CONTENT ─────────────────────────────────────────

export async function getHomepageContent(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("homepage_content")
    .select("key, value");

  if (error) return {};
  return Object.fromEntries(data?.map((r) => [r.key, r.value]) ?? []);
}

// ─── MEDIA ────────────────────────────────────────────────────

export async function getMediaByCategory(category: string) {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
