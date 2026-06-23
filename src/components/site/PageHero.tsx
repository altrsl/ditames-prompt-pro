import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden topo-bg"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="container-x">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-5 font-display text-[clamp(2.25rem,5vw,4.5rem)] uppercase text-ink max-w-4xl leading-[1.02]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">{subtitle}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
