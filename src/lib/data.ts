/**
 * Ditames — Data Layer
 *
 * Busca dados do Supabase e normaliza para o formato usado pelo frontend.
 * Se o Supabase retornar vazio ou erro, usa os dados hardcoded como fallback
 * para garantir que o site nunca quebra.
 */

import { supabase } from "./supabase";
import { blogPosts as fallbackBlog, newsPosts as fallbackNews } from "./content";
import type { Post } from "./content";

// ─── TIPOS NORMALIZADOS ───────────────────────────────────────

export type NormalizedPost = Post; // mesmo formato do content.ts

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

// ─── HELPERS ─────────────────────────────────────────────────

function isoFromSupabase(ts: string | null): string {
  if (!ts) return new Date().toISOString().split("T")[0];
  return ts.split("T")[0]; // "2026-06-10T00:00:00" → "2026-06-10"
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
  { id: "1", order: 1, question: "Ganhei uma multa ambiental. O que devo fazer?", answer: "O primeiro passo é entender a origem e o embasamento legal da multa. A Ditames pode analisar o auto de infração, identificar as obrigações envolvidas e orientar sobre as possibilidades de defesa administrativa, regularização ou cumprimento de exigências. Cada situação é única e merece análise técnica especializada." },
  { id: "2", order: 2, question: "Como regularizar uma área rural?", answer: "A regularização de áreas rurais envolve etapas como Cadastro Ambiental Rural (CAR), georreferenciamento, identificação de Áreas de Preservação Permanente (APP), Reserva Legal e, quando necessário, Programa de Regularização Ambiental (PRA). A Ditames conduz todo esse processo de forma integrada." },
  { id: "3", order: 3, question: "O que acontece quando existe uma APP na propriedade?", answer: "Áreas de Preservação Permanente (APP) possuem restrições de uso estabelecidas pelo Código Florestal. Dependendo da situação — margem de rio, encosta, nascente — é necessário identificar as obrigações, avaliar passivos e, quando cabível, conduzir processos de recuperação ou regularização junto aos órgãos ambientais." },
  { id: "4", order: 4, question: "Como funciona um licenciamento ambiental?", answer: "O licenciamento ambiental é o processo pelo qual o poder público autoriza a instalação e operação de atividades potencialmente poluidoras. Dependendo da atividade e do porte, pode envolver Licença Prévia (LP), Licença de Instalação (LI) e Licença de Operação (LO). A Ditames elabora os estudos necessários e conduz todo o processo junto aos órgãos competentes." },
  { id: "5", order: 5, question: "Preciso de autorização para suprimir vegetação?", answer: "Sim, em grande parte dos casos. A supressão de vegetação nativa exige autorização do órgão ambiental estadual ou federal, dependendo do bioma e da área. A Ditames realiza o levantamento florístico, elabora o requerimento técnico e acompanha o processo de aprovação." },
  { id: "6", order: 6, question: "Tenho uma nascente na propriedade. O que fazer?", answer: "Nascentes são protegidas pelo Código Florestal e exigem manutenção de faixa de APP ao redor. É necessário identificá-las corretamente no Cadastro Ambiental Rural e, caso haja ocupação indevida, conduzir processo de regularização. A Ditames realiza o mapeamento e orienta sobre as obrigações legais." },
  { id: "7", order: 7, question: "Como regularizar um loteamento?", answer: "A regularização de loteamentos envolve aspectos fundiários, urbanísticos e ambientais. A Ditames apoia desde a elaboração de estudos ambientais e topográficos até a aprovação nos órgãos competentes, passando por licenciamento, elaboração de projetos de drenagem, arborização e demais exigências técnicas." },
  { id: "8", order: 8, question: "Como saber se minha atividade precisa de licenciamento?", answer: "A necessidade de licenciamento depende da natureza, porte e localização da atividade. A Ditames realiza o enquadramento da atividade na legislação estadual e federal e orienta sobre os procedimentos necessários, evitando surpresas e autuações futuras." },
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

// ─── BLOG ────────────────────────────────────────────────────

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
      date: isoFromSupabase(p.published_at),
      category: p.category,
      readTime: p.read_time,
      body: [p.body], // body vem como string única do Supabase
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
      date: isoFromSupabase(data.published_at),
      category: data.category,
      readTime: data.read_time,
      body: [data.body],
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

// ─── NOTÍCIAS ────────────────────────────────────────────────

export async function getNewsPosts(limit?: number): Promise<NormalizedPost[]> {
  try {
    let query = supabase
      .from("news_posts")
      .select("slug, title, excerpt, published_at, category, read_time, body")
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return limit ? fallbackNews.slice(0, limit) : fallbackNews;
    }

    return data.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: isoFromSupabase(p.published_at),
      category: p.category,
      readTime: p.read_time,
      body: [p.body],
    }));
  } catch {
    return limit ? fallbackNews.slice(0, limit) : fallbackNews;
  }
}

export async function getNewsPost(slug: string): Promise<NormalizedPost | null> {
  try {
    const { data, error } = await supabase
      .from("news_posts")
      .select("slug, title, excerpt, published_at, category, read_time, body")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error || !data) {
      return fallbackNews.find((p) => p.slug === slug) ?? null;
    }

    return {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      date: isoFromSupabase(data.published_at),
      category: data.category,
      readTime: data.read_time,
      body: [data.body],
    };
  } catch {
    return fallbackNews.find((p) => p.slug === slug) ?? null;
  }
}

export async function getNewsCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("news_posts")
      .select("category")
      .eq("published", true);

    if (error || !data || data.length === 0) {
      return [...new Set(fallbackNews.map((p) => p.category))];
    }

    return [...new Set(data.map((p) => p.category))];
  } catch {
    return [...new Set(fallbackNews.map((p) => p.category))];
  }
}
