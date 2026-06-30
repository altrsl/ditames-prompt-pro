import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Copy, Check, Image as ImageIcon } from "lucide-react";
import { getCurrentCmsUser, hasPermission, writeAuditLog } from "@/lib/admin";
import { supabase, storageUrl } from "@/lib/supabase";
import { useToast, useErrorModal, friendlyError } from "@/components/admin/Toast";
import type { CmsUserRow, MediaRow, MediaCategory } from "@/lib/database.types";

export const Route = createFileRoute("/admin/media")({
  component: AdminMedia,
});

const CATEGORIES: (MediaCategory | "all")[] = ["all", "homepage", "cases", "blog", "noticias", "servicos", "geral"];
const CATEGORY_LABELS: Record<string, string> = {
  all: "Todos",
  homepage: "Homepage",
  cases: "Cases",
  blog: "Blog",
  noticias: "Notícias",
  servicos: "Serviços",
  geral: "Geral",
};

function AdminMedia() {
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [files, setFiles] = useState<MediaRow[]>([]);
  const [filter, setFilter] = useState<MediaCategory | "all">("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { toast, ToastContainer } = useToast();
  const { showError, ErrorModalContainer } = useErrorModal();

  async function load() {
    try {
      const u = await getCurrentCmsUser();
      setUser(u);
      let query = supabase.from("media").select("*").order("created_at", { ascending: false });
      if (filter !== "all") query = query.eq("category", filter);
      const { data, error } = await query;
      if (error) throw error;
      setFiles((data ?? []) as MediaRow[]);
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, load);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      showError("Arquivo muito grande", "O limite é 10 MB. Reduza o tamanho da imagem e tente novamente.");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      showError("Formato não suportado", "Use imagens nos formatos JPG, PNG, WebP ou GIF.");
      return;
    }

    setUploading(true);
    try {
      const category: MediaCategory = filter === "all" ? "geral" : filter;
      const ext = file.name.split(".").pop();
      const path = `${category}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file);
      if (upErr) throw upErr;
      const url = storageUrl("media", path);

      const { error } = await supabase.from("media").insert({
        filename: file.name,
        storage_path: path,
        public_url: url,
        category,
        size_bytes: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
      });
      if (error) throw error;

      await writeAuditLog({ user, action: "create", module: "media", new_value: { filename: file.name } });
      toast.success("Arquivo enviado com sucesso!");
      load();
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = async (item: MediaRow) => {
    if (!hasPermission(user, "edit_homepage_images")) {
      showError("Sem permissão", "Você não possui permissão para remover arquivos de mídia.");
      return;
    }
    if (!confirm(`Remover "${item.filename}" permanentemente? Isso não afeta conteúdo que já usa esta imagem.`)) return;
    try {
      await supabase.storage.from("media").remove([item.storage_path]);
      const { error } = await supabase.from("media").delete().eq("id", item.id);
      if (error) throw error;
      await writeAuditLog({ user, action: "delete", module: "media", record_id: item.id, previous_value: { filename: item.filename } });
      toast.success("Arquivo removido.");
      load();
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message);
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "—";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <ToastContainer />
      <ErrorModalContainer />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Biblioteca de mídia</h1>
          <p className="text-sm text-white/40 mt-0.5">Todas as imagens enviadas ao site</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Upload size={16} /> {uploading ? "Enviando…" : "Fazer upload"}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleUpload} className="hidden" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              filter === c ? "border-primary bg-primary text-white" : "border-white/10 text-white/40 hover:text-white"
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Carregando…</div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm flex flex-col items-center gap-3">
          <ImageIcon size={32} className="text-white/10" />
          Nenhum arquivo nesta categoria ainda.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/5 bg-white/5 overflow-hidden group">
              <div className="aspect-square bg-black/20 overflow-hidden">
                <img src={item.public_url} alt={item.alt_text ?? item.filename} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="text-xs font-medium text-white truncate" title={item.filename}>{item.filename}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-white/30 uppercase">{CATEGORY_LABELS[item.category] ?? item.category}</span>
                  <span className="text-[10px] text-white/30">{formatBytes(item.size_bytes)}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => handleCopy(item.public_url, item.id)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-md bg-white/5 py-1.5 text-[10px] font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {copiedId === item.id ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                    {copiedId === item.id ? "Copiado" : "Copiar URL"}
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
