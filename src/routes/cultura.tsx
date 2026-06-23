import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/cultura")({
  head: () => ({
    meta: [
      { title: "Cultura Ditames — 5 pilares e Eudaimonia" },
      { name: "description", content: "Conheça a cultura da Ditames Ambiental: 5 pilares de comportamento, busca pela Eudaimonia e forma de trabalho." },
      { property: "og:title", content: "Cultura Ditames" },
      { property: "og:description", content: "Excelência técnica e desenvolvimento humano caminham juntos na Ditames." },
    ],
  }),
  component: CulturaPage,
});

const pilares = [
  {
    t: "Obstinação por Resultados",
    d: "Não medimos esforço. Medimos entrega. Cada projeto avança até a conclusão com responsabilidade integral.",
  },
  {
    t: "Excelência Técnica",
    d: "Trabalhamos no padrão mais alto da engenharia ambiental. Sem atalhos, sem improviso, sem retrabalho.",
  },
  {
    t: "Autorresponsabilidade",
    d: "Cada profissional Ditames assume o que prometeu. Responsabilidade é vivida, não delegada.",
  },
  {
    t: "Cliente no Centro",
    d: "Decisões e processos existem para devolver tempo, clareza e segurança a quem confia na Ditames.",
  },
  {
    t: "Resiliência Adaptativa",
    d: "Cenário muda. Cliente muda. Norma muda. A Ditames se reorganiza rápido sem perder rigor técnico.",
  },
];

function CulturaPage() {
  return (
    <>
      <PageHero
        eyebrow="Cultura Ditames"
        title={<>A cultura que <span className="text-primary">sustenta</span> nossos resultados</>}
        subtitle="Excelência técnica e desenvolvimento humano caminham juntos. Aqui as pessoas crescem com a empresa."
      />

      <section className="bg-background py-20 md:py-24">
        <div className="container-x">
          <span className="eyebrow">Os 5 pilares</span>
          <h2 className="mt-4 font-display text-3xl md:text-5xl uppercase text-ink max-w-3xl">
            O comportamento que define <span className="text-primary">quem somos</span>
          </h2>
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {pilares.map((p, i) => (
              <li key={p.t} className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:-translate-y-0.5">
                <div className="flex items-center gap-5">
                  <span className="font-display text-4xl text-primary/30 group-hover:text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display uppercase text-xl text-ink">{p.t}</h3>
                </div>
                <p className="mt-4 text-base text-foreground/80 leading-relaxed">{p.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="relative overflow-hidden py-24 md:py-28 topo-bg"
        style={{ background: "var(--color-secondary)" }}
      >
        <div className="container-x grid lg:grid-cols-[1fr_1.4fr] gap-10 items-center">
          <div>
            <span className="eyebrow"><Sparkles size={12} /> Filosofia</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl uppercase text-ink">
              Eudaimonia
            </h2>
            <p className="mt-3 text-sm uppercase tracking-[0.2em] text-primary">A vida que vale a pena ser vivida</p>
          </div>
          <div className="space-y-5 text-foreground/85 leading-relaxed text-lg">
            <p>
              A Ditames se inspira no conceito grego de Eudaimonia — o florescimento humano que
              acontece quando técnica, propósito e desenvolvimento pessoal se alinham.
            </p>
            <p>
              Acreditamos que o trabalho deixa de ser apenas execução quando passa a desenvolver
              quem o faz. Por isso investimos em formação contínua, autonomia técnica e cultura
              de excelência.
            </p>
            <p>
              Resultado: equipes que crescem rápido, projetos entregues com rigor e clientes que
              voltam.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 md:py-24">
        <div className="container-x grid lg:grid-cols-2 gap-12">
          <div>
            <span className="eyebrow">Comportamento organizacional</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl uppercase text-ink">
              Como nos <span className="text-primary">comportamos</span>
            </h2>
            <ul className="mt-8 space-y-4 text-foreground/80">
              <li>• Comunicação direta e respeitosa entre times e clientes.</li>
              <li>• Decisões baseadas em dados técnicos e em campo, não em achismo.</li>
              <li>• Erros são aprendizado público, acertos são reconhecidos.</li>
              <li>• Hierarquia de ideias, não de cargos.</li>
            </ul>
          </div>
          <div>
            <span className="eyebrow">Forma de trabalho</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl uppercase text-ink">
              Como nós <span className="text-primary">entregamos</span>
            </h2>
            <ul className="mt-8 space-y-4 text-foreground/80">
              <li>• Cada projeto tem responsável técnico nomeado e rastreável.</li>
              <li>• Cronograma, escopo e premissas são pactuados por escrito.</li>
              <li>• Tecnologia (SIG, drones, GPS RTK) é usada em todas as etapas.</li>
              <li>• Acompanhamento contínuo do cliente até a aprovação final.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
