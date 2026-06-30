/**
 * Ditames — Data Layer (UNIFICADO)
 *
 * ARQUITETURA DE TABELAS:
 *   - notícias → tabela "news"  (status: 'published'|'draft'|'archived', fonte: manual|instagram)
 *   - blog     → tabela "blog_posts" (published: boolean)
 *
 * Todas as queries públicas e do CMS usam exatamente estas tabelas.
 * Fallback para arrays vazios quando banco não retorna dados.
 */

import { supabase } from "./supabase";
import { blogPosts as fallbackBlog, newsPosts as fallbackNews } from "./content";
import type { Post } from "./content";

// ─── TIPOS NORMALIZADOS ───────────────────────────────────────

export type NormalizedPost = Post;

export type NormalizedCase = {
  id: string;
  name: string;
  sector: string;
  desc: string;
  logoUrl: string | null;
  slug: string | null;
};

export type NormalizedFaqItem = {
  id: string;
  question: string;
  answer: string;
  order: number;
};

// ─── HELPER ──────────────────────────────────────────────────

function isoToDate(ts: string | null): string {
  if (!ts) return new Date().toISOString().split("T")[0];
  return ts.split("T")[0];
}

// ─── CASES ───────────────────────────────────────────────────

const FALLBACK_CASES: NormalizedCase[] = [
  { id: "1", name: "Madefrahm",              sector: "Indústria moveleira",     desc: "Regularização ambiental de empreendimento industrial.",    logoUrl: null, slug: null },
  { id: "2", name: "Metalúrgica Riosulense", sector: "Metalurgia",              desc: "Apoio contínuo em processos de licenciamento.",            logoUrl: null, slug: null },
  { id: "3", name: "BIOCAL",                 sector: "Insumos agrícolas",       desc: "Estudos ambientais e suporte técnico.",                    logoUrl: null, slug: null },
  { id: "4", name: "Elber",                  sector: "Refrigeração industrial", desc: "Gestão ambiental recorrente.",                             logoUrl: null, slug: null },
  { id: "5", name: "Prefabricar",            sector: "Construção",              desc: "Licenciamento e regularização de canteiro de obras.",      logoUrl: null, slug: null },
];

export async function getCases(): Promise<NormalizedCase[]> {
  try {
    const { data, error } = await supabase
      .from("cases")
      .select("id, name, sector, description, logo_url, slug")
      .eq("published", true)
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) return FALLBACK_CASES;

    return data.map((c) => ({
      id: c.id,
      name: c.name,
      sector: c.sector,
      desc: c.description ?? "",
      logoUrl: c.logo_url ?? null,
      slug: c.slug ?? null,
    }));
  } catch {
    return FALLBACK_CASES;
  }
}

// ─── FAQ ─────────────────────────────────────────────────────

const FALLBACK_FAQ: NormalizedFaqItem[] = [
  { id: "1", order: 1, question: "Ganhei uma multa ambiental. O que devo fazer?", answer: "O primeiro passo é entender a origem e o embasamento legal da multa. A Ditames pode analisar o auto de infração, identificar as obrigações envolvidas e orientar sobre as possibilidades de defesa administrativa, regularização ou cumprimento de exigências." },
  { id: "2", order: 2, question: "Como regularizar uma área rural?", answer: "A regularização envolve CAR, georreferenciamento, identificação de APP, Reserva Legal e PRA quando necessário. A Ditames conduz todo esse processo de forma integrada." },
  { id: "3", order: 3, question: "O que acontece quando existe uma APP na propriedade?", answer: "APP possui restrições de uso pelo Código Florestal. É necessário identificar as obrigações, avaliar passivos e conduzir processos de recuperação ou regularização junto aos órgãos ambientais." },
  { id: "4", order: 4, question: "Como funciona um licenciamento ambiental?", answer: "O licenciamento autoriza a instalação e operação de atividades potencialmente poluidoras. Pode envolver LP, LI e LO. A Ditames elabora os estudos e conduz o processo junto aos órgãos competentes." },
  { id: "5", order: 5, question: "Preciso de autorização para suprimir vegetação?", answer: "Sim, na maioria dos casos. A Ditames realiza o levantamento florístico, elabora o requerimento técnico e acompanha o processo de aprovação." },
  { id: "6", order: 6, question: "Tenho uma nascente na propriedade. O que fazer?", answer: "Nascentes são protegidas pelo Código Florestal e exigem faixa de APP. A Ditames realiza o mapeamento e orienta sobre as obrigações legais." },
  { id: "7", order: 7, question: "Como regularizar um loteamento?", answer: "A Ditames apoia desde os estudos ambientais até a aprovação nos órgãos competentes, passando por licenciamento e demais exigências técnicas." },
  { id: "8", order: 8, question: "Como saber se minha atividade precisa de licenciamento?", answer: "A Ditames realiza o enquadramento da atividade na legislação estadual e federal e orienta sobre os procedimentos necessários." },
];

