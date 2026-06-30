import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Phone, ChevronDown, ChevronUp, CheckCircle2, Archive, MessageCircle } from "lucide-react";
import { getCurrentCmsUser, hasPermission } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { useToast, useErrorModal, friendlyError } from "@/components/admin/Toast";
import type { CmsUserRow, ContactRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/contacts")({
  component: AdminContacts,
});

const STATUS_LABELS: Record<ContactRow["status"], string> = {
  new: "Novo",
  contacted: "Contactado",
  closed: "Encerrado",
};

const STATUS_COLORS: Record<ContactRow["status"], string> = {
  new: "bg-primary/20 text-primary",
  contacted: "bg-yellow-500/20 text-yellow-400",
  closed: "bg-white/10 text-white/30",
};

const PAGE_SIZE = 20;

function AdminContacts() {
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContactRow["status"] | "all">("all");
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
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(currentLimit);

      if (statusFilter !== "all") query = query.eq("status", statusFilter);

      const { data, error } = await query;
      if (error) throw error;
      setContacts((data ?? []) as ContactRow[]);
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

  const handleStatusChange = async (contact: ContactRow, newStatus: ContactRow["status"]) => {
    if (!hasPermission(user, "view_audit_log")) {
      showError("Sem permissão", "Você não possui permissão para gerenciar contatos.");
      return;
    }
    try {
      const { error } = await supabase
        .from("contacts")
        .update({ status: newStatus })
        .eq("id", contact.id);
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
        Você não tem permissão para visualizar contatos.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <ToastContainer />
      <ErrorModalContainer />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Contatos</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Solicitações recebidas pelo formulário do site
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "new", "contacted", "closed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              statusFilter === s
                ? "border-primary bg-primary text-white"
                : "border-white/10 text-white/40 hover:text-white"
            }`}
          >
            {s === "all" ? "Todos" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Carregando…</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm flex flex-col items-center gap-3">
          <Mail size={28} className="text-white/10" />
          Nenhum contato recebido ainda.
          <p className="text-xs text-white/20 max-w-xs text-center">
            As mensagens aparecem aqui quando alguém preenche o formulário de contato do site.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden divide-y divide-white/5">
            {contacts.map((contact) => {
              const expanded = expandedId === contact.id;
              const date = new Date(contact.created_at).toLocaleString("pt-BR", {
                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
              });

              return (
                <div key={contact.id}>
                  {/* Linha resumida */}
                  <div className="flex items-start gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/40 mt-0.5">
                      <Mail size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{contact.name}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[contact.status]}`}>
                          {STATUS_LABELS[contact.status]}
                        </span>
                        {contact.service && (
                          <span className="text-xs text-primary font-medium truncate">
                            {contact.service}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-white/50 mt-1 line-clamp-1">{contact.message}</p>

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-white/25 flex items-center gap-1">
                          <Mail size={10} /> {contact.email}
                        </span>
                        {contact.phone && (
                          <span className="text-[10px] text-white/25 flex items-center gap-1">
                            <Phone size={10} /> {contact.phone}
                          </span>
                        )}
                        <span className="text-[10px] text-white/20">{date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Ação rápida — responder por WhatsApp se tiver telefone */}
                      {contact.phone && contact.status !== "closed" && (
                        <a
                          href={`https://wa.me/55${contact.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${contact.name}, aqui é a Ditames Ambiental. Vi sua mensagem no site e gostaria de conversar sobre sua necessidade.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:text-green-400 hover:bg-green-400/10 transition-colors"
                          title="Responder pelo WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </a>
                      )}

                      {/* Ações de status */}
                      {contact.status === "new" && (
                        <button
                          onClick={() => handleStatusChange(contact, "contacted")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                          title="Marcar como contactado"
                        >
                          <Phone size={14} />
                        </button>
                      )}
                      {contact.status === "contacted" && (
                        <button
                          onClick={() => handleStatusChange(contact, "closed")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:text-green-400 hover:bg-green-400/10 transition-colors"
                          title="Marcar como encerrado"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      {contact.status === "closed" && (
                        <button
                          onClick={() => handleStatusChange(contact, "new")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                          title="Reabrir"
                        >
                          <Archive size={14} />
                        </button>
                      )}

                      {/* Expandir mensagem completa */}
                      <button
                        onClick={() => setExpandedId(expanded ? null : contact.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Mensagem expandida */}
                  {expanded && (
                    <div className="border-t border-white/5 bg-black/20 px-5 py-4 space-y-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">
                        Mensagem completa
                      </div>

                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                        {contact.message}
                      </p>

                      <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-white/40 border-t border-white/5">
                        <div>
                          <span className="text-white/20 block mb-0.5">E-mail</span>
                          <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                            {contact.email}
                          </a>
                        </div>
                        {contact.phone && (
                          <div>
                            <span className="text-white/20 block mb-0.5">Telefone</span>
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.service && (
                          <div>
                            <span className="text-white/20 block mb-0.5">Serviço de interesse</span>
                            <span className="text-primary">{contact.service}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-white/20 block mb-0.5">Origem</span>
                          <span>{contact.source === "site_form" ? "Formulário do site" : contact.source}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {contacts.length >= limit && (
            <div className="mt-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="text-xs text-primary hover:underline disabled:opacity-50"
              >
                {loadingMore ? "Carregando…" : "Carregar mais"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
