import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { PostCard } from "@/components/site/PostCard";
import { getNewsPosts } from "@/lib/data";
import type { NormalizedPost } from "@/lib/data";

export const Route = createFileRoute("/noticias/")({
  loader: async () => {
    const posts = await getNewsPosts();
    return { posts };
  },
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
  const { posts } = Route.useLoaderData();
  const categories: string[] = ["Todas", ...Array.from(new Set<string>(posts.map((p: NormalizedPost) => p.category)))];
  const [active, setActive] = useState("Todas");
  const filtered: NormalizedPost[] =
    active === "Todas" ? posts : posts.filter((p: NormalizedPost) => p.category === active);

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
            {filtered.map((p: NormalizedPost) => (
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
