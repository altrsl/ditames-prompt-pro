import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, MessageCircle } from "lucide-react";
import { getNewsPost, getNewsPosts } from "@/lib/data";
import { formatDate } from "@/lib/content";
import { PostCard } from "@/components/site/PostCard";
import { WHATSAPP_URL } from "@/lib/services";

export const Route = createFileRoute("/noticias/$slug")({
  loader: async ({ params }) => {
    const post = await getNewsPost(params.slug);
    if (!post) throw notFound();
    const all = await getNewsPosts();
    const related = all.filter((p) => p.slug !== post.slug).slice(0, 3);
    return { post, related };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.post.title} — Notícias Ditames` },
            { name: "description", content: loaderData.post.excerpt },
            { property: "og:title", content: loaderData.post.title },
            { property: "og:description", content: loaderData.post.excerpt },
          ],
        }
      : {},
  notFoundComponent: () => (
    <div className="container-x py-32 text-center">
      <h1 className="font-display text-3xl uppercase text-ink">Notícia não encontrada</h1>
      <Link to="/noticias" className="btn-outline mt-6 inline-flex">
        Voltar às notícias
      </Link>
    </div>
  ),
  component: NoticiaPost,
});

function NoticiaPost() {
  const { post, related } = Route.useLoaderData();

  return (
    <>
      <article className="pt-32 pb-20 md:pt-40 md:pb-24 bg-background">
        <div className="container-x max-w-3xl">
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary"
          >
            <ArrowLeft size={14} /> Voltar às Notícias
          </Link>
          <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="rounded-full bg-secondary px-3 py-1 font-bold text-primary">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-primary" /> {formatDate(post.date)}
            </span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.5rem)] uppercase text-ink leading-[1.05]">
            {post.title}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>

          <div className="mt-10 space-y-6 text-base text-foreground/85 leading-relaxed">
            {post.body.map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-secondary/50 p-8">
            <h3 className="font-display uppercase text-xl text-ink">
              Fale com a Ditames
            </h3>
            <p className="mt-2 text-sm text-foreground/80">
              Quer entender como podemos atuar no seu projeto?
            </p>
            <a href={WHATSAPP_URL} className="btn-primary mt-5">
              <MessageCircle size={16} /> Falar no WhatsApp
            </a>
          </div>
        </div>
      </article>

      <section className="bg-surface py-20">
        <div className="container-x">
          <h2 className="font-display text-3xl uppercase text-ink">Outras notícias</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((r) => (
              <PostCard key={r.slug} post={r} kind="noticias" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
