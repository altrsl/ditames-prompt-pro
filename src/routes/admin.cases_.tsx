import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { getCurrentCmsUser, hasPermission, writeAuditLog } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { useToast, useErrorModal, friendlyError } from "@/components/admin/Toast";
import type { CmsUserRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/cases_")({
  component: AdminCases,
});

type CaseRow = { id: string; name: string; sector: string; description: string | null; published: boolean; order_index: number; logo_url: string | null };

function AdminCases() {
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, ToastContainer } = useToast();
  const { showError, ErrorModalContainer } = useErrorModal();

  async function load() {
    try {
      const u = await getCurrentCmsUser();
      setUser(u);
      const { data, error } = await supabase
        .from("cases")
        .select("id, name, sector, description, published, order_index, logo_url")
        .order("order_index", { ascending: true });
      if (error) throw error;
      setCases((data ?? []) as CaseRow[]);
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, load);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const canEdit = hasPermission(user, "edit_cases");

  const handleToggle = async (c: CaseRow) => {
    if (!canEdit) {
      showError("Sem permissão", "Você não possui permissão para editar cases.");
      return;
    }
    try {
      const { error } = await supabase.from("cases").update({ published: !c.published }).eq("id", c.id);
      if (error) throw error;
      await writeAuditLog({ user, action: "update", module: "cases", record_id: c.id, field: "published", previous_value: c.published, new_value: !c.published });
      toast.success(!c.published ? "Case ativado!" : "Case desativado.", !c.published ? "Visível no site." : "Oculto do site.");
      load();
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canEdit) {
      showError("Sem permissão", "Você não possui permissão para remover cases.");
      return;
    }
    if (!confirm(`Remover o case "${name}" permanentemente? Esta ação não pode ser desfeita.`)) return;
    try {
      const { error } = await supabase.from("cases").delete().eq("id", id);
      if (error) throw error;
      await writeAuditLog({ user, action: "delete", module: "cases", record_id: id, previous_value: { name } });
      toast.success("Case removido.");
      load();
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <ToastContainer />
      <ErrorModalContainer />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Cases</h1>
          <p className="text-sm text-white/40 mt-0.5">Clientes e projetos em destaque no site</p>
        </div>
        {canEdit && (
          <Link
            to="/admin/cases/$id"
            params={{ id: "new" }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Novo case
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Carregando…</div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">
          Nenhum case cadastrado ainda.
          {canEdit && (
            <Link to="/admin/cases/$id" params={{ id: "new" }} className="block mt-3 text-primary hover:underline">
              Criar primeiro case
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden divide-y divide-white/5">
          {cases.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 overflow-hidden">
                {c.logo_url ? (
                  <img src={c.logo_url} alt={c.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs font-bold text-white/30">{c.name.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">{c.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${c.published ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}`}>
                    {c.published ? "Ativo" : "Inativo"}
                  </span>
                  <span className="text-xs text-white/30">{c.sector}</span>
                  {c.description && <span className="text-xs text-white/20 truncate max-w-xs">{c.description}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {canEdit && (
                  <Link
                    to="/admin/cases/$id"
                    params={{ id: c.id }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Pencil size={14} />
                  </Link>
                )}
                <button onClick={() => handleToggle(c)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                  {c.published ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} />}
                </button>
                {canEdit && (
                  <button onClick={() => handleDelete(c.id, c.name)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
