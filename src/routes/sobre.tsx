import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Target, Eye, Compass } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import quemSomosImg from "@/assets/quem-somos.jpg";
import * as E from "@/components/admin/InlineEditable";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Ditames Ambiental — Trajetória, missão e visão" },
      { name: "description", content: "Em 4 anos, a Ditames consolidou autoridade técnica em engenharia ambiental, atendendo 687+ clientes e 47 municípios em Santa Catarina." },
      { property: "og:title", content: "Sobre a Ditames Ambiental" },
      { property: "og:description", content: "Conheça a trajetória, missão e visão da Ditames Ambiental." },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <>
      <PageHero
        eyebrow="Sobre a Ditames"
        title={<><E.Text k="sobre_hero_title" fallback="Quatro anos de crescimento sólido em engenharia ambiental" /></>}
        subtitle={<E.Text k="sobre_hero_subtitle" fallback="A Ditames nasceu para resolver o que o mercado ambiental tinha de mais lento, complexo e burocrático: transformar exigência técnica em caminho prático." multiline />}
      />

      <section className="bg-background py-20 md:py-24">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <E.Image k="sobre_image" fallback={quemSomosImg}
            alt="Equipe técnica em campo"
            className="rounded-2xl object-cover w-full aspect-[4/3]" folder="homepage" />
          <div>
            <span className="eyebrow">Nossa história</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl uppercase text-ink">
              <E.Text k="sobre_historia_title" fallback="Da técnica de campo à autoridade ambiental regional"
                className="font-display text-3xl md:text-4xl uppercase text-ink" multiline />
            </h2>
            <div className="mt-6 space-y-4 text-foreground/80 leading-relaxed">
              <p><E.Text k="sobre_historia_p1" fallback="Fundada em 16/08/2022, a Ditames combinou engenharia, meio ambiente, geotecnologia e gestão num único interlocutor técnico. O propósito sempre foi claro: assumir responsabilidade integral pelo projeto e devolver tempo, segurança e clareza ao cliente." multiline /></p>
              <p><E.Text k="sobre_historia_p2" fallback="Em apenas quatro anos, atendemos mais de 687 clientes em 47 municípios catarinenses, formamos uma rede de 40+ profissionais e parceiros e nos tornamos referência em licenciamento, regularização, topografia e georreferenciamento." multiline /></p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-20 md:py-24">
        <div className="container-x">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Target, k: "sobre_missao", t: "Missão", d: "Fortalecer pessoas, propriedades e empresas com soluções ambientais completas que promovam segurança, conformidade e crescimento sustentável." },
              { icon: Eye,    k: "sobre_visao",  t: "Visão",  d: "Ser a referência nacional em soluções ambientais integradas que aliam técnica, tecnologia e responsabilidade no menor caminho possível." },
              { icon: Compass,k: "sobre_posicionamento", t: "Posicionamento", d: "Uma empresa de engenharia ambiental tecnológica, com crescimento rápido, processos rastreáveis e entregas de alta autoridade técnica." },
            ].map((b) => (
              <div key={b.t} className="rounded-2xl bg-card border border-border p-8">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <b.icon size={22} />
                </div>
                <h3 className="mt-5 font-display text-2xl uppercase text-ink">{b.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  <E.Text k={b.k} fallback={b.d} multiline />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-20 md:py-24">
        <div className="container-x">
          <div className="max-w-2xl">
            <span className="eyebrow">O que nos diferencia</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl uppercase text-ink">
              <E.Text k="sobre_diferencia_title" fallback="Mais do que consultoria — somos seu time ambiental"
                className="font-display text-3xl md:text-4xl uppercase text-ink" multiline />
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              <E.Text k="sobre_diferencia_desc" fallback="Enquanto outros entregam laudos, nós entregamos resultado. Assumimos a condução completa de cada projeto, da licença à regularização, com rastreabilidade e transparência em cada etapa." multiline />
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { k: "sobre_dif_1", v: "Gestão completa do projeto" },
              { k: "sobre_dif_2", v: "Equipe multidisciplinar" },
              { k: "sobre_dif_3", v: "Tecnologia de campo própria" },
              { k: "sobre_dif_4", v: "Presença em 47 municípios" },
              { k: "sobre_dif_5", v: "Aprovação como meta" },
              { k: "sobre_dif_6", v: "Comunicação transparente" },
            ].map((d) => (
              <div key={d.k} className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
                <CheckCircle2 size={18} className="text-primary shrink-0" />
                <span className="text-sm font-medium text-ink">
                  <E.Text k={d.k} fallback={d.v} />
                </span>
              </div>
            ))}
          </div>
          <Link to="/contato" className="btn-primary mt-10">Falar com a equipe <ArrowRight size={16} /></Link>
        </div>
      </section>
    </>
  );
}
