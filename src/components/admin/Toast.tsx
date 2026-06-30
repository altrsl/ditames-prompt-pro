/**
 * Ditames CMS — Sistema centralizado de feedback visual
 *
 * Dois níveis de feedback:
 *   1. Toast  — ações rápidas (sucesso, info, aviso, erro leve) — canto inferior direito
 *   2. ErrorModal — erros críticos com animação da árvore — modal central
 *
 * Uso:
 *   const { toast, ToastContainer } = useToast();
 *   const { showError, ErrorModalContainer } = useErrorModal();
 *
 *   toast.success("Salvo!");
 *   toast.warn("Campo obrigatório.");
 *   showError("Não foi possível salvar.", "Verifique sua conexão.");
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X, RefreshCw } from "lucide-react";

// ─── TIPOS ────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warn" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const CFG: Record<ToastType, { icon: React.ElementType; border: string; bg: string; title: string; iconColor: string }> = {
  success: { icon: CheckCircle2, border: "border-green-500/30",  bg: "bg-green-500/10",  title: "text-green-400",  iconColor: "text-green-400" },
  error:   { icon: XCircle,      border: "border-red-500/30",    bg: "bg-red-500/10",    title: "text-red-400",    iconColor: "text-red-400" },
  warn:    { icon: AlertTriangle, border: "border-yellow-500/30", bg: "bg-yellow-500/10", title: "text-yellow-400", iconColor: "text-yellow-400" },
  info:    { icon: Info,          border: "border-blue-500/30",   bg: "bg-blue-500/10",   title: "text-blue-400",   iconColor: "text-blue-400" },
};

// ─── TOAST INDIVIDUAL ─────────────────────────────────────────

function ToastItem_({ item, onClose }: { item: ToastItem; onClose: (id: string) => void }) {
  const cfg = CFG[item.type];
  const Icon = cfg.icon;
  const duration = item.duration ?? (item.type === "error" ? 7000 : 4000);

  useEffect(() => {
    if (duration === 0) return;
    const t = setTimeout(() => onClose(item.id), duration);
    return () => clearTimeout(t);
  }, [item.id, duration, onClose]);

  return (
    <div className={`flex items-start gap-3 rounded-xl border ${cfg.border} ${cfg.bg} shadow-xl w-full max-w-sm`} role="alert">
      <div className="shrink-0 pl-4 pt-3">
        <Icon size={16} className={cfg.iconColor} />
      </div>
      <div className="flex-1 min-w-0 py-3 pr-2">
        <p className={`text-sm font-semibold ${cfg.title} leading-tight`}>{item.title}</p>
        {item.message && <p className="text-xs text-white/50 mt-1 leading-relaxed">{item.message}</p>}
      </div>
      <button onClick={() => onClose(item.id)} className="shrink-0 pr-3 pt-3 text-white/20 hover:text-white/60" aria-label="Fechar">
        <X size={13} />
      </button>
    </div>
  );
}

// ─── TOAST CONTAINER ──────────────────────────────────────────

export function ToastContainer({ items, onClose }: { items: ToastItem[]; onClose: (id: string) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2 items-end pointer-events-none">
      {items.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <ToastItem_ item={item} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

// ─── HOOK TOAST ───────────────────────────────────────────────

export function useToast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const close = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => [...prev.slice(-4), { id, type, title, message, duration }]);
    return id;
  }, []);

  const toast = {
    success: (title: string, message?: string) => add("success", title, message),
    error:   (title: string, message?: string) => add("error",   title, message),
    warn:    (title: string, message?: string) => add("warn",    title, message),
    info:    (title: string, message?: string, duration?: number) => add("info", title, message, duration),
  };

  const Container = useCallback(
    () => <ToastContainer items={items} onClose={close} />,
    [items, close]
  );

  return { toast, ToastContainer: Container };
}

// ─── ERROR MODAL (erros críticos com GIF da árvore) ───────────

interface ErrorModalProps {
  title: string;
  message?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function ErrorModal({ title, message, onClose, onRetry }: ErrorModalProps) {
  // Fecha com ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[99998] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#1a2118] shadow-2xl overflow-hidden">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors z-10"
          aria-label="Fechar"
        >
          <X size={14} />
        </button>

        {/* GIF da árvore */}
        <div className="flex justify-center pt-8 pb-4 bg-red-500/5">
          <img
            src="/error-tree.gif"
            alt="Erro"
            style={{ width: 96, height: 96, objectFit: "contain" }}
          />
        </div>

        {/* Conteúdo */}
        <div className="px-6 pb-6 text-center">
          <h3 className="text-base font-bold text-red-400 mt-2">{title}</h3>
          {message && (
            <p className="text-sm text-white/60 mt-2 leading-relaxed">{message}</p>
          )}

          <div className="flex gap-3 mt-6 justify-center">
            {onRetry && (
              <button
                onClick={() => { onRetry(); onClose(); }}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <RefreshCw size={14} /> Tentar novamente
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/60 hover:text-white hover:border-white/30 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HOOK ERROR MODAL ─────────────────────────────────────────

export function useErrorModal() {
  const [modal, setModal] = useState<{ title: string; message?: string; onRetry?: () => void } | null>(null);

  const showError = useCallback((title: string, message?: string, onRetry?: () => void) => {
    setModal({ title, message, onRetry });
  }, []);

  const closeError = useCallback(() => setModal(null), []);

  const ErrorModalContainer = useCallback(() =>
    modal ? <ErrorModal title={modal.title} message={modal.message} onRetry={modal.onRetry} onClose={closeError} /> : null,
    [modal, closeError]
  );

  return { showError, closeError, ErrorModalContainer };
}

// ─── INLINE ALERT ─────────────────────────────────────────────

export function Alert({
  type,
  title,
  message,
  onClose,
}: {
  type: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
}) {
  const cfg = CFG[type];
  const Icon = cfg.icon;
  return (
    <div className={`flex items-start gap-3 rounded-xl border ${cfg.border} ${cfg.bg}`} role="alert">
      <div className="shrink-0 pl-4 pt-3"><Icon size={16} className={cfg.iconColor} /></div>
      <div className="flex-1 py-3 pr-2">
        <p className={`text-sm font-semibold ${cfg.title}`}>{title}</p>
        {message && <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 pr-3 pt-3 text-white/20 hover:text-white/60">
          <X size={13} />
        </button>
      )}
    </div>
  );
}

// ─── MENSAGENS PADRONIZADAS ───────────────────────────────────
// Traduções amigáveis de erros técnicos do Supabase/sistema

export function friendlyError(e: unknown): { title: string; message: string } {
  const msg = (e as any)?.message ?? String(e) ?? "";

  if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("already exists")) {
    return { title: "Conteúdo duplicado", message: "Já existe um registro com essas informações. Altere o título ou slug e tente novamente." };
  }
  if (msg.includes("permission") || msg.includes("RLS") || msg.includes("Unauthorized") || msg.includes("403")) {
    return { title: "Sem permissão", message: "Você não possui permissão para executar esta ação. Entre em contato com o administrador." };
  }
  if (msg.includes("JWT") || msg.includes("session") || msg.includes("token") || msg.includes("401")) {
    return { title: "Sessão expirada", message: "Sua sessão expirou. Faça login novamente para continuar." };
  }
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
    return { title: "Erro de conexão", message: "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente." };
  }
  if (msg.includes("timeout") || msg.includes("TIMEOUT")) {
    return { title: "Tempo esgotado", message: "A operação demorou muito. Verifique sua conexão e tente novamente." };
  }
  if (msg.includes("storage") || msg.includes("bucket") || msg.includes("upload")) {
    return { title: "Falha no upload", message: "Não foi possível enviar o arquivo. Verifique o tamanho (máx. 10 MB) e o formato." };
  }
  if (msg.includes("not found") || msg.includes("404") || msg.includes("PGRST116")) {
    return { title: "Registro não encontrado", message: "O conteúdo que você tentou acessar não existe ou foi removido." };
  }
  if (msg.includes("Invalid login") || msg.includes("invalid_credentials")) {
    return { title: "Credenciais inválidas", message: "E-mail ou senha incorretos. Verifique seus dados e tente novamente." };
  }
  if (msg.includes("Email not confirmed")) {
    return { title: "E-mail não confirmado", message: "Verifique sua caixa de entrada e confirme o e-mail antes de entrar." };
  }
  if (msg.includes("Too many requests") || msg.includes("rate limit") || msg.includes("429")) {
    return { title: "Muitas tentativas", message: "Aguarde alguns minutos antes de tentar novamente." };
  }

  return {
    title: "Ocorreu um erro",
    message: "Não foi possível concluir a operação. Tente novamente ou contate o suporte se o problema persistir.",
  };
}
