import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useEditMode } from "@/lib/edit-mode";
import { EDIT_TOOLBAR_HEIGHT } from "@/components/admin/EditModeToolbar";

// Logo servida pelo próprio repositório — independente do Lovable e Supabase
const LOGO_URL = "/logo-ditames.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/sobre", label: "Sobre" },
  { to: "/servicos", label: "Serviços" },
  { to: "/blog", label: "Blog" },
  { to: "/noticias", label: "Notícias" },
  { to: "/cases", label: "Cases" },
  { to: "/cultura", label: "Cultura" },
  { to: "/contato", label: "Contato" },
] as const;

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { editMode } = useEditMode();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !scrolled && !open;

  return (
    <header
      style={{ top: editMode ? EDIT_TOOLBAR_HEIGHT : 0 }}
      className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
        transparent
          ? "bg-black/30 backdrop-blur-sm"
          : "bg-white/95 backdrop-blur border-b border-border shadow-sm"
      }`}
    >
      <div className="container-x flex items-center justify-between py-3">
        <Link to="/" aria-label="Ditames Ambiental — Início" className="flex items-center">
          <img
            src={LOGO_URL}
            alt="Ditames Ambiental"
            className={`h-10 md:h-11 w-auto object-contain transition-all duration-300 ${
              transparent
                ? "brightness-0 invert"
                : "brightness-0"
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

        <div className="hidden xl:flex items-center gap-3">
          <Link
            to="/ia"
            className={`inline-flex flex-col items-center gap-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-all ${
              transparent
                ? "border border-white/30 text-white hover:border-white hover:bg-white/10"
                : "border border-primary/30 text-primary hover:border-primary hover:bg-primary/5"
            }`}
          >
            <span className={`text-[9px] font-normal lowercase tracking-normal leading-none mb-0.5 ${transparent ? "text-white/50" : "text-ink/40"}`}>
              Dúvidas?
            </span>
            <span className="flex items-center gap-1"><Sparkles size={11} /> Recepcionista Ambiental</span>
          </Link>
        </div>

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
            <Link to="/ia" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 py-3 text-sm font-semibold text-primary hover:text-primary/80">
              <Sparkles size={14} />
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-normal text-ink/40 lowercase">Dúvidas?</span>
                Recepcionista Ambiental
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
