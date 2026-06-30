import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle, ChevronDown, ChevronUp, CheckCircle2, Phone, Archive } from "lucide-react";
import { getCurrentCmsUser, hasPermission } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { useToast, useErrorModal, friendlyError } from "@/components/admin/Toast";
import type { CmsUserRow, LeadRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/leads")({
  component: AdminLeads,
});

const STATUS_LABELS: Record<LeadRow["status"], string> = {
  new: "Novo",
  contacted: "Contactado",
  closed: "Encerrado",
};

const STATUS_COLORS: Record<LeadRow["status"], string> = {
  new: "bg-primary/20 text-primary",
  contacted: "bg-yellow-500/20 text-yellow-400",
  closed: "bg-white/10 text-white/30",
};

const PAGE_SIZE = 20;

function AdminLeads() {
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeadRow["status"] | "all">("all");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const { toast, ToastContainer } = useToast();
  const { showError, ErrorModalContainer } = useErrorModal();

  async function load(currentLimit = limit) {
    try {
      const u = await getCurrentCmsUser();
      setUser(u);

      if (!hasPermission(u, "view_audit_log")) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(currentLimit);

      if (statusFilter !== "all") query = query.eq("status", statusFilter);

      const { data, error } = await query;
      if (error) throw error;
      setLeads((data ?? []) as LeadRow[]);
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, () => load(currentLimit));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    setLimit(PAGE_SIZE);
    load(PAGE_SIZE);
  }, [statusFilter]);

  const handleStatusChange = async (lead: LeadRow, newStatus: LeadRow["status"]) => {
    if (!hasPermission(user, "view_audit_log")) {
      showError("Sem permissão", "Você não possui permissão para gerenciar leads.");
      return;
    }
    try {
      const { error } = await supabase.from("leads").update({ status: newStatus }).eq("id", lead.id);
      if (error) throw error;
      toast.success("Status atualizado.");
      load();
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message);
    }
  };

  const handleLoadMore = () => {
    const newLimit = limit + PAGE_SIZE;
    setLimit(newLimit);
    setLoadingMore(true);
    load(newLimit);
  };

  if (!loading && !hasPermission(user, "view_audit_log")) {
    return (
      <div className="p-8 text-center text-white/30 text-sm">
        Você não tem permissão para visualizar leads.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <ToastContainer />
      <ErrorModalContainer />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Leads</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Conversas com a Recepcionista Ambiental encaminhadas ao WhatsApp
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "new", "contacted", "closed"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              statusFilter === s ? "border-primary bg-primary text-white" : "border-white/10 text-white/40 hover:text-white"
            }`}>
            {s === "all" ? "Todos" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Carregando…</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm flex flex-col items-center gap-3">
          <MessageCircle size={28} className="text-white/10" />
          Nenhum lead registrado ainda.
          <p className="text-xs text-white/20 max-w-xs text-center">
            Os leads aparecem aqui quando um visitante clica em "Prefiro falar com humano"
            na Recepcionista Ambiental.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden divide-y divide-white/5">
            {leads.map((lead) => {
              const expanded = expandedId === lead.id;
              const date = new Date(lead.created_at).toLocaleString("pt-BR", {
                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
              });
              return (
                <div key={lead.id}>
                  <div className="flex items-start gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                      <MessageCircle size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status]}`}>
                          {STATUS_LABELS[lead.status]}
                        </span>
                        {lead.service_suggested && (
                          <span className="text-xs text-primary font-medium truncate">{lead.service_suggested}</span>
                        )}
                      </div>
                      {lead.summary && (
                        <p className="text-xs text-white/50 mt-1.5 line-clamp-2 leading-relaxed">{lead.summary}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-white/25">{date}</span>
                        <span className="text-[10px] text-white/25">{lead.conversation.length} mensagens</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {lead.status === "new" && (
                        <button onClick={() => handleStatusChange(lead, "contacted")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                          title="Marcar como contactado">
                          <Phone size={14} />
                        </button>
                      )}
                      {lead.status === "contacted" && (
                        <button onClick={() => handleStatusChange(lead, "closed")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:text-green-400 hover:bg-green-400/10 transition-colors"
                          title="Marcar como encerrado">
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      {lead.status === "closed" && (
                        <button onClick={() => handleStatusChange(lead, "new")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                          title="Reabrir">
                          <Archive size={14} />
                        </button>
                      )}
                      <button onClick={() => setExpandedId(expanded ? null : lead.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors">
                        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>

                  {expanded && lead.conversation.length > 0 && (
                    <div className="border-t border-white/5 bg-black/20 px-5 py-4 space-y-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">
                        Histórico da conversa
                      </div>
                      {lead.conversation.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row" : "flex-row-reverse"}`}>
                          <div className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold uppercase ${
                            msg.role === "user" ? "bg-white/10 text-white/50" : "bg-primary/20 text-primary"
                          }`}>
                            {msg.role === "user" ? "V" : "IA"}
                          </div>
                          <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                            msg.role === "user" ? "bg-white/5 text-white/70" : "bg-primary/10 text-white/80"
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {leads.length >= limit && (
            <div className="mt-4 text-center">
              <button onClick={handleLoadMore} disabled={loadingMore}
                className="text-xs text-primary hover:underline disabled:opacity-50">
                {loadingMore ? "Carregando…" : "Carregar mais"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
