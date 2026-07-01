import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar } from "lucide-react";
import { formatDate } from "@/lib/content";
import { NewsCarousel } from "@/components/site/NewsCarousel";
import type { NormalizedPost } from "@/lib/data";

type Props = {
  post: NormalizedPost;
  kind: "blog" | "noticias";
};

export function PostCard({ post, kind }: Props) {
  const hasImages = post.images && post.images.length > 0;

  return (
    <Link
      to={kind === "blog" ? "/blog/$slug" : "/noticias/$slug"}
      params={{ slug: post.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-primary/40"
    >
      {/* Imagem / Carrossel / Placeholder */}
      <div className="relative overflow-hidden">
        {hasImages ? (
          <NewsCarousel
            images={post.images!}
            title={post.title}
            aspectRatio="aspect-video"
            className="rounded-none"
          />
        ) : (
          <div
            className="relative aspect-video overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.58 0.14 138 / 0.85), oklch(0.42 0.11 138 / 0.95))",
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(115deg, transparent 0 32px, rgba(255,255,255,.15) 32px 33px), repeating-linear-gradient(-65deg, transparent 0 32px, rgba(255,255,255,.1) 32px 33px)",
              }}
            />
          </div>
        )}
        <div className="absolute left-4 top-4 z-10 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          {post.category}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar size={12} className="text-primary" />
          {formatDate(post.date)}
          <span>·</span>
          <span>{post.readTime}</span>
        </div>
        <h3 className="mt-3 font-display text-lg uppercase text-ink leading-tight">
          {post.title}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary opacity-80 transition-opacity group-hover:opacity-100">
          Ler {kind === "blog" ? "artigo" : "notícia"} <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

