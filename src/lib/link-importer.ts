/**
 * Ditames CMS — Link Importer
 *
 * Extrai metadados de qualquer URL pública via Open Graph / meta tags.
 * Detecta automaticamente a origem (Instagram, externo, genérico).
 * Não executa scripts externos — apenas lê HTML estático da página.
 *
 * Limitação de browser: requisições cross-origin são bloqueadas pelo CORS.
 * Por isso usamos um proxy CORS público (allorigins.win) apenas para leitura
 * de metadados. Nenhum dado sensível é enviado.
 */

export type SourceType = "instagram" | "external_link" | "manual";

export interface ImportedContent {
  title: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  images: string[];
  source_type: SourceType;
  source_url: string;
  detected_date: string | null;
  raw_meta: Record<string, string>;
  extraction_failed?: boolean; // true quando o proxy de leitura falhou e caímos no fallback
}

// ─── DETECÇÃO DE ORIGEM ───────────────────────────────────────

export function detectSourceType(url: string): SourceType {
  try {
    const { hostname } = new URL(url);
    if (hostname.includes("instagram.com")) return "instagram";
    return "external_link";
  } catch {
    return "external_link";
  }
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// ─── EXTRAÇÃO VIA PROXY CORS ──────────────────────────────────

export async function importFromUrl(url: string): Promise<ImportedContent> {
  if (!validateUrl(url)) throw new Error("URL inválida. Use http:// ou https://");

  const source_type = detectSourceType(url);

  // Busca HTML via proxy (evita bloqueio CORS no browser)
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

  let html = "";
  try {
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Erro ao buscar URL: ${res.status}`);
    const data = await res.json();
    html = data.contents ?? "";
    if (!html) throw new Error("Conteúdo vazio retornado pelo proxy");
  } catch (e) {
    // O serviço de leitura (proxy CORS) pode estar indisponível.
    // Retornamos uma estrutura mínima editável, mas sinalizamos
    // claramente que a extração automática falhou — o chamador deve
    // avisar o usuário em vez de tratar isso como sucesso silencioso.
    return buildFallback(url, source_type);
  }

  return parseHtml(html, url, source_type);
}

// ─── PARSE DO HTML ────────────────────────────────────────────

function parseHtml(html: string, url: string, source_type: SourceType): ImportedContent {
  // Extrai meta tags via regex (sem DOM — funciona em SSR e browser)
  const meta: Record<string, string> = {};

  // Open Graph
  const ogMatches = html.matchAll(/<meta\s+(?:property|name)=["']([^"']+)["']\s+content=["']([^"']*)["']/gi);
  for (const m of ogMatches) meta[m[1]] = decodeHtmlEntities(m[2]);

  // Também tenta order inversa dos atributos
  const ogMatches2 = html.matchAll(/<meta\s+content=["']([^"']*)["']\s+(?:property|name)=["']([^"']+)["']/gi);
  for (const m of ogMatches2) meta[m[2]] = decodeHtmlEntities(m[1]);

  // Title tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const pageTitle = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : "";

  // Coleta imagens Open Graph
  const images: string[] = [];
  if (meta["og:image"]) images.push(meta["og:image"]);
  if (meta["twitter:image"]) images.push(meta["twitter:image"]);

  // Título — prioridade: og:title > twitter:title > <title>
  const title =
    meta["og:title"] ||
    meta["twitter:title"] ||
    pageTitle ||
    extractDomainLabel(url);

  // Descrição — prioridade: og:description > twitter:description > description
  const description =
    meta["og:description"] ||
    meta["twitter:description"] ||
    meta["description"] ||
    "";

  // Data de publicação
  const detected_date =
    meta["article:published_time"] ||
    meta["og:updated_time"] ||
    null;

  // Conteúdo inicial: para Instagram usa a legenda (og:description)
  // Para externos usa a descrição como ponto de partida
  const content = buildInitialContent(title, description, url, source_type);

  return {
    title: title.slice(0, 200),
    content,
    excerpt: description.slice(0, 300),
    cover_image: images[0] ?? null,
    images: [...new Set(images)].slice(0, 10),
    source_type,
    source_url: url,
    detected_date,
    raw_meta: meta,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────

function buildInitialContent(
  title: string,
  description: string,
  url: string,
  source_type: SourceType
): string {
  if (source_type === "instagram") {
    return description || "Publicação importada do Instagram. Edite este conteúdo antes de publicar.";
  }
  const lines: string[] = [];
  if (description) lines.push(description);
  lines.push(`\nFonte: ${url}`);
  return lines.join("\n\n");
}

function buildFallback(url: string, source_type: SourceType): ImportedContent {
  return {
    title: extractDomainLabel(url),
    content: `Conteúdo importado de: ${url}\n\nEdite este campo antes de publicar.`,
    excerpt: "",
    cover_image: null,
    images: [],
    source_type,
    source_url: url,
    detected_date: null,
    raw_meta: {},
    extraction_failed: true,
  };
}

function extractDomainLabel(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "Conteúdo importado";
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}
