/**
 * Ditames CMS — News (manual + Instagram)
 */

import { supabase } from "./supabase";
import { writeAuditLog } from "./admin";
import type { NewsRow, NewsStatus } from "./database.types";
import type { CmsUserRow } from "./database.types";

// ─── QUERIES ─────────────────────────────────────────────────

export async function listNews(opts?: {
  status?: NewsStatus;
  source?: "manual" | "instagram";
  limit?: number;
}): Promise<NewsRow[]> {
  let query = supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  if (opts?.status) query = query.eq("status", opts.status);
  if (opts?.source) query = query.eq("source", opts.source);
  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as NewsRow[];
}

export async function getNewsBySlug(slug: string): Promise<NewsRow | null> {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error) return null;
  return data as NewsRow;
}

export async function getNewsById(id: string): Promise<NewsRow | null> {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as NewsRow;
}

// ─── CRIAR ───────────────────────────────────────────────────

export async function createNewsManual(
  input: {
    title: string;
    content: string;
    excerpt?: string;
    category?: string;
    cover_image?: string;
    images?: string[];
    status?: NewsStatus;
    seo_title?: string;
    seo_description?: string;
  },
  user: CmsUserRow
): Promise<NewsRow> {
  const slug = generateSlug(input.title);

  const { data, error } = await supabase
    .from("news")
    .insert({
      title: input.title,
      content: input.content,
      excerpt: input.excerpt ?? input.content.slice(0, 160),
      slug,
      category: input.category ?? "Institucional",
      cover_image: input.cover_image ?? null,
      images: input.images ?? [],
      source: "manual",
      status: input.status ?? "draft",
      published_at: input.status === "published" ? new Date().toISOString() : null,
      read_time: estimateReadTime(input.content),
      created_by: user.id,
      updated_by: user.id,
      seo_title: input.seo_title ?? null,
      seo_description: input.seo_description ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog({
    user,
    action: "create",
    module: "news",
    record_id: data.id,
    new_value: { title: input.title, source: "manual" },
  });

  return data as NewsRow;
}

// ─── IMPORTAR DO INSTAGRAM ────────────────────────────────────

export async function importFromInstagram(
  post: {
    instagram_post_id: string;
    instagram_url: string;
    caption: string;
    images: string[];     // URLs das imagens do post
    timestamp: string;    // ISO
    media_type: "IMAGE" | "CAROUSEL_ALBUM";
  },
  user: CmsUserRow
): Promise<NewsRow | null> {
  // Previne duplicidade
  const { data: existing } = await supabase
    .from("news")
    .select("id")
    .eq("instagram_post_id", post.instagram_post_id)
    .single();

  if (existing) return null; // já importado

  const title = deriveTitleFromCaption(post.caption);
  const slug = generateSlug(title);
  const cover_image = post.images[0] ?? null;

  const { data, error } = await supabase
    .from("news")
    .insert({
      title,
      content: post.caption,
      excerpt: post.caption.slice(0, 160),
      slug,
      category: "Instagram",
      cover_image,
      images: post.images,
      source: "instagram",
      instagram_post_id: post.instagram_post_id,
      instagram_url: post.instagram_url,
      status: "draft", // sempre draft ao importar — admin decide publicar
      published_at: null,
      read_time: "2 min de leitura",
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog({
    user,
    action: "create",
    module: "news",
    record_id: data.id,
    new_value: { title, source: "instagram", instagram_post_id: post.instagram_post_id },
  });

  return data as NewsRow;
}

// ─── ATUALIZAR ───────────────────────────────────────────────

export async function updateNews(
  id: string,
  updates: Partial<Pick<NewsRow,
    "title" | "content" | "excerpt" | "category" | "cover_image" |
    "images" | "status" | "seo_title" | "seo_description"
  >>,
  user: CmsUserRow
): Promise<NewsRow> {
  const previous = await getNewsById(id);

  const patch: Record<string, unknown> = { ...updates, updated_by: user.id };
  if (updates.status === "published" && previous?.status !== "published") {
    patch.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("news")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // Registra cada campo alterado no audit log
  for (const [field, newVal] of Object.entries(updates)) {
    const prevVal = previous?.[field as keyof NewsRow];
    if (String(prevVal) !== String(newVal)) {
      await writeAuditLog({
        user,
        action: "update",
        module: "news",
        record_id: id,
        field,
        previous_value: prevVal,
        new_value: newVal,
      });
    }
  }

  return data as NewsRow;
}

export async function publishNews(id: string, user: CmsUserRow) {
  return updateNews(id, { status: "published" }, user);
}

export async function archiveNews(id: string, user: CmsUserRow) {
  return updateNews(id, { status: "archived" }, user);
}

export async function deleteNews(id: string, user: CmsUserRow) {
  const previous = await getNewsById(id);

  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw error;

  await writeAuditLog({
    user,
    action: "delete",
    module: "news",
    record_id: id,
    previous_value: { title: previous?.title },
  });
}

// ─── SINCRONIZAÇÃO INSTAGRAM ──────────────────────────────────

/**
 * Busca posts elegíveis do Instagram via Meta Graph API e importa os novos.
 * Tipos elegíveis: IMAGE, CAROUSEL_ALBUM (ignora REELS, STORIES).
 *
 * Requer: INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_USER_ID nas variáveis de ambiente.
 */
export async function syncInstagramFeed(user: CmsUserRow): Promise<{
  imported: number;
  skipped: number;
  errors: string[];
}> {
  const token = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN;
  const userId = import.meta.env.VITE_INSTAGRAM_USER_ID;

  if (!token || !userId) {
    throw new Error(
      "Variáveis VITE_INSTAGRAM_ACCESS_TOKEN e VITE_INSTAGRAM_USER_ID não configuradas."
    );
  }

  const url = `https://graph.instagram.com/${userId}/media?fields=id,media_type,caption,media_url,children{media_url},permalink,timestamp&access_token=${token}&limit=20`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Instagram API error: ${res.status}`);

  const json = await res.json();
  const posts = json.data ?? [];

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const post of posts) {
    // Ignora Reels e Stories
    if (!["IMAGE", "CAROUSEL_ALBUM"].includes(post.media_type)) {
      skipped++;
      continue;
    }

    try {
      // Coleta imagens: carrossel tem children, imagem simples tem media_url
      const images: string[] =
        post.media_type === "CAROUSEL_ALBUM" && post.children?.data
          ? post.children.data.map((c: { media_url: string }) => c.media_url)
          : [post.media_url].filter(Boolean);

      const result = await importFromInstagram(
        {
          instagram_post_id: post.id,
          instagram_url: post.permalink,
          caption: post.caption ?? "",
          images,
          timestamp: post.timestamp,
          media_type: post.media_type,
        },
        user
      );

      if (result) imported++;
      else skipped++; // duplicata
    } catch (e) {
      errors.push(`Post ${post.id}: ${(e as Error).message}`);
    }
  }

  return { imported, skipped, errors };
}

// ─── HELPERS ─────────────────────────────────────────────────

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) +
    "-" +
    Date.now().toString(36)
  );
}

function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min de leitura`;
}

function deriveTitleFromCaption(caption: string): string {
  // Pega a primeira linha não vazia ou os primeiros 80 caracteres
  const firstLine = caption.split("\n").find((l) => l.trim().length > 0) ?? caption;
  return firstLine.length > 80 ? firstLine.slice(0, 80) + "…" : firstLine;
}
