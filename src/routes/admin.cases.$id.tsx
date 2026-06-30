import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react";
import { getCurrentCmsUser, writeAuditLog, hasPermission } from "@/lib/admin";
import { supabase, storageUrl } from "@/lib/supabase";
import { useToast, useErrorModal, Alert, friendlyError } from "@/components/admin/Toast";
import type { CmsUserRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/cases/$id")({
  component: CaseEditor,
});

function CaseEditor() {
  const { id } = Route.useParams();
  const router = useRouter();
  const isNew = id === "new";
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast, ToastContainer } = useToast();
  const { showError, ErrorModalContainer } = useErrorModal();

  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [orderIndex, setOrderIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const u = await getCurrentCmsUser();
        setUser(u);
        if (!isNew) {
          const { data, error } = await supabase.from("cases").select("*").eq("id", id).single();
          if (error || !data) {
            showError("Case não encontrado", "Verifique se o registro existe e tente novamente.");
            return;
          }
          setName(data.name);
          setSector(data.sector);
          setDescription(data.description ?? "");
          setPublished(data.published);
          setLogoUrl(data.logo_url ?? null);
          setOrderIndex(data.order_index ?? 0);
        }
      } catch (e) {
        const { title, message } = friendlyError(e);
        showError(title, message);
      }
    }
    load();
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showError("Arquivo muito grande", "O limite é 10 MB. Reduza o tamanho da imagem e tente novamente.");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      showError("Formato não suportado", "Use imagens nos formatos JPG, PNG, WebP, SVG ou GIF.");
      return;
    }
    setUploading(true);
    toast.info("Enviando logo…", undefined, 0);
    try {
      const ext = file.name.split(".").pop();
      const path = `cases/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;
      const url = storageUrl("media", path);
      setLogoUrl(url);
      if (user) {
        await supabase.from("media").insert({
          filename: file.name, storage_path: path, public_url: url,
          category: "cases", size_bytes: file.size, mime_type: file.type,
          uploaded_by: user.id,
        });
      }
      toast.success("Logo enviada com sucesso!");
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, () => fileRef.current?.click());
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setInlineError(null);

    if (!hasPermission(user, "edit_cases")) {
      showError(
        "Sem permissão",
        isNew
          ? "Você não possui permissão para criar novos cases."
          : "Você não possui permissão para editar este case."
      );
      return;
    }

    if (!name.trim()) { setInlineError("O nome do cliente é obrigatório."); return; }
    if (!sector.trim()) { setInlineError("O setor é obrigatório."); return; }

    setSaving(true);
    toast.info("Salvando case…", undefined, 0);
    try {
      const slug = name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);

      const payload = {
        name: name.trim(),
        sector: sector.trim(),
        description: description.trim() || null,
        logo_url: logoUrl,
        published,
        order_index: orderIndex,
      };

      let savedId = id;
      if (isNew) {
        const { data, error } = await supabase
          .from("cases").insert({ ...payload, slug: `${slug}-${Date.now().toString(36)}` })
          .select("id").single();
        if (error) throw error;
        savedId = data.id;
      } else {
        const { error } = await supabase.from("cases").update(payload).eq("id", id);
        if (error) throw error;
      }

      await writeAuditLog({
        user, action: isNew ? "create" : "update", module: "cases",
        record_id: savedId, new_value: { name: name.trim(), published },
      });

      toast.success(
        isNew ? "Case criado com sucesso!" : "Case atualizado!",
        published ? "Visível no site." : "Salvo como inativo."
      );
      setTimeout(() => router.navigate({ to: "/admin/cases" }), 1500);
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, handleSave);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <ToastContainer />
      <ErrorModalContainer />

      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/cases" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-white">{isNew ? "Novo case" : "Editar case"}</h1>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Nome do cliente *</label>
          <input type="text" value={name} onChange={(e) => { setName(e.target.value); setInlineError(null); }}
            placeholder="Ex: Madefrahm"
            className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-colors ${!name.trim() && inlineError ? "border-red-500/60" : "border-white/10 focus:border-primary/60"}`} />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Setor *</label>
          <input type="text" value={sector} onChange={(e) => { setSector(e.target.value); setInlineError(null); }}
            placeholder="Ex: Indústria moveleira"
            className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-colors ${!sector.trim() && inlineError ? "border-red-500/60" : "border-white/10 focus:border-primary/60"}`} />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            placeholder="Breve descrição do trabalho realizado…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 resize-y" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Status</label>
            <select value={published ? "active" : "inactive"} onChange={(e) => setPublished(e.target.value === "active")}
              className="w-full rounded-lg border border-white/10 bg-[#1a2118] px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60">
              <option value="active">Ativo (visível no site)</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Ordem de exibição</label>
            <input type="number" value={orderIndex} onChange={(e) => setOrderIndex(Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Logo do cliente</label>
          {logoUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center p-6">
              <img src={logoUrl} alt={name} className="max-h-24 object-contain" />
              <button onClick={() => { setLogoUrl(null); toast.info("Logo removida."); }}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/60">
                <X size={12} />
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 py-8 text-sm text-white/30 hover:border-primary/40 hover:text-white/60 disabled:opacity-50">
              <Upload size={18} /> {uploading ? "Enviando…" : "Clique para fazer upload (PNG, SVG, JPG · máx. 10 MB)"}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" onChange={handleUpload} className="hidden" />
          <p className="text-xs text-white/20 mt-2">Sem logo? O nome do cliente é exibido como texto enquanto a logo oficial não estiver disponível.</p>
        </div>

        {inlineError && <Alert type="error" title={inlineError} onClose={() => setInlineError(null)} />}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Salvando…" : "Salvar case"}
          </button>
          <Link to="/admin/cases" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-white/60 hover:text-white hover:border-white/30 transition-colors">
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
