import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Target, Eye, Compass } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import quemSomosImg from "@/assets/quem-somos.jpg";

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
        title={<>Quatro anos de <span className="text-primary">crescimento sólido</span> em engenharia ambiental</>}
        subtitle="A Ditames nasceu para resolver o que o mercado ambiental tinha de mais lento, complexo e burocrático: transformar exigência técnica em caminho prático."
      />

      <section className="bg-background py-20 md:py-24">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <img
            src={quemSomosImg}
            alt="Equipe técnica em campo"
            className="rounded-2xl object-cover w-full aspect-[4/3]"
          />
          <div>
            <span className="eyebrow">Nossa história</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl uppercase text-ink">
              Da <span className="text-primary">técnica de campo</span> à autoridade ambiental regional
            </h2>
            <div className="mt-6 space-y-4 text-foreground/80 leading-relaxed">
              <p>
                Fundada em 2021, a Ditames combinou engenharia, meio ambiente, geotecnologia e
                gestão num único interlocutor técnico. O propósito sempre foi claro: assumir
                responsabilidade integral pelo projeto e devolver tempo, segurança e clareza
                ao cliente.
              </p>
              <p>
                Em apenas quatro anos, atendemos mais de 687 clientes em 47 municípios
                catarinenses, formamos uma rede de 40+ profissionais e parceiros e nos tornamos
                referência em licenciamento, regularização, topografia e georreferenciamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-20 md:py-24">
        <div className="container-x">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Target, t: "Missão", d: "Fortalecer pessoas, propriedades e empresas com soluções ambientais completas que promovam segurança, conformidade e crescimento sustentável." },
              { icon: Eye, t: "Visão", d: "Ser a referência nacional em soluções ambientais integradas que aliam técnica, tecnologia e responsabilidade no menor caminho possível." },
              { icon: Compass, t: "Posicionamento", d: "Uma empresa de engenharia ambiental tecnológica, com crescimento rápido, processos rastreáveis e entregas de alta autoridade técnica." },
            ].map((b) => (
              <div key={b.t} className="rounded-2xl bg-card border border-border p-8">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <b.icon size={22} />
                </div>
                <h3 className="mt-5 font-display text-2xl uppercase text-ink">{b.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{b.d}</p>
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
              Por que clientes <span className="text-primary">escolhem a Ditames</span>
            </h2>
          </div>
          <ul className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              "Responsabilidade técnica integral, do diagnóstico à entrega.",
              "Tecnologia de ponta aplicada a cada projeto (drones, GPS RTK, SIG).",
              "Acompanhamento direto com órgãos ambientais.",
              "Foco em resultados rastreáveis e previsibilidade.",
            ].map((d) => (
              <li key={d} className="flex items-start gap-3 rounded-xl border border-border bg-card p-6">
                <CheckCircle2 size={20} className="text-primary mt-0.5 shrink-0" />
                <span className="text-base text-ink">{d}</span>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex gap-3">
            <Link to="/servicos" className="btn-primary">Ver Serviços <ArrowRight size={16} /></Link>
            <Link to="/contato" className="btn-outline">Falar com Especialista</Link>
          </div>
        </div>
      </section>
    </>
  );
}
