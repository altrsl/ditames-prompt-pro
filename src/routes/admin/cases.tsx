import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { getCurrentCmsUser, hasPermission } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import type { CmsUserRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/cases")({
  component: AdminCases,
});

type CaseRow = { id: string; name: string; sector: string; description: string | null; published: boolean; order_index: number };

function AdminCases() {
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const u = await getCurrentCmsUser();
    setUser(u);
    const { data } = await supabase.from("cases").select("id, name, sector, description, published, order_index").order("order_index");
    setCases((data ?? []) as CaseRow[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const toggle = async (c: CaseRow) => {
    await supabase.from("cases").update({ published: !c.published }).eq("id", c.id);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Remover este case?")) return;
    await supabase.from("cases").delete().eq("id", id);
    load();
  };

  const canEdit = hasPermission(user, "edit_cases");

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Cases</h1>
          <p className="text-sm text-white/40 mt-0.5">Clientes e projetos em destaque</p>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Carregando…</div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden divide-y divide-white/5">
          {cases.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5">
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
                <button onClick={() => toggle(c)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                  {c.published ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} />}
                </button>
                {canEdit && (
                  <button onClick={() => del(c.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10">
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
