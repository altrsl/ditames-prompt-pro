/**
 * CookieBanner — aviso de cookies conforme LGPD e Marco Civil
 * Aparece apenas uma vez; decisão salva em localStorage.
 */

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";

const STORAGE_KEY = "ditames-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Só exibe se o usuário ainda não respondeu
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage bloqueado (modo privado extremo) — não exibe
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch {}
    setVisible(false);
  };

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "dismissed"); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-[9998] px-4 pb-4 md:bottom-4 md:left-4 md:right-auto md:max-w-sm"
    >
      <div className="rounded-xl border border-white/10 bg-[#1a2118] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-white/80 leading-relaxed">
            Usamos cookies essenciais para o funcionamento do site. Ao continuar,
            você concorda com nossa{" "}
            <Link to="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
          <button
            onClick={dismiss}
            className="shrink-0 text-white/30 hover:text-white transition-colors mt-0.5"
            aria-label="Fechar aviso"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={accept}
            className="flex-1 rounded-lg bg-primary py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Entendi
          </button>
          <Link
            to="/privacidade"
            className="flex-1 rounded-lg border border-white/15 py-2 text-xs font-semibold text-white/60 hover:text-white hover:border-white/30 transition-colors text-center"
          >
            Saiba mais
          </Link>
        </div>
      </div>
    </div>
  );
}
