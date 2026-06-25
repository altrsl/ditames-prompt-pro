import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import logoAsset from "@/assets/logo-ditames.asset.json";

const nav = [
  { to: "/", label: "Home" },
  { to: "/sobre", label: "Sobre" },
  { to: "/servicos", label: "Serviços" },
  { to: "/blog", label: "Blog" },
  { to: "/noticias", label: "Notícias" },
  { to: "/cases", label: "Cases" },
  { to: "/ia", label: "Tire suas Dúvidas" },
  { to: "/contato", label: "Contato" },
] as const;

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !scrolled && !open;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        transparent
          ? "bg-black/30 backdrop-blur-sm"
          : "bg-white/95 backdrop-blur border-b border-border shadow-sm"
      }`}
    >
      <div className="container-x flex items-center justify-between py-3">
        <Link to="/" aria-label="Ditames Ambiental — Início" className="flex items-center">
          <img
            src={logoAsset.url}
            alt="Ditames Ambiental"
            width={1280}
            height={720}
            className={`h-10 md:h-11 w-auto object-contain transition-all ${
              transparent ? "" : "invert"
            }`}
          />
        </Link>

        <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`transition-colors ${
                transparent ? "text-white/85 hover:text-white" : "text-ink/70 hover:text-primary"
              }`}
              activeProps={{ className: transparent ? "text-white" : "text-primary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link to="/contato" className="btn-primary hidden xl:inline-flex">
          Atendimento
        </Link>

        <button
          onClick={() => setOpen((v) => !v)}
          className={`xl:hidden grid h-10 w-10 place-items-center rounded-md ${
            transparent ? "text-white" : "text-ink"
          }`}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="xl:hidden border-t border-border bg-white">
          <div className="container-x flex flex-col py-4 gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-semibold text-ink/80 hover:text-primary"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Link to="/contato" onClick={() => setOpen(false)} className="btn-primary mt-3">
              Atendimento
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