export async function getFaq(): Promise<NormalizedFaqItem[]> {
  try {
    const { data, error } = await supabase
      .from("faq")
      .select("id, question, answer, order_index")
      .eq("published", true)
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) return FALLBACK_FAQ;

    return data.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      order: f.order_index,
    }));
  } catch {
    return FALLBACK_FAQ;
  }
}

// ─── BLOG (tabela: blog_posts) ────────────────────────────────
// blog_posts usa: published (boolean), body (text), cover_url

export async function getBlogPosts(limit?: number): Promise<NormalizedPost[]> {
  try {
    let query = supabase
      .from("blog_posts")
      .select("slug, title, excerpt, published_at, category, read_time, body")
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return limit ? fallbackBlog.slice(0, limit) : fallbackBlog;
    }

    return data.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: isoToDate(p.published_at),
      category: p.category,
      readTime: p.read_time,
      body: [p.body ?? ""],
    }));
  } catch {
    return limit ? fallbackBlog.slice(0, limit) : fallbackBlog;
  }
}

export async function getBlogPost(slug: string): Promise<NormalizedPost | null> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, published_at, category, read_time, body")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error || !data) {
      return fallbackBlog.find((p) => p.slug === slug) ?? null;
    }

    return {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      date: isoToDate(data.published_at),
      category: data.category,
      readTime: data.read_time,
      body: [data.body ?? ""],
    };
  } catch {
    return fallbackBlog.find((p) => p.slug === slug) ?? null;
  }
}

export async function getBlogCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("category")
      .eq("published", true);

    if (error || !data || data.length === 0) {
      return [...new Set(fallbackBlog.map((p) => p.category))];
    }
    return [...new Set(data.map((p) => p.category))];
  } catch {
    return [...new Set(fallbackBlog.map((p) => p.category))];
  }
}

// ─── NOTÍCIAS (tabela: news) ──────────────────────────────────
// news usa: status ('published'|'draft'|'archived'), content (text), cover_image

export async function getNewsPosts(limit?: number): Promise<NormalizedPost[]> {
  try {
    let query = supabase
      .from("news")
      .select("slug, title, excerpt, published_at, category, read_time, content")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return limit ? fallbackNews.slice(0, limit) : fallbackNews;
    }

    return data.map((p) => ({
      slug: p.slug ?? "",
      title: p.title,
      excerpt: p.excerpt,
      date: isoToDate(p.published_at),
      category: p.category,
      readTime: p.read_time,
      body: [p.content ?? ""],
    }));
  } catch {
    return limit ? fallbackNews.slice(0, limit) : fallbackNews;
  }
}

export async function getNewsPost(slug: string): Promise<NormalizedPost | null> {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("slug, title, excerpt, published_at, category, read_time, content")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) {
      return fallbackNews.find((p) => p.slug === slug) ?? null;
    }

    return {
      slug: data.slug ?? slug,
      title: data.title,
      excerpt: data.excerpt,
      date: isoToDate(data.published_at),
      category: data.category,
      readTime: data.read_time,
      body: [data.content ?? ""],
    };
  } catch {
    return fallbackNews.find((p) => p.slug === slug) ?? null;
  }
}

export async function getNewsCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("category")
      .eq("status", "published");

    if (error || !data || data.length === 0) {
      return [...new Set(fallbackNews.map((p) => p.category))];
    }
    return [...new Set(data.map((p) => p.category))];
  } catch {
    return [...new Set(fallbackNews.map((p) => p.category))];
  }
}
