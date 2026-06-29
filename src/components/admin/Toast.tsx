/**
 * Ditames CMS — Toast + Alert System
 *
 * Feedback visual centralizado para todas as ações do admin.
 * Erros exibem animação da árvore caindo para humanizar a comunicação.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warn" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const CONFIG: Record<ToastType, { icon: React.ElementType; border: string; bg: string; title: string; iconColor: string }> = {
  success: { icon: CheckCircle2, border: "border-green-500/30",  bg: "bg-green-500/10",  title: "text-green-400",  iconColor: "text-green-400" },
  error:   { icon: XCircle,      border: "border-red-500/30",    bg: "bg-red-500/10",    title: "text-red-400",    iconColor: "text-red-400" },
  warn:    { icon: AlertTriangle, border: "border-yellow-500/30", bg: "bg-yellow-500/10", title: "text-yellow-400", iconColor: "text-yellow-400" },
  info:    { icon: Info,          border: "border-blue-500/30",   bg: "bg-blue-500/10",   title: "text-blue-400",   iconColor: "text-blue-400" },
};

// ─── TOAST ────────────────────────────────────────────────────

function Toast({ item, onClose }: { item: ToastItem; onClose: (id: string) => void }) {
  const cfg = CONFIG[item.type];
  const Icon = cfg.icon;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const duration = item.duration ?? (item.type === "error" ? 8000 : 4000);
  const isError = item.type === "error";

  useEffect(() => {
    if (duration === 0) return;
    timerRef.current = setTimeout(() => onClose(item.id), duration);
    return () => clearTimeout(timerRef.current);
  }, [item.id, duration, onClose]);

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border ${cfg.border} ${cfg.bg} shadow-xl backdrop-blur-sm w-full max-w-sm overflow-hidden`}
      role="alert"
    >
      {/* GIF da árvore nos erros */}
      {isError && (
        <div className="shrink-0 pl-3 pt-2 pb-1">
          <img
            src="/error-tree.gif"
            alt=""
            aria-hidden="true"
            style={{ width: 48, height: 48, objectFit: "contain" }}
          />
        </div>
      )}

      {/* Ícone nos não-erros */}
      {!isError && (
        <div className="shrink-0 pl-4 pt-3">
          <Icon size={17} className={cfg.iconColor} />
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 py-3 pr-2">
        <p className={`text-sm font-semibold ${cfg.title} leading-tight`}>{item.title}</p>
        {item.message && (
          <p className="text-xs text-white/50 mt-1 leading-relaxed">{item.message}</p>
        )}
      </div>

      {/* Fechar */}
      <button
        onClick={() => onClose(item.id)}
        className="shrink-0 pr-3 pt-3 text-white/20 hover:text-white/60 transition-colors"
        aria-label="Fechar"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ─── CONTAINER ────────────────────────────────────────────────

export function ToastContainer({ items, onClose }: { items: ToastItem[]; onClose: (id: string) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2 items-end pointer-events-none">
      {items.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <Toast item={item} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────

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
  const cfg = CONFIG[type];
  const Icon = cfg.icon;
  const isError = type === "error";

  return (
    <div className={`flex items-start gap-3 rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`} role="alert">
      {isError ? (
        <div className="shrink-0 pl-3 pt-2 pb-1">
          <img src="/error-tree.gif" alt="" aria-hidden="true" style={{ width: 40, height: 40, objectFit: "contain" }} />
        </div>
      ) : (
        <div className="shrink-0 pl-4 pt-3">
          <Icon size={16} className={cfg.iconColor} />
        </div>
      )}
      <div className="flex-1 py-3 pr-2">
        <p className={`text-sm font-semibold ${cfg.title}`}>{title}</p>
        {message && <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 pr-3 pt-3 text-white/20 hover:text-white/60 transition-colors">
          <X size={13} />
        </button>
      )}
    </div>
  );
}

