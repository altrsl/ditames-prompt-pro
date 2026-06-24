import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { PostCard } from "@/components/site/PostCard";
import { blogPosts } from "@/lib/content";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog Ditames Ambiental — Conteúdo técnico e educação ambiental" },
      {
        name: "description",
        content:
          "Artigos sobre licenciamento, regularização, geotecnologia e legislação ambiental, explicados em linguagem clara pela equipe técnica da Ditames.",
      },
      { property: "og:title", content: "Blog Ditames Ambiental" },
      {
        property: "og:description",
        content: "Educação ambiental e conhecimento técnico aplicado.",
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const categories = ["Todos", ...Array.from(new Set(blogPosts.map((p) => p.category)))];
  const [active, setActive] = useState("Todos");
  const filtered =
    active === "Todos" ? blogPosts : blogPosts.filter((p) => p.category === active);

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
            {filtered.map((p) => (
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
