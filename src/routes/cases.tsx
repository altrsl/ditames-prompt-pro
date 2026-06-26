import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Factory, Trees, HardHat, LandPlot, Wrench, Sprout, ExternalLink } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [
      { title: "Cases — Ditames Ambiental | Soluções ambientais para empresas e propriedades" },
      { name: "description", content: "Conheça empresas e propriedades atendidas pela Ditames. Regularização ambiental, licenciamento e soluções técnicas para indústrias, construtoras, loteadores e proprietários rurais em Santa Catarina." },
      { property: "og:title", content: "Cases — Ditames Ambiental" },
      { property: "og:description", content: "Confiança construída no campo, em mais de 47 municípios catarinenses." },
    ],
  }),
  component: CasesPage,
});

const cases = [
  {
    name: "Madefrahm",
    sector: "Indústria moveleira",
    icon: Factory,
    desc: "Regularização ambiental de empreendimento industrial.",
  },
  {
    name: "Metalúrgica Riosulense",
    sector: "Metalurgia",
    icon: Wrench,
    desc: "Apoio contínuo em processos de licenciamento.",
  },
  {
    name: "BIOCAL",
    sector: "Insumos agrícolas",
    icon: Trees,
    desc: "Estudos ambientais e suporte técnico.",
  },
  {
    name: "Elber",
    sector: "Refrigeração industrial",
    icon: Factory,
    desc: "Gestão ambiental recorrente.",
  },
  {
    name: "Prefabricar",
    sector: "Construção",
    icon: HardHat,
    desc: "Licenciamento e regularização de canteiro de obras.",
  },
  {
    name: "Construtora Sul",
    sector: "Empreendimentos",
    icon: Building2,
    desc: "Estudos de impacto ambiental e aprovações.",
  },
  {
    name: "Loteadora Vale",
    sector: "Loteamentos urbanos",
    icon: LandPlot,
    desc: "Gestão ambiental integrada de loteamento.",
  },
  {
    name: "Agro Catarinense",
    sector: "Agronegócio",
    icon: Sprout,
    desc: "Regularização fundiária e ambiental de propriedade rural.",
  },
];

function CasesPage() {
  return (
    <>
      <PageHero
        eyebrow="Cases"
        title={<>Confiança construída <span className="text-primary">no campo</span></>}
        subtitle="Empresas, propriedades e empreendedores que escolheram a Ditames para conduzir seus projetos ambientais."
      />

      <section className="bg-background py-20 md:py-24">
        <div className="container-x">

          {/* Grid de cases */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cases.map((c) => (
              <div
                key={c.name}
                className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card"
              >
                {/* Área da logo */}
                <div
                  className="relative flex items-center justify-center border-b border-border bg-secondary/30 px-4"
                  style={{ minHeight: "100px" }}
                  aria-label={`Logo ${c.name}`}
                >
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(96,148,48,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(96,148,48,.15) 1px, transparent 1px)",
                      backgroundSize: "22px 22px",
                    }}
                  />
                  <span className="relative font-display text-xl uppercase tracking-wider text-ink/70 text-center leading-tight py-6">
                    {c.name}
                  </span>
                </div>

                {/* Conteúdo */}
                <div className="flex flex-col flex-1 px-5 py-5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    {c.sector}
                  </div>
                  <div className="mt-1 font-display text-base uppercase text-ink leading-tight">
                    {c.name}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                    {c.desc}
                  </p>
                  <button
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary/50 cursor-default"
                    disabled
                    title="Em breve"
                  >
                    Saiba mais <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Marcas exibidas em formato textual enquanto aguardamos a liberação oficial das logos pelos clientes.
          </p>

          {/* Números */}
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              { v: "687+", l: "clientes atendidos" },
              { v: "47", l: "municípios em SC" },
              { v: "40+", l: "profissionais e parceiros" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-secondary/40 p-6">
                <div className="font-display text-4xl text-primary">{s.v}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link to="/contato" className="btn-primary">Quero ser o próximo case</Link>
          </div>
        </div>
      </section>
    </>
  );
}
