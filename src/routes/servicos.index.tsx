import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { services } from "@/lib/services";

export const Route = createFileRoute("/servicos/")({
  head: () => ({
    meta: [
      { title: "Serviços — Ditames Ambiental" },
      { name: "description", content: "12 áreas de atuação da Ditames: licenciamento, regularização, topografia, georreferenciamento, inventário florestal, geoprocessamento e mais." },
      { property: "og:title", content: "Serviços ambientais — Ditames" },
      { property: "og:description", content: "Soluções ambientais integradas para indústrias, propriedades rurais, loteamentos e construtoras." },
    ],
  }),
  component: ServicosHub,
});

function ServicosHub() {
  return (
    <>
      <PageHero
        eyebrow="O que entregamos"
        title={<>Doze áreas de atuação <span className="text-primary">integradas</span></>}
        subtitle="Cobrimos todo o ciclo ambiental de um projeto — do diagnóstico inicial às aprovações finais — com responsabilidade técnica integral."
      />

      <section className="bg-background py-20 md:py-24">
        <div className="container-x">
          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3 overflow-hidden rounded-xl border border-border">
            {services.map((s) => (
              <Link
                key={s.slug}
                to="/servicos/$slug"
                params={{ slug: s.slug }}
                className="group flex flex-col gap-5 bg-card p-8 transition-all hover:bg-secondary/60"
              >
                <div className="grid h-12 w-12 place-items-center rounded-lg border border-border text-primary transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  <s.icon size={22} strokeWidth={1.6} />
                </div>
                <h3 className="font-display text-xl uppercase text-ink">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.short}</p>
                <span className="mt-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                  Conhecer <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
