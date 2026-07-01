/**
 * NewsGallery — galeria completa com lightbox para página da notícia
 * Reutilizável: Blog, Cases, Projetos
 */

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { CarouselImage } from "./NewsCarousel";

interface NewsGalleryProps {
  images: CarouselImage[];
  title: string;
}

export function NewsGallery({ images, title }: NewsGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const valid = images.filter((img) => img.url);
  if (valid.length === 0) return null;

  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + valid.length) % valid.length : null));
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % valid.length : null));

  const close = () => setLightbox(null);

  // Teclado
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  // Bloqueia scroll quando lightbox aberto
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  // Galeria com 1 imagem — exibição simples
  if (valid.length === 1) {
    return (
      <figure className="my-8">
        <button
          onClick={() => setLightbox(0)}
          className="group relative w-full overflow-hidden rounded-2xl block"
        >
          <img
            src={valid[0].url}
            alt={valid[0].alt_text ?? title}
            className="w-full object-cover max-h-[480px] transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
        {valid[0].caption && (
          <figcaption className="mt-2 text-xs text-center text-muted-foreground">
            {valid[0].caption}
          </figcaption>
        )}
        <Lightbox images={valid} current={lightbox} onClose={close} onPrev={prev} onNext={next} title={title} />
      </figure>
    );
  }

  // Galeria com múltiplas imagens — grid responsivo
  return (
    <div className="my-8">
      <div className={`grid gap-2 ${
        valid.length === 2 ? "grid-cols-2" :
        valid.length === 3 ? "grid-cols-3" :
        "grid-cols-2 md:grid-cols-3"
      }`}>
        {valid.map((img, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className="group relative overflow-hidden rounded-xl aspect-square block"
          >
            <img
              src={img.url}
              alt={img.alt_text ?? `${title} — imagem ${i + 1}`}
              loading={i < 3 ? "eager" : "lazy"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-start p-2">
              {img.caption && (
                <span className="text-[10px] text-white/90 bg-black/50 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1">
                  {img.caption}
                </span>
              )}
            </div>
            {/* Indicador de mais imagens na última */}
            {i === 5 && valid.length > 6 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-xl">+{valid.length - 5}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <Lightbox images={valid} current={lightbox} onClose={close} onPrev={prev} onNext={next} title={title} />
    </div>
  );
}

// ─── LIGHTBOX ────────────────────────────────────────────────

function Lightbox({
  images,
  current,
  onClose,
  onPrev,
  onNext,
  title,
}: {
  images: CarouselImage[];
  current: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  title: string;
}) {
  if (current === null) return null;
  const img = images[current];

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Conteúdo — clique não propaga para fechar */}
      <div
        className="relative max-w-5xl max-h-[90vh] w-full mx-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagem */}
        <img
          src={img.url}
          alt={img.alt_text ?? title}
          className="max-h-[80vh] max-w-full object-contain rounded-xl"
        />

        {/* Legenda */}
        {img.caption && (
          <p className="mt-3 text-sm text-white/60 text-center max-w-lg">{img.caption}</p>
        )}

        {/* Contador */}
        <p className="mt-2 text-xs text-white/30">
          {current + 1} / {images.length}
        </p>
      </div>

      {/* Botão fechar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X size={20} />
      </button>

      {/* Navegação — só com múltiplas imagens */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}
