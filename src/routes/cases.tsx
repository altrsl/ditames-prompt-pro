import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Factory, Trees, HardHat, LandPlot, Wrench } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [
      { title: "Cases — Ditames Ambiental" },
      { name: "description", content: "Empresas e propriedades atendidas pela Ditames em diferentes setores: indústria, construção, agronegócio e loteamentos." },
      { property: "og:title", content: "Cases — Ditames Ambiental" },
      { property: "og:description", content: "Confiança construída no campo, em mais de 47 municípios catarinenses." },
    ],
  }),
  component: CasesPage,
});

const cases = [
  { name: "Madefrahm", sector: "Indústria moveleira", icon: Factory },
  { name: "Metalúrgica Riosulense", sector: "Metalurgia", icon: Wrench },
  { name: "BIOCAL", sector: "Insumos agrícolas", icon: Trees },
  { name: "Elber", sector: "Refrigeração industrial", icon: Factory },
  { name: "Prefabricar", sector: "Construção", icon: HardHat },
  { name: "Construtora Sul", sector: "Empreendimentos", icon: Building2 },
  { name: "Loteadora Vale", sector: "Loteamentos urbanos", icon: LandPlot },
  { name: "Agro Catarinense", sector: "Agronegócio", icon: Trees },
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
          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-xl border border-border">
            {cases.map((c) => (
              <div key={c.name} className="bg-card p-8 transition-colors hover:bg-secondary/40">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-secondary text-primary">
                  <c.icon size={22} />
                </div>
                <div className="mt-5 font-display text-lg uppercase text-ink">{c.name}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{c.sector}</div>
              </div>
            ))}
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
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
