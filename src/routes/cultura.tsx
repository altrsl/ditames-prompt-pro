import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import * as E from "@/components/admin/InlineEditable";

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

// Fallbacks dos 5 pilares — usados apenas quando a chave ainda não existe no banco
const PILARES_FALLBACK = [
  {
    titulo: "Obstinação por Resultados",
    desc: "Não medimos esforço. Medimos entrega. Cada projeto avança até a conclusão com responsabilidade integral.",
  },
  {
    titulo: "Excelência Técnica",
    desc: "Trabalhamos no padrão mais alto da engenharia ambiental. Sem atalhos, sem improviso, sem retrabalho.",
  },
  {
    titulo: "Autorresponsabilidade",
    desc: "Cada profissional Ditames assume o que prometeu. Responsabilidade é vivida, não delegada.",
  },
  {
    titulo: "Cliente no Centro",
    desc: "Decisões e processos existem para devolver tempo, clareza e segurança a quem confia na Ditames.",
  },
  {
    titulo: "Resiliência Adaptativa",
    desc: "Cenário muda. Cliente muda. Norma muda. A Ditames se reorganiza rápido sem perder rigor técnico.",
  },
];

function CulturaPage() {
  return (
    <>
      <PageHero
        eyebrow="Cultura Ditames"
        title={
          <>
            <E.Text
              k="cultura_hero_title"
              fallback="A cultura que sustenta nossos resultados"
              className="font-display uppercase"
              multiline
            />
          </>
        }
        subtitle=""
      />

      {/* ── PILARES ─────────────────────────────────────────── */}
      <section className="bg-background py-20 md:py-24">
        <div className="container-x">
          <span className="eyebrow">
            <E.Text k="cultura_pilares_eyebrow" fallback="Os 5 pilares" />
          </span>
          <h2 className="mt-4 font-display text-3xl md:text-5xl uppercase text-ink max-w-3xl">
            <E.Text
              k="cultura_pilares_title"
              fallback="O comportamento que define quem somos"
              className="font-display text-3xl md:text-5xl uppercase text-ink"
              multiline
            />
          </h2>
          <p className="mt-5 text-muted-foreground max-w-2xl">
            <E.Text
              k="cultura_pilares_desc"
              fallback="Cinco princípios que orientam cada decisão, cada entrega e cada relação da Ditames."
              multiline
            />
          </p>

          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {PILARES_FALLBACK.map((p, i) => (
              <li
                key={i}
                className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-5">
                  <span className="font-display text-4xl text-primary/30 group-hover:text-primary shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display uppercase text-xl text-ink">
                    <E.Text
                      k={`pilar_${i + 1}_titulo`}
                      fallback={p.titulo}
                    />
                  </h3>
                </div>
                <p className="mt-4 text-base text-foreground/80 leading-relaxed">
                  <E.Text
                    k={`pilar_${i + 1}_desc`}
                    fallback={p.desc}
                    multiline
                  />
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── EUDAIMONIA ──────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24 md:py-28 topo-bg"
        style={{ background: "var(--color-secondary)" }}
      >
        <div className="container-x grid lg:grid-cols-[1fr_1.4fr] gap-10 items-center">
          <div>
            <span className="eyebrow">
              <Sparkles size={12} />
              <E.Text k="cultura_eudaimonia_eyebrow" fallback="Filosofia" />
            </span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl uppercase text-ink">
              <E.Text k="cultura_eudaimonia_titulo" fallback="Eudaimonia" />
            </h2>
            <p className="mt-3 text-sm uppercase tracking-[0.2em] text-primary">
              <E.Text
                k="cultura_eudaimonia_subtitulo"
                fallback="A vida que vale a pena ser vivida"
              />
            </p>
          </div>
          <div className="space-y-5 text-foreground/85 leading-relaxed text-lg">
            <p>
              <E.Text
                k="cultura_eudaimonia_p1"
                fallback="A Ditames se inspira no conceito grego de Eudaimonia — o florescimento humano que acontece quando técnica, propósito e desenvolvimento pessoal se alinham."
                multiline
              />
            </p>
            <p>
              <E.Text
                k="cultura_eudaimonia_p2"
                fallback="Acreditamos que o trabalho deixa de ser apenas execução quando passa a desenvolver quem o faz. Por isso investimos em formação contínua, autonomia técnica e cultura de excelência."
                multiline
              />
            </p>
            <p>
              <E.Text
                k="cultura_eudaimonia_p3"
                fallback="Resultado: equipes que crescem rápido, projetos entregues com rigor e clientes que voltam."
                multiline
              />
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPORTAMENTO E FORMA DE TRABALHO ───────────────── */}
      <section className="bg-background py-20 md:py-24">
        <div className="container-x grid lg:grid-cols-2 gap-12">
          <div>
            <span className="eyebrow">
              <E.Text k="cultura_comportamento_eyebrow" fallback="Comportamento organizacional" />
            </span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl uppercase text-ink">
              <E.Text
                k="cultura_comportamento_titulo"
                fallback="Como nos comportamos"
                className="font-display text-3xl md:text-4xl uppercase text-ink"
                multiline
              />
            </h2>
            <ul className="mt-8 space-y-4 text-foreground/80">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <E.Text
                    k={`cultura_comportamento_item_${n}`}
                    fallback={[
                      "Comunicação direta e respeitosa entre times e clientes.",
                      "Decisões baseadas em dados técnicos e em campo, não em achismo.",
                      "Erros são aprendizado público, acertos são reconhecidos.",
                      "Hierarquia de ideias, não de cargos.",
                    ][n - 1]}
                    multiline
                  />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="eyebrow">
              <E.Text k="cultura_entrega_eyebrow" fallback="Forma de trabalho" />
            </span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl uppercase text-ink">
              <E.Text
                k="cultura_entrega_titulo"
                fallback="Como entregamos"
                className="font-display text-3xl md:text-4xl uppercase text-ink"
                multiline
              />
            </h2>
            <ul className="mt-8 space-y-4 text-foreground/80">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <E.Text
                    k={`cultura_entrega_item_${n}`}
                    fallback={[
                      "Cada projeto tem responsável técnico nomeado e rastreável.",
                      "Cronograma, escopo e premissas são pactuados por escrito.",
                      "Tecnologia (SIG, drones, GPS RTK) é usada em todas as etapas.",
                      "Acompanhamento contínuo do cliente até a aprovação final.",
                    ][n - 1]}
                    multiline
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
