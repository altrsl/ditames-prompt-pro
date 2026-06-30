import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, MapPin, Mail, Instagram, Linkedin, Clock, Sparkles, LayoutDashboard } from "lucide-react";
import { services } from "@/lib/services";
import { useEditMode } from "@/lib/edit-mode";
import { useSettings, getWhatsAppUrl } from "@/lib/use-settings";

// Logo servida pelo repositório — independente do Lovable e Supabase
const LOGO_URL = "/logo-ditames.png";

export function Footer() {
  const { isAuthenticated } = useEditMode();
  const settings = useSettings();
  const whatsappUrl = getWhatsAppUrl(settings);
  return (
    <footer className="text-white/80" style={{ background: "oklch(0.20 0.025 140)" }}>
      <div className="container-x py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" aria-label="Ditames Ambiental — Início" className="inline-block">
              <img
                src={LOGO_URL}
                alt="Ditames Ambiental"
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-white/65">

              Fortalecer clientes por meio de soluções ambientais integradas, unindo tecnologia,
              conhecimento técnico e desenvolvimento humano contínuo, para que cada desafio se
              torne um passo de evolução organizacional e pessoal, promovendo sustentabilidade,
              responsabilidade e propósito em todas as entregas.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-white/80 transition-colors hover:border-primary hover:text-primary"
              >
                <Instagram size={16} />
              </a>
              <a
                href={settings.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-white/80 transition-colors hover:border-primary hover:text-primary"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display uppercase text-sm tracking-widest text-white">Institucional</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to="/sobre" className="hover:text-primary transition-colors">Sobre</Link></li>
              <li><Link to="/cultura" className="hover:text-primary transition-colors">Cultura</Link></li>
              <li><Link to="/cases" className="hover:text-primary transition-colors">Cases</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/noticias" className="hover:text-primary transition-colors">Notícias</Link></li>
              <li><Link to="/ia" className="hover:text-primary transition-colors">Inteligência Ambiental</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display uppercase text-sm tracking-widest text-white">Serviços</h4>
            <ul className="mt-5 space-y-3 text-sm">
              {services.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link to="/servicos/$slug" params={{ slug: s.slug }} className="hover:text-primary transition-colors">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display uppercase text-sm tracking-widest text-white">Contato</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary shrink-0" /> {settings.phone}
              </li>
              <li>
                <a href={whatsappUrl} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <MessageCircle size={14} className="text-primary shrink-0" /> {settings.whatsapp_display ?? "(47) 9 9691-0055"}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-primary transition-colors break-all">
                  <Mail size={14} className="text-primary shrink-0" /> {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-primary shrink-0 mt-1" />
                <span>
                  Rua Brasil, 22 — Sumaré<br />
                  Rio do Sul, SC — CEP 89165-613
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} className="text-primary shrink-0" /> Seg a sex, horário comercial
              </li>
            </ul>
          </div>
        </div>
        {/* Recepcionista Ambiental CTA */}
        <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white text-sm font-semibold">
              <Sparkles size={16} className="text-primary" />
              Recebeu uma exigência ambiental? Não sabe por onde começar?
            </div>
            <p className="mt-1 text-xs text-white/60">
              Fale com a Recepcionista Ambiental e entenda sua situação.
            </p>
          </div>
          <Link
            to="/ia"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <Sparkles size={12} /> Falar com a Recepcionista
          </Link>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Ditames Ambiental. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 text-white/30 hover:text-white/60 transition-colors text-[11px]"
              >
                <LayoutDashboard size={10} /> Dashboard
              </Link>
            )}
            <Link to="/admin/login" className="text-white/15 hover:text-white/30 transition-colors text-[11px]">
              Login
            </Link>
          </div>
          <p>Engenharia · Meio Ambiente · Geotecnologia · Desde 2022</p>
        </div>
      </div>
    </footer>
  );
}
