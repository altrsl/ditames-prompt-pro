import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, MessageCircle, Phone, ShieldCheck, Workflow, Users } from "lucide-react";
import type { Service } from "@/lib/services";
import { WHATSAPP_URL } from "@/lib/services";

export function ServiceTemplate({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden topo-bg"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="container-x grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
          <div>
            <Link to="/servicos" className="eyebrow hover:text-primary-dark">
              <ArrowRight size={12} className="rotate-180" /> Serviços
            </Link>
            <h1 className="mt-5 font-display text-[clamp(2.25rem,5vw,4.5rem)] uppercase text-ink leading-[1.02]">
              {service.title}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">{service.short}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/contato" className="btn-primary">
                Falar com Especialista <ArrowRight size={16} />
              </Link>
              <a href={WHATSAPP_URL} className="btn-outline">
                <MessageCircle size={16} /> Solicitar Atendimento
              </a>
            </div>
          </div>
          <div className="hidden lg:flex justify-end">
            <div className="grid h-44 w-44 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-glow">
              <Icon size={86} strokeWidth={1.4} />
            </div>
          </div>
        </div>
      </section>

      {/* O que é */}
      <section className="bg-background py-20 md:py-24">
        <div className="container-x grid lg:grid-cols-[1fr_1.4fr] gap-10">
          <div>
            <span className="eyebrow">O que é</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl uppercase text-ink">
              Entenda o <span className="text-primary">serviço</span>
            </h2>
          </div>
          <p className="text-lg text-foreground/85 leading-relaxed">{service.whatIs}</p>
        </div>
      </section>

      {/* Quando é necessário */}
      <section className="bg-surface py-20 md:py-24">
        <div className="container-x">
          <div className="max-w-2xl">
            <span className="eyebrow">Quando é necessário</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl uppercase text-ink">
              Situações em que este <span className="text-primary">serviço se aplica</span>
            </h2>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {service.whenNeeded.map((w) => (
              <li
                key={w}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:-translate-y-0.5"
              >
                <CheckCircle2 size={22} className="text-primary shrink-0 mt-0.5" />
                <span className="text-base text-ink">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Como a Ditames atua */}
      <section className="bg-background py-20 md:py-24">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="eyebrow">Como a Ditames atua</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl uppercase text-ink">
              Conduzimos o processo <span className="text-primary">do início ao fim</span>
            </h2>
            <p className="mt-6 text-foreground/80 leading-relaxed">
              A Ditames assume a responsabilidade técnica completa, faz acompanhamento integral
              e cuida da interface com os órgãos ambientais. O cliente acompanha o progresso e
              foca no que importa: seu negócio.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { i: ShieldCheck, t: "Responsabilidade Técnica" },
              { i: Workflow, t: "Processo Conduzido" },
              { i: Users, t: "Interface com Órgãos" },
              { i: CheckCircle2, t: "Entrega Concluída" },
            ].map((b) => (
              <div key={b.t} className="rounded-xl bg-secondary/60 p-6">
                <b.i size={22} className="text-primary" />
                <div className="mt-3 font-display uppercase text-sm tracking-wide text-ink">{b.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Etapas */}
      <section className="bg-surface py-20 md:py-24">
        <div className="container-x">
          <div className="max-w-2xl">
            <span className="eyebrow">Etapas</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl uppercase text-ink">
              Como o projeto <span className="text-primary">avança</span>
            </h2>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {service.steps.map((step, i) => (
              <li key={step} className="relative rounded-xl border border-border bg-card p-6">
                <div className="font-display text-3xl text-primary/30">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-2 text-base font-semibold text-ink">{step}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Diferencial */}
      <section className="bg-background py-20 md:py-24">
        <div className="container-x">
          <div className="rounded-2xl border border-border bg-secondary/40 p-10 md:p-14 topo-bg">
            <div className="max-w-3xl">
              <span className="eyebrow">Diferencial Ditames</span>
              <h2 className="mt-4 font-display text-3xl md:text-4xl uppercase text-ink">
                Menos burocracia, <span className="text-primary">mais segurança técnica</span>
              </h2>
              <div className="mt-8 grid sm:grid-cols-3 gap-6">
                {[
                  "Redução de burocracia para o cliente",
                  "Acompanhamento completo do processo",
                  "Segurança técnica e legal",
                ].map((d) => (
                  <div key={d} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-ink">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative overflow-hidden py-24"
        style={{ background: "oklch(0.32 0.08 138)" }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 30%, rgba(255,255,255,.4) 0, transparent 50%), repeating-linear-gradient(45deg, transparent 0 60px, rgba(255,255,255,.15) 60px 61px)",
          }}
        />
        <div className="container-x relative text-center">
          <h2 className="font-display text-4xl md:text-5xl uppercase text-white max-w-3xl mx-auto">
            Pronto para começar seu <span className="text-secondary">{service.title}?</span>
          </h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href={WHATSAPP_URL} className="btn-primary">
              <MessageCircle size={16} /> Falar no WhatsApp
            </a>
            <Link to="/contato" className="btn-on-dark">
              <Phone size={16} /> Falar com Especialista
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
