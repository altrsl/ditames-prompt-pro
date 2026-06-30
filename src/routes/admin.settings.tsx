import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Loader2, Phone, Share2, Settings as SettingsIcon } from "lucide-react";
import { getCurrentCmsUser, hasPermission, writeAuditLog } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { useToast, useErrorModal, friendlyError } from "@/components/admin/Toast";
import type { CmsUserRow, SettingsRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const GROUP_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  contato: { label: "Contato", icon: Phone },
  redes_sociais: { label: "Redes sociais", icon: Share2 },
  geral: { label: "Geral", icon: SettingsIcon },
};

function AdminSettings() {
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [settings, setSettings] = useState<SettingsRow[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, ToastContainer } = useToast();
  const { showError, ErrorModalContainer } = useErrorModal();

  const canEdit = hasPermission(user, "edit_homepage");

  async function load() {
    try {
      const u = await getCurrentCmsUser();
      setUser(u);
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order("group_name", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as SettingsRow[];
      setSettings(rows);
      setDraft(Object.fromEntries(rows.map((r) => [r.key, r.value])));
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, load);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const hasChanges = settings.some((s) => draft[s.key] !== s.value);

  const handleSave = async () => {
    if (!canEdit) {
      showError("Sem permissão", "Você não possui permissão para alterar as configurações do site.");
      return;
    }

    const changed = settings.filter((s) => draft[s.key] !== s.value);
    if (changed.length === 0) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setSaving(true);
    toast.info("Salvando configurações…", undefined, 0);
    try {
      for (const setting of changed) {
        const { error } = await supabase
          .from("settings")
          .update({ value: draft[setting.key], updated_by: user?.id ?? null })
          .eq("key", setting.key);
        if (error) throw error;

        await writeAuditLog({
          user,
          action: "update",
          module: "settings",
          record_id: setting.id,
          field: setting.key,
          previous_value: setting.value,
          new_value: draft[setting.key],
        });
      }

      toast.success("Configurações salvas!", `${changed.length} ${changed.length === 1 ? "alteração aplicada" : "alterações aplicadas"} ao site.`);
      load();
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, handleSave);
    } finally {
      setSaving(false);
    }
  };

  const groups = settings.reduce<Record<string, SettingsRow[]>>((acc, s) => {
    (acc[s.group_name] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <ToastContainer />
      <ErrorModalContainer />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Configurações</h1>
          <p className="text-sm text-white/40 mt-0.5">Dados de contato e informações gerais exibidas no site</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Carregando…</div>
      ) : settings.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">
          Nenhuma configuração cadastrada.
          <p className="text-xs text-white/20 mt-2">Rode a migration supabase/create-settings.sql no Supabase.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([groupName, items]) => {
            const cfg = GROUP_LABELS[groupName] ?? { label: groupName, icon: SettingsIcon };
            const Icon = cfg.icon;
            return (
              <div key={groupName} className="rounded-xl border border-white/5 bg-white/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Icon size={15} className="text-primary" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-white/60">{cfg.label}</h2>
                </div>
                <div className="space-y-4">
                  {items.map((s) => (
                    <div key={s.key}>
                      <label className="block text-xs text-white/40 mb-1">{s.label}</label>
                      <input
                        type="text"
                        value={draft[s.key] ?? ""}
                        onChange={(e) => setDraft((prev) => ({ ...prev, [s.key]: e.target.value }))}
                        disabled={!canEdit}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {!canEdit && (
            <p className="text-xs text-white/30 text-center">
              Você tem acesso apenas para visualizar as configurações.
            </p>
          )}

          {canEdit && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Salvando…" : "Salvar alterações"}
              </button>
              {hasChanges && !saving && (
                <span className="text-xs text-yellow-400">Há alterações não salvas</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
