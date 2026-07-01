import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Trees,
  Factory,
  HardHat,
  Leaf,
  Layers,
  LandPlot,
  Lightbulb,
  Plane,
  Satellite,
  Map as MapIcon,
  Brain,
  Cpu,
  Sparkles,
  CheckCircle2,
  Search,
  ClipboardList,
  Compass,
  FlaskConical,
  FileSignature,
  Repeat,
  AlertTriangle,
  ChevronDown,
  ShieldCheck,
  FileWarning,
  Sprout,
  Droplets,
  Building,
  HelpCircle,
} from "lucide-react";
import heroImg from "@/assets/hero-ditames.jpg";
import quemSomosImg from "@/assets/quem-somos.jpg";
import tecnologiaImg from "@/assets/tecnologia.jpg";
import { services } from "@/lib/services";
import { formatDate } from "@/lib/content";
import type { NormalizedCase, NormalizedFaqItem, NormalizedPost } from "@/lib/data";
import * as E from "@/components/admin/InlineEditable";

export const Route = createFileRoute("/")({
  loader: async () => {
    return {};
  },
  head: () => ({
    meta: [
      { title: "Ditames Ambiental — Engenharia ambiental, geotecnologia e licenciamento" },
      {
        name: "description",
        content:
          "Transformamos desafios ambientais em oportunidades de crescimento. Licenciamento, regularização, topografia, georreferenciamento e geoprocessamento.",
      },
      { property: "og:title", content: "Ditames Ambiental" },
      {
        property: "og:description",
        content:
          "Soluções ambientais completas para proprietários rurais, indústrias, loteadores e construtoras.",
      },
    ],
  }),
  component: Home,
});

/* ---------- helpers ---------- */

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("reveal");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const dur = 1500;
          const step = (t: number) => {
            const p = Math.min((t - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.floor(eased * to));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

/* ---------- sections ---------- */


function Hero() {
  const [bg, setBg] = useState(heroImg);
  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden">
      <E.Image
        k="hero_image" fallback={heroImg}
        alt="Drone sobrevoando área verde com equipe técnica em operação"
        className="absolute inset-0 h-full w-full object-cover"
        folder="homepage"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/80" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(115deg, transparent 0 80px, rgba(219,231,211,.08) 80px 81px)" }} />

      <div className="container-x relative z-10 flex min-h-[100svh] flex-col justify-center pt-32 pb-20 text-white">
        <span className="eyebrow text-secondary mb-6">Ditames Ambiental</span>
        <h1 className="font-display text-[clamp(2.5rem,6.5vw,5.75rem)] uppercase max-w-5xl">
          <E.Text k="hero_title" fallback="Transformamos desafios ambientais em oportunidades de crescimento, segurança e desenvolvimento."
            className="font-display text-[clamp(2.5rem,6.5vw,5.75rem)] uppercase" multiline />
        </h1>
        <p className="mt-8 max-w-2xl text-base md:text-lg text-white/85 leading-relaxed">
          <E.Text k="hero_subtitle" fallback="Fortalecemos pessoas, propriedades e empresas por meio de soluções ambientais completas, promovendo segurança, conformidade legal e crescimento sustentável." multiline />
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to="/ia" className="btn-primary"><Sparkles size={16} /> Solicitar Atendimento</Link>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-white/60">ROLE PARA EXPLORAR</div>
      </div>
    </section>
  );
}

