import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAuditLogs, ACTION_LABELS, MODULE_LABELS, hasPermission, getCurrentCmsUser } from "@/lib/admin";
import type { AuditLogRow, CmsUserRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/audit")({
  component: AdminAudit,
});

function AdminAudit() {
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [moduleFilter, setModuleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const u = await getCurrentCmsUser();
      setUser(u);
      if (!hasPermission(u, "view_audit_log")) { setLoading(false); return; }
      const data = await getAuditLogs(moduleFilter || undefined, undefined, 100);
      setLogs(data);
      setLoading(false);
    }
    load();
  }, [moduleFilter]);

  if (!hasPermission(user, "view_audit_log")) {
    return (
      <div className="p-8 text-center text-white/30 text-sm">
        Você não tem permissão para visualizar o audit log.
      </div>
    );
  }

  const modules = Object.keys(MODULE_LABELS);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Audit Log</h1>
        <p className="text-sm text-white/40 mt-0.5">Histórico completo de ações no CMS</p>
      </div>

      {/* Filtro */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setModuleFilter("")}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
            !moduleFilter ? "border-primary bg-primary text-white" : "border-white/10 text-white/40 hover:text-white"
          }`}
        >
          Todos
        </button>
        {modules.map((m) => (
          <button
            key={m}
            onClick={() => setModuleFilter(m)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              moduleFilter === m ? "border-primary bg-primary text-white" : "border-white/10 text-white/40 hover:text-white"
            }`}
          >
            {MODULE_LABELS[m]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Carregando…</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">Nenhuma atividade registrada.</div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold uppercase mt-0.5">
                    {(log.user_name ?? "?").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-sm font-semibold text-white">{log.user_name ?? "Sistema"}</span>
                      <span className="text-xs text-white/50">
                        {ACTION_LABELS[log.action] ?? log.action} em
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        {MODULE_LABELS[log.module] ?? log.module}
                      </span>
                      {log.field && (
                        <span className="text-xs text-white/30">· campo: <span className="font-mono text-white/50">{log.field}</span></span>
                      )}
                    </div>

                    {(log.previous_value || log.new_value) && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {log.previous_value && (
                          <div className="rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2">
                            <div className="text-[10px] font-bold uppercase text-red-400/60 mb-1">Antes</div>
                            <div className="text-xs text-white/40 font-mono truncate">{log.previous_value}</div>
                          </div>
                        )}
                        {log.new_value && (
                          <div className="rounded-lg bg-green-500/5 border border-green-500/10 px-3 py-2">
                            <div className="text-[10px] font-bold uppercase text-green-400/60 mb-1">Depois</div>
                            <div className="text-xs text-white/40 font-mono truncate">{log.new_value}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-xs text-white/30 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("pt-BR", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
