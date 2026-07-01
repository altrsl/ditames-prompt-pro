/**
 * NewsCarousel — carrossel automático de imagens para cards de notícias
 * Reutilizável: Blog, Cases, Projetos, Equipe
 */

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselImage {
  url: string;
  caption?: string | null;
  alt_text?: string | null;
}

interface NewsCarouselProps {
  images: CarouselImage[];
  title: string;           // fallback para alt text
  autoplayMs?: number;     // intervalo em ms (default: 4000)
  className?: string;
  aspectRatio?: string;    // ex: "aspect-video" (default) ou "aspect-square"
}

const PLACEHOLDER = "/logo-ditames.png";

export function NewsCarousel({
  images,
  title,
  autoplayMs = 4000,
  className = "",
  aspectRatio = "aspect-video",
}: NewsCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const validImages = images.filter((img) => img.url);
  const count = validImages.length;
  const hasMultiple = count > 1;

  // Autoplay
  useEffect(() => {
    if (!hasMultiple || paused) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, autoplayMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [count, paused, autoplayMs, hasMultiple]);

  const prev = () => setCurrent((c) => (c - 1 + count) % count);
  const next = () => setCurrent((c) => (c + 1) % count);

  // Swipe no mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev();
    touchStart.current = null;
  };

  // Imagem sem galeria — placeholder institucional
  if (count === 0) {
    return (
      <div className={`${aspectRatio} ${className} bg-[#1a2118] flex items-center justify-center overflow-hidden rounded-xl`}>
        <img src={PLACEHOLDER} alt={title} className="w-24 opacity-20 object-contain" />
      </div>
    );
  }

  const img = validImages[current];

  return (
    <div
      className={`relative ${aspectRatio} ${className} overflow-hidden rounded-xl bg-black group`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Imagens */}
      {validImages.map((image, i) => (
        <img
          key={i}
          src={image.url}
          alt={image.alt_text ?? title}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Gradiente bottom para legenda */}
      {img.caption && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-6">
          <p className="text-xs text-white/80 line-clamp-1">{img.caption}</p>
        </div>
      )}

      {/* Controles — só aparecem com múltiplas imagens */}
      {hasMultiple && (
        <>
          {/* Botões anterior/próximo */}
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronRight size={14} />
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 pointer-events-none">
            {validImages.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-4 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
