/**
 * Ditames — Download de imagens externas para o Storage
 *
 * Implementa o fluxo "Upload por URL" corretamente: baixa a imagem
 * da URL informada e a armazena no Supabase Storage, em vez de
 * apenas salvar a URL externa como string (frágil — depende de o
 * site de origem continuar no ar, sem CORS bloqueando hotlink, etc.)
 *
 * LIMITAÇÃO CONHECIDA: o download acontece no client (navegador),
 * portanto está sujeito a CORS. Muitos sites bloqueiam fetch()
 * cross-origin de imagens. Quando isso acontece, retornamos um erro
 * claro em vez de salvar a URL externa "por baixo do pano" — o
 * comportamento deve ser previsível: ou a imagem é baixada e
 * armazenada de verdade, ou a operação falha com aviso.
 */

import { supabase, storageUrl } from "./supabase";
import type { MediaCategory } from "./database.types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export interface DownloadedImage {
  url: string;          // URL pública no nosso Storage
  filename: string;
  size_bytes: number;
  mime_type: string;
}

export class ImageDownloadError extends Error {
  constructor(message: string, public code: "cors" | "invalid_type" | "too_large" | "fetch_failed" | "upload_failed") {
    super(message);
    this.name = "ImageDownloadError";
  }
}

/**
 * Baixa uma imagem de uma URL externa e a envia para o bucket `media`.
 * Lança ImageDownloadError com código específico em caso de falha —
 * o chamador decide como comunicar isso ao usuário.
 */
export async function downloadImageToStorage(
  sourceUrl: string,
  folder: MediaCategory,
  uploadedBy: string | null
): Promise<DownloadedImage> {
  let response: Response;
  try {
    response = await fetch(sourceUrl, { mode: "cors" });
  } catch (e) {
    // Falha de rede ou bloqueio de CORS — o navegador não distingue
    // os dois casos de forma confiável via fetch(), então tratamos
    // como uma categoria só, com mensagem que cobre ambos os cenários.
    throw new ImageDownloadError(
      "Não foi possível baixar a imagem dessa URL. O site de origem pode estar bloqueando o download automático (CORS) ou fora do ar.",
      "cors"
    );
  }

  if (!response.ok) {
    throw new ImageDownloadError(
      `O servidor da imagem respondeu com erro (HTTP ${response.status}). Verifique se a URL está correta.`,
      "fetch_failed"
    );
  }

  const blob = await response.blob();

  if (blob.size > MAX_FILE_SIZE) {
    throw new ImageDownloadError(
      "A imagem é muito grande (limite de 10 MB). Escolha uma imagem menor.",
      "too_large"
    );
  }

  const mimeType = blob.type || response.headers.get("content-type") || "";
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new ImageDownloadError(
      `Formato de imagem não suportado (${mimeType || "desconhecido"}). Use JPG, PNG, WebP, SVG ou GIF.`,
      "invalid_type"
    );
  }

  const ext = mimeType.split("/")[1]?.replace("svg+xml", "svg") ?? "jpg";
  const filename = sourceUrl.split("/").pop()?.split("?")[0] || `imagem.${ext}`;
  const path = `${folder}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("media").upload(path, blob, {
    contentType: mimeType,
  });
  if (uploadError) {
    throw new ImageDownloadError(
      "A imagem foi baixada, mas não foi possível salvá-la no nosso sistema. Tente novamente.",
      "upload_failed"
    );
  }

  const publicUrl = storageUrl("media", path);

  // Registra na tabela media para aparecer na Biblioteca de Mídia
  await supabase.from("media").insert({
    filename,
    storage_path: path,
    public_url: publicUrl,
    category: folder,
    size_bytes: blob.size,
    mime_type: mimeType,
    uploaded_by: uploadedBy,
  });

  return {
    url: publicUrl,
    filename,
    size_bytes: blob.size,
    mime_type: mimeType,
  };
}

/**
 * Mensagem amigável para cada código de erro de download de imagem.
 * Usar junto com friendlyError() do Toast.tsx quando a origem do
 * erro for um ImageDownloadError.
 */
export function friendlyImageDownloadError(e: unknown): { title: string; message: string } {
  if (e instanceof ImageDownloadError) {
    const titles: Record<ImageDownloadError["code"], string> = {
      cors: "Não foi possível baixar a imagem",
      invalid_type: "Formato não suportado",
      too_large: "Imagem muito grande",
      fetch_failed: "Erro ao buscar a imagem",
      upload_failed: "Erro ao salvar a imagem",
    };
    return { title: titles[e.code], message: e.message };
  }
  return { title: "Erro inesperado", message: "Não foi possível processar a imagem. Tente novamente." };
}
