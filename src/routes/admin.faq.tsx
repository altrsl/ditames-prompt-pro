import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical, X, Save } from "lucide-react";
import { getCurrentCmsUser, hasPermission, writeAuditLog } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { useToast, useErrorModal, friendlyError, Alert } from "@/components/admin/Toast";
import type { CmsUserRow, FaqRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/faq")({
  component: AdminFaq,
});

function AdminFaq() {
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [items, setItems] = useState<FaqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { toast, ToastContainer } = useToast();
  const { showError, ErrorModalContainer } = useErrorModal();

  const canEdit = hasPermission(user, "edit_homepage");

  async function load() {
    try {
      const u = await getCurrentCmsUser();
      setUser(u);
      const { data, error } = await supabase
        .from("faq")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      setItems((data ?? []) as FaqRow[]);
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, load);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const startNew = () => {
    setEditingId("new");
    setQuestion("");
    setAnswer("");
    setInlineError(null);
  };

  const startEdit = (item: FaqRow) => {
    setEditingId(item.id);
    setQuestion(item.question);
    setAnswer(item.answer);
    setInlineError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setInlineError(null);
  };

  const handleSave = async () => {
    if (!canEdit) {
      showError("Sem permissão", "Você não possui permissão para editar o conteúdo do site.");
      return;
    }
    if (!question.trim()) { setInlineError("A pergunta é obrigatória."); return; }
    if (!answer.trim()) { setInlineError("A resposta é obrigatória."); return; }

    setSaving(true);
    try {
      if (editingId === "new") {
        const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.order_index)) + 1 : 1;
        const { error } = await supabase.from("faq").insert({
          question: question.trim(),
          answer: answer.trim(),
          order_index: nextOrder,
          published: true,
        });
        if (error) throw error;
        await writeAuditLog({ user, action: "create", module: "faq", new_value: { question } });
        toast.success("Pergunta adicionada!");
      } else if (editingId) {
        const { error } = await supabase.from("faq").update({
          question: question.trim(),
          answer: answer.trim(),
        }).eq("id", editingId);
        if (error) throw error;
        await writeAuditLog({ user, action: "update", module: "faq", record_id: editingId, new_value: { question } });
        toast.success("Pergunta atualizada!");
      }
      cancelEdit();
      load();
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, handleSave);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item: FaqRow) => {
    if (!canEdit) {
      showError("Sem permissão", "Você não possui permissão para editar o conteúdo do site.");
      return;
    }
    try {
      const { error } = await supabase.from("faq").update({ published: !item.published }).eq("id", item.id);
      if (error) throw error;
      toast.success(!item.published ? "Pergunta visível no site." : "Pergunta ocultada do site.");
      load();
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      showError("Sem permissão", "Você não possui permissão para remover conteúdo do site.");
      return;
    }
    if (!confirm("Remover esta pergunta permanentemente?")) return;
    try {
      const { error } = await supabase.from("faq").delete().eq("id", id);
      if (error) throw error;
      toast.success("Pergunta removida.");
      load();
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <ToastContainer />
      <ErrorModalContainer />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Perguntas frequentes</h1>
          <p className="text-sm text-white/40 mt-0.5">FAQ exibido na homepage do site</p>
        </div>
        {canEdit && editingId === null && (
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Nova pergunta
          </button>
        )}
      </div>

      {editingId !== null && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/60">
            {editingId === "new" ? "Nova pergunta" : "Editar pergunta"}
          </h2>
          <div>
            <label className="block text-xs text-white/40 mb-1">Pergunta</label>
            <input
              type="text"
              value={question}
              onChange={(e) => { setQuestion(e.target.value); setInlineError(null); }}
              placeholder="Ex: Como funciona o licenciamento ambiental?"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Resposta</label>
            <textarea
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setInlineError(null); }}
              rows={4}
              placeholder="Resposta completa e clara…"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 resize-y"
            />
          </div>

          {inlineError && <Alert type="error" title={inlineError} onClose={() => setInlineError(null)} />}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "Salvando…" : "Salvar"}
            </button>
            <button
              onClick={cancelEdit}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white hover:border-white/30"
            >
              <X size={14} /> Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Carregando…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">
          Nenhuma pergunta cadastrada ainda.
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden divide-y divide-white/5">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 px-5 py-4">
              <GripVertical size={14} className="text-white/20 mt-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    item.published ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"
                  }`}>
                    {item.published ? "Visível" : "Oculta"}
                  </span>
                </div>
                <div className="text-sm font-semibold text-white mt-1">{item.question}</div>
                <div className="text-xs text-white/40 mt-1 line-clamp-2">{item.answer}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {canEdit && (
                  <button onClick={() => startEdit(item)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                    <Pencil size={14} />
                  </button>
                )}
                <button onClick={() => handleToggle(item)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                  {item.published ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} />}
                </button>
                {canEdit && (
                  <button onClick={() => handleDelete(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10">
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