function PublicoAlvo() {
  const ref = useReveal<HTMLDivElement>();
  const segs = [
    { icon: Trees, title: "Proprietários Rurais", desc: "Regularização fundiária e ambiental para sua propriedade." },
    { icon: LandPlot, title: "Loteadores e Incorporadoras", desc: "Estudos, projetos e aprovações para empreender com segurança." },
    { icon: Factory, title: "Indústrias", desc: "Licenciamento e gestão ambiental industrial completa." },
    { icon: HardHat, title: "Construtoras", desc: "Apoio técnico e ambiental para canteiros e grandes obras." },
  ];
  return (
    <section className="bg-background py-24 md:py-32">
      <div ref={ref} className="container-x">
        <div className="max-w-3xl">
          <span className="eyebrow">Para quem atuamos</span>
          <h2 className="mt-4 text-4xl md:text-5xl uppercase text-ink">
            <E.Text k="publico_title" fallback="Soluções para quem precisa crescer com segurança" className="text-4xl md:text-5xl uppercase text-ink font-display" multiline />
          </h2>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl">
            <E.Text k="publico_desc" fallback="Atendemos desde proprietários rurais até grandes empreendimentos industriais, oferecendo soluções ambientais que unem técnica, estratégia e segurança para cada realidade." multiline />
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {segs.map((s) => (
            <div
              key={s.title}
              className="group rounded-xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-primary/40"
            >
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <s.icon size={22} />
              </div>
              <h3 className="mt-5 font-display text-xl uppercase text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Numeros() {
  const items = [
    { v: 4, suf: "", label: "anos de mercado" },
    { v: 687, suf: "", label: "clientes atendidos" },
    { v: 47, suf: "", label: "municípios em SC" },
    { v: 40, suf: "+", label: "profissionais e parceiros" },
  ];
  return (
    <section className="relative bg-ink py-20 md:py-24 overflow-hidden" style={{ background: "oklch(0.22 0.03 140)" }}>
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(60deg, transparent 0 50px, rgba(255,255,255,.6) 50px 51px), repeating-linear-gradient(-60deg, transparent 0 50px, rgba(255,255,255,.4) 50px 51px)",
        }}
      />
      <div className="container-x relative">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-white">
          {items.map((i) => (
            <div key={i.label} className="border-l-2 border-primary/60 pl-5">
              <div className="font-display text-5xl md:text-6xl text-white">
                <Counter to={i.v} suffix={i.suf} />
              </div>
              <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/70">
                {i.label}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-12 text-sm uppercase tracking-[0.25em] text-white/50 text-center">
          Atuação em diferentes estados do Brasil
        </p>
      </div>
    </section>
  );
}

function Crescimento() {
  return (
    <section className="relative py-24 md:py-32 topo-bg" style={{ background: "var(--color-secondary)" }}>
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="eyebrow">Trajetória</span>
          <h2 className="mt-4 text-4xl md:text-5xl uppercase text-ink">
            <E.Text k="crescimento_title" fallback="Crescimento que reflete confiança" className="text-4xl md:text-5xl uppercase text-ink font-display" multiline />
          </h2>
          <p className="mt-6 text-base md:text-lg text-foreground/80 leading-relaxed max-w-xl">
            <E.Text k="crescimento_desc" fallback="Em apenas 4 anos de atuação, a Ditames consolidou sua presença em 47 municípios catarinenses, atendeu mais de 687 clientes e construiu uma rede com mais de 40 profissionais e parceiros especializados." multiline />
          </p>
          <Link to="/sobre" className="btn-primary mt-8">
            Conheça Nossa História <ArrowRight size={16} />
          </Link>
        </div>
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            {[
              { k: "2022", v: "Fundação" },
              { k: "47", v: "Municípios SC" },
              { k: "687", v: "Clientes" },
              { k: "40+", v: "Especialistas" },
            ].map((b) => (
              <div key={b.k} className="rounded-xl bg-white p-6 shadow-card">
                <div className="font-display text-4xl text-primary">{b.k}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {b.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function QuemSomos() {
  return (
    <section id="quem-somos" className="bg-background py-24 md:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <E.Image k="quem_somos_image" fallback={quemSomosImg}
            alt="Equipe técnica analisando mapas em campo"
            className="rounded-xl object-cover w-full aspect-[4/3]" folder="homepage" />
          <div className="absolute -bottom-6 -right-6 hidden md:block max-w-xs rounded-xl bg-primary p-6 text-primary-foreground shadow-glow">
            <p className="text-sm leading-relaxed">
              <E.Text k="quem_somos_quote" fallback='"Assumimos a responsabilidade de conduzir cada projeto do início ao fim, permitindo que o cliente foque no seu crescimento."' multiline />
            </p>
          </div>
        </div>
        <div>
          <span className="eyebrow">Quem somos</span>
          <h2 className="mt-4 text-4xl md:text-5xl uppercase text-ink">
            <E.Text k="quem_somos_title" fallback="Técnica, tecnologia e pessoas"
              className="text-4xl md:text-5xl uppercase text-ink font-display" multiline />
          </h2>
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            <E.Text k="quem_somos_desc" fallback="A Ditames une engenharia, meio ambiente, geotecnologia e gestão para entregar soluções seguras e eficientes." multiline />
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {["Engenharia", "Meio Ambiente", "Geotecnologia", "Gestão"].map((p) => (
              <div key={p} className="flex items-center gap-2 text-sm font-medium text-ink">
                <CheckCircle2 size={18} className="text-primary" /> {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Servicos() {
  return (
    <section id="servicos" className="bg-surface py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="eyebrow">O que entregamos</span>
            <h2 className="mt-4 text-4xl md:text-5xl uppercase text-ink">
              <E.Text k="servicos_title" fallback="Soluções ambientais integradas"
                className="text-4xl md:text-5xl uppercase text-ink font-display" multiline />
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            <E.Text k="servicos_desc" fallback="Cobrimos todo o ciclo ambiental de um projeto — do diagnóstico às aprovações finais. Nosso portfólio evolui continuamente para acompanhar novas demandas." multiline />
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.slug}
              to="/servicos/$slug"
              params={{ slug: s.slug }}
              className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-secondary/30"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <s.icon size={18} strokeWidth={1.7} />
              </div>
              <span className="text-sm font-semibold text-ink flex-1">{s.title}</span>
              <ArrowRight size={14} className="text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/servicos" className="btn-outline">
            Ver todos os serviços <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Metodo() {
  const steps = [
    { icon: Search, t: "Diagnóstico" },
    { icon: ClipboardList, t: "Planejamento" },
    { icon: Compass, t: "Levantamento de Campo" },
    { icon: FlaskConical, t: "Estudos Técnicos" },
    { icon: FileSignature, t: "Protocolos e Aprovações" },
    { icon: Repeat, t: "Acompanhamento" },
  ];
  return (
    <section id="metodo" className="bg-background py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <span className="eyebrow">Como trabalhamos</span>
          <h2 className="mt-4 text-4xl md:text-5xl uppercase text-ink">
            <E.Text k="metodo_title" fallback="Método Ditames"
              className="text-4xl md:text-5xl uppercase text-ink font-display" />
          </h2>
          <p className="mt-6 text-muted-foreground">
            <E.Text k="metodo_desc" fallback="Um processo claro e rastreável que assegura previsibilidade e qualidade em cada etapa do projeto." multiline />
          </p>
        </div>
        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border md:block" />
          <ol className="grid gap-8 md:grid-cols-6">
            {steps.map((s, i) => (
              <li key={s.t} className="relative">
                <div className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-card">
                  <s.icon size={20} strokeWidth={1.8} />
                </div>
                <div className="mt-5">
                  <div className="text-[10px] font-bold tracking-[0.25em] text-primary">
                    ETAPA {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-2 font-display text-lg uppercase text-ink">{s.t}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Diferenciais() {
  const items = [
    {
      icon: Layers,
      t: "Soluções Integradas",
      d: "Engenharia, ambiental e geotecnologia em um único interlocutor técnico.",
    },
    {
      icon: CheckCircle2,
      t: "Compromisso com Resultados",
      d: "Conduzimos o projeto até a aprovação — sem terceirizar a responsabilidade.",
    },
    {
      icon: Cpu,
      t: "Tecnologia e Inovação",
      d: "Drones, GPS RTK, SIG e modelagem aplicados a cada entrega.",
    },
    {
      icon: Lightbulb,
      t: "Entendimento e Solução",
      d: "Diagnóstico preciso e caminho prático para o que parece complexo.",
    },
  ];
  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <span className="eyebrow">Diferenciais</span>
          <h2 className="mt-4 text-4xl md:text-5xl uppercase text-ink">
            <E.Text k="diferenciais_title" fallback="Por que escolher a Ditames"
              className="text-4xl md:text-5xl uppercase text-ink font-display" multiline />
          </h2>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((i, idx) => (
            <div key={i.t} className="rounded-xl bg-card border border-border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-secondary text-primary">
                <i.icon size={22} strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 font-display text-xl uppercase text-ink">
                <E.Text k={`diferencial_${idx}_title`} fallback={i.t} />
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                <E.Text k={`diferencial_${idx}_desc`} fallback={i.d} multiline />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tecnologia() {
  const stack = [
    { icon: Plane, t: "Drones" },
    { icon: Satellite, t: "GPS RTK" },
    { icon: MapIcon, t: "SIG" },
    { icon: Layers, t: "Geoprocessamento" },
    { icon: Brain, t: "Inteligência Territorial" },
    { icon: Cpu, t: "Modelagem Ambiental" },
  ];
  return (
    <section id="tecnologia" className="bg-background py-24 md:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div>
          <span className="eyebrow">Stack técnico</span>
          <h2 className="mt-4 text-4xl md:text-5xl uppercase text-ink">
            <E.Text k="tecnologia_title" fallback="Tecnologia que precisa, decisão que acelera"
              className="text-4xl md:text-5xl uppercase text-ink font-display" multiline />
          </h2>
          <p className="mt-6 text-muted-foreground max-w-lg">
            <E.Text k="tecnologia_desc" fallback="Aplicamos tecnologias de ponta para gerar dados confiáveis, reduzir prazos e ampliar a capacidade de decisão dos nossos clientes." multiline />
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {stack.map((s) => (
              <div key={s.t} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/50">
                <s.icon size={20} className="text-primary" strokeWidth={1.6} />
                <span className="text-sm font-semibold text-ink">{s.t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <E.Image k="tecnologia_image" fallback={tecnologiaImg}
            alt="Drone e equipamento topográfico em campo"
            className="rounded-xl object-cover w-full aspect-[4/3]" folder="homepage" />
          <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(96,148,48,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(96,148,48,.2) 1px, transparent 1px)",
            backgroundSize: "44px 44px", mixBlendMode: "overlay",
          }} />
        </div>
      </div>
    </section>
  );
}

function IA() {
  const examples = [
    "Quero abrir uma indústria",
    "Regularizar imóvel rural",
    "Tenho uma nascente",
    "Fazer um loteamento",
    "Não sei o que preciso",
  ];
  return (
    <section className="bg-background py-20">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-2xl topo-bg p-10 md:p-14" style={{ background: "var(--color-secondary)" }}>
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="eyebrow">Recepcionista Digital</span>
              <h2 className="mt-4 text-3xl md:text-5xl uppercase text-ink">
                <E.Text k="ia_title" fallback="Olá! Posso te ajudar a entender seu caso?"
                  className="text-3xl md:text-5xl uppercase text-ink font-display" multiline />
              </h2>
              <p className="mt-5 text-foreground/80 max-w-lg">
                <E.Text k="ia_desc" fallback="Sou a recepcionista digital da Ditames. Em uma conversa simples, te ouço, ajudo a identificar qual solução ambiental você precisa e, quando fizer sentido, te encaminho para um especialista da nossa equipe." multiline />
              </p>
              <Link to="/ia" className="btn-primary mt-8">
                <Sparkles size={16} /> Conversar com a recepcionista
              </Link>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-card">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Brain size={14} className="text-primary" /> Como posso ajudar?
              </div>
              <ul className="mt-4 space-y-2">
                {examples.map((e) => (
                  <li
                    key={e}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-primary/60 hover:bg-secondary cursor-pointer"
                  >
                    <span>{e}</span>
                    <ArrowRight size={14} className="text-primary" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function NotificacaoAmbiental() {
  const cards = [
    { icon: FileWarning, label: "Recebi uma multa ambiental" },
    { icon: ShieldCheck, label: "Preciso regularizar uma área" },
    { icon: Trees, label: "Tenho problemas com APP" },
    { icon: AlertTriangle, label: "Preciso resolver uma exigência ambiental" },
    { icon: Droplets, label: "Tenho dúvidas sobre uma nascente" },
    { icon: HelpCircle, label: "Quero entender minha situação" },
  ];
  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-3xl mx-auto text-center">
          <span className="eyebrow">Estamos aqui para ajudar</span>
          <h2 className="mt-4 text-3xl md:text-5xl uppercase text-ink">
            Recebeu uma notificação, multa ou{" "}
            <span className="text-primary">exigência ambiental?</span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Muitas pessoas procuram ajuda quando recebem uma multa ambiental, uma exigência de
            regularização, uma notificação de órgão ambiental ou enfrentam dificuldades para
            compreender suas obrigações ambientais. A Ditames auxilia na identificação da situação,
            elaboração das soluções técnicas necessárias e condução dos processos de regularização.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.label}
              to="/ia"
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-primary/50"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <c.icon size={20} />
              </div>
              <span className="text-sm font-semibold text-ink flex-1 leading-snug">{c.label}</span>
              <ArrowRight size={14} className="text-primary opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/ia" className="btn-primary">
            <Sparkles size={16} /> Falar com a Recepcionista Ambiental
          </Link>
        </div>
      </div>
    </section>
  );
}

function FAQ({ items }: { items: NormalizedFaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-background py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-3xl mx-auto">
          <span className="eyebrow text-center block">Dúvidas Frequentes</span>
          <h2 className="mt-4 text-3xl md:text-5xl uppercase text-ink text-center">
            Respostas para quem{" "}
            <span className="text-primary">não sabe por onde começar</span>
          </h2>
          <p className="mt-6 text-muted-foreground text-center">
            Situações ambientais complexas explicadas em linguagem direta.
          </p>

          <div className="mt-12 space-y-3">
            {items.map((item, i) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold text-ink hover:text-primary transition-colors"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-primary transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                {open === i && (
                  <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                    {item.answer}
                    <div className="mt-4">
                      <Link to="/ia" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                        <Sparkles size={12} /> Falar com a Recepcionista Ambiental <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ConteudoAtualizacoes({ blog, news }: { blog: NormalizedPost[]; news: NormalizedPost[] }) {
  const noticias = news;
  return (
    <section className="bg-surface py-24">
      <div className="container-x">
        <div className="max-w-2xl">
          <span className="eyebrow">Conteúdo e Atualizações</span>
          <h2 className="mt-4 text-4xl md:text-5xl uppercase text-ink">
            Conhecimento e <span className="text-primary">novidades</span> Ditames
          </h2>
          <p className="mt-5 text-muted-foreground">
            Educação ambiental em linguagem clara no Blog. Marcos institucionais e projetos em Notícias.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <div>
            <div className="flex items-end justify-between">
              <h3 className="font-display text-2xl uppercase text-ink">Blog</h3>
              <Link to="/blog" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-primary hover:underline">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {blog.map((p) => (
                <Link
                  key={p.slug}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group block rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-card hover:border-primary/40"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    {p.category}
                  </div>
                  <div className="mt-2 font-display uppercase text-lg text-ink leading-tight">
                    {p.title}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{formatDate(p.date)} · {p.readTime}</div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between">
              <h3 className="font-display text-2xl uppercase text-ink">Notícias</h3>
              <Link to="/noticias" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-primary hover:underline">
                Ver todas <ArrowRight size={12} />
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {noticias.map((p) => (
                <Link
                  key={p.slug}
                  to="/noticias/$slug"
                  params={{ slug: p.slug }}
                  className="group block rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-card hover:border-primary/40"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    {p.category}
                  </div>
                  <div className="mt-2 font-display uppercase text-lg text-ink leading-tight">
                    {p.title}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{formatDate(p.date)} · {p.readTime}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Cases({ items }: { items: NormalizedCase[] }) {
  return (
    <section id="cases" className="bg-surface py-24">
      <div className="container-x">
        <div className="max-w-2xl">
          <span className="eyebrow">Cases</span>
          <h2 className="mt-4 text-4xl md:text-5xl uppercase text-ink">
            Confiança construída <span className="text-primary">no campo</span>
          </h2>
          <p className="mt-5 text-muted-foreground">
            Empresas que escolheram a Ditames para conduzir seus desafios ambientais
            com responsabilidade técnica.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((c) => (
            <div
              key={c.id}
              className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card"
            >
              {/* Área da logo */}
              <div
                className="relative flex items-center justify-center border-b border-border bg-secondary/30 px-4 py-6"
                style={{ minHeight: "96px" }}
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
                {c.logoUrl ? (
                  <img
                    src={c.logoUrl}
                    alt={`Logo ${c.name}`}
                    className="relative max-h-14 max-w-full object-contain"
                  />
                ) : (
                  <span className="relative font-display text-xl uppercase tracking-wider text-ink/70 text-center leading-tight">
                    {c.name}
                  </span>
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex flex-col flex-1 px-5 py-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  {c.sector}
                </div>
                <div className="mt-1 text-sm font-semibold text-ink leading-tight">
                  {c.name}
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">
                  {c.desc}
                </p>
                <Link
                  to="/cases"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Saiba mais <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Marcas exibidas em formato textual enquanto aguardamos a liberação oficial das logos pelos clientes.
          </p>
          <Link to="/cases" className="btn-outline shrink-0">
            Ver todos os cases <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}


function Cultura() {
  const pilares = [
    "Obstinação por Resultados",
    "Excelência Técnica",
    "Autorresponsabilidade",
    "Cliente no Centro",
    "Resiliência Adaptativa",
  ];
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.1fr] items-center">
        <div>
          <span className="eyebrow">Cultura Ditames</span>
          <h2 className="mt-4 text-4xl md:text-5xl uppercase text-ink">
            <E.Text k="cultura_title" fallback="A cultura que sustenta nossos resultados"
              className="text-4xl md:text-5xl uppercase text-ink font-display" multiline />
          </h2>
          <p className="mt-6 text-muted-foreground max-w-lg">
            <E.Text k="cultura_desc" fallback="Excelência técnica e desenvolvimento humano caminham juntos na Ditames." multiline />
          </p>
          <Link to="/cultura" className="btn-outline mt-8">
            Conheça a Cultura Completa <ArrowRight size={16} />
          </Link>
        </div>
        <ul className="grid gap-3">
          {pilares.map((p, i) => (
            <li key={p} className="group flex items-center gap-5 rounded-xl border border-border bg-card px-6 py-5 transition-all hover:border-primary/50 hover:translate-x-1">
              <span className="font-display text-3xl text-primary/40 group-hover:text-primary">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-display uppercase text-lg text-ink">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CTAFinal() {
  return (
    <section id="contato" className="relative overflow-hidden py-24 md:py-32" style={{ background: "oklch(0.32 0.08 138)" }}>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 30%, rgba(255,255,255,.4) 0, transparent 50%), repeating-linear-gradient(45deg, transparent 0 60px, rgba(255,255,255,.15) 60px 61px)",
        }}
      />
      <div className="container-x relative text-center">
        <span className="eyebrow text-secondary">Vamos conversar</span>
        <h2 className="mt-6 font-display text-5xl md:text-7xl uppercase text-white max-w-4xl mx-auto">
          <E.Text k="cta_title" fallback="Tem um desafio ambiental?"
            className="font-display text-5xl md:text-7xl uppercase text-white" multiline />
        </h2>
        <p className="mt-6 text-lg text-white/85 max-w-2xl mx-auto">
          <E.Text k="cta_desc" fallback="Nossa Recepcionista Ambiental ouve sua situação, identifica o que você precisa e indica o caminho certo — antes mesmo de falar com um especialista." multiline />
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/ia" className="btn-primary"><Sparkles size={16} /> Conversar com a Recepcionista Ambiental</Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- page ---------- */

function Home() {
  Route.useLoaderData(); // loader limpo — seções removidas da Home
  return (
    <div className="bg-background">
      <Hero />
      <NotificacaoAmbiental />
      <PublicoAlvo />
      <Numeros />
      <Metodo />
      <Diferenciais />
      <Cultura />
      <CTAFinal />
    </div>
  );
}
