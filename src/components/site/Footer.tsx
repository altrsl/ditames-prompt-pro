import { Link } from "@tanstack/react-router";
import { Leaf, Phone, MessageCircle, MapPin } from "lucide-react";
import { services, WHATSAPP_URL } from "@/lib/services";

export function Footer() {
  return (
    <footer className="text-white/80" style={{ background: "oklch(0.20 0.025 140)" }}>
      <div className="container-x py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 text-white">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
                <Leaf size={20} />
              </span>
              <span className="font-display text-2xl tracking-wider">DITAMES</span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/65 max-w-xs">
              Fortalecemos pessoas, propriedades e empresas com soluções ambientais que unem
              técnica, tecnologia e responsabilidade.
            </p>
          </div>
          <div>
            <h4 className="font-display uppercase text-sm tracking-widest text-white">Institucional</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to="/sobre" className="hover:text-primary transition-colors">Sobre</Link></li>
              <li><Link to="/cultura" className="hover:text-primary transition-colors">Cultura</Link></li>
              <li><Link to="/cases" className="hover:text-primary transition-colors">Cases</Link></li>
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
              <li className="flex items-center gap-2"><Phone size={14} className="text-primary" /> +55 (47) 9999-9999</li>
              <li><a href={WHATSAPP_URL} className="flex items-center gap-2 hover:text-primary transition-colors"><MessageCircle size={14} className="text-primary" /> WhatsApp</a></li>
              <li className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> Santa Catarina, Brasil</li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Ditames Ambiental. Todos os direitos reservados.</p>
          <p>Engenharia · Meio Ambiente · Geotecnologia</p>
        </div>
      </div>
    </footer>
  );
}
