import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { PostCard } from "@/components/site/PostCard";
import { newsPosts } from "@/lib/content";

export const Route = createFileRoute("/noticias/")({
  head: () => ({
    meta: [
      { title: "Notícias Ditames Ambiental — Atualizações institucionais" },
      {
        name: "description",
        content:
          "Acompanhe projetos, eventos, marcos institucionais e mudanças regulatórias relevantes para o setor ambiental.",
      },
      { property: "og:title", content: "Notícias Ditames Ambiental" },
      {
        property: "og:description",
        content: "Atualizações institucionais da Ditames Ambiental.",
      },
    ],
  }),
  component: NoticiasIndex,
});

function NoticiasIndex() {
  const categories = ["Todas", ...Array.from(new Set(newsPosts.map((p) => p.category)))];
  const [active, setActive] = useState("Todas");
  const filtered =
    active === "Todas" ? newsPosts : newsPosts.filter((p) => p.category === active);

  return (
    <>
      <PageHero
        eyebrow="Notícias Ditames"
        title={
          <>
            Atualizações que mostram nossa <span className="text-primary">evolução</span>
          </>
        }
        subtitle="Projetos, eventos, marcos institucionais e mudanças regulatórias acompanhadas pela equipe Ditames."
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
              <PostCard key={p.slug} post={p} kind="noticias" />
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
