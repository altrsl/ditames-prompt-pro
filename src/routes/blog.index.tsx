import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { PostCard } from "@/components/site/PostCard";
import { getBlogPosts } from "@/lib/data";
import type { NormalizedPost } from "@/lib/data";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const posts = await getBlogPosts();
    return { posts };
  },
  head: () => ({
    meta: [
      { title: "Blog Ditames Ambiental — Multas, Regularização e Legislação Ambiental" },
      {
        name: "description",
        content:
          "Entenda o que fazer ao receber uma multa ambiental, como regularizar uma propriedade rural, APP, licenciamento e mais. Conteúdo técnico em linguagem clara pela equipe Ditames.",
      },
      { property: "og:title", content: "Blog Ditames Ambiental" },
      {
        property: "og:description",
        content: "Soluções para dúvidas reais sobre meio ambiente, regularização e licenciamento.",
      },
    ],
  }),
  component: BlogIndex,
});

const temasDestaque = [
  "Ganhei uma multa ambiental. E agora?",
  "APP: entenda suas obrigações",
  "O que fazer ao receber uma exigência ambiental",
  "Como regularizar um imóvel rural",
  "Quando o licenciamento ambiental é obrigatório",
  "Tenho uma nascente na propriedade. O que muda?",
];

function BlogIndex() {
  const { posts } = Route.useLoaderData();
  const categories: string[] = ["Todos", ...Array.from(new Set<string>(posts.map((p: NormalizedPost) => p.category)))];
  const [active, setActive] = useState("Todos");
  const filtered: NormalizedPost[] =
    active === "Todos" ? posts : posts.filter((p: NormalizedPost) => p.category === active);

  return (
    <>
      <PageHero
        eyebrow="Blog Ditames"
        title={
          <>
            Conhecimento que <span className="text-primary">transforma</span> decisões
          </>
        }
        subtitle="Artigos técnicos e educacionais sobre meio ambiente, regularização e geotecnologia — em linguagem direta."
      />

      {/* Destaque: temas de captação */}
      <section className="bg-surface py-14 border-b border-border">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow">Em breve</span>
              <h2 className="mt-2 text-2xl md:text-3xl uppercase text-ink">
                Soluções para <span className="text-primary">dúvidas frequentes</span>
              </h2>
            </div>
            <Link to="/ia" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline shrink-0">
              <Sparkles size={14} /> Tire sua dúvida agora com a Recepcionista <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {temasDestaque.map((tema) => (
              <div
                key={tema}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-ink/60 italic"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/50 shrink-0">Em breve</span>
                {tema}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-20 md:py-24">
        <div className="container-x">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  active === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-ink hover:border-primary/60"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p: NormalizedPost) => (
              <PostCard key={p.slug} post={p} kind="blog" />
            ))}
          </div>

          <div className="mt-14 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="rounded-md border border-primary bg-primary px-3 py-1.5 text-white">
              1
            </span>
            <span className="text-muted-foreground">de 1</span>
          </div>
        </div>
      </section>
    </>
  );
}
