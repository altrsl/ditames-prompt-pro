import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react";
import { getCurrentCmsUser, writeAuditLog } from "@/lib/admin";
import { supabase, storageUrl } from "@/lib/supabase";
import { useToast, Alert } from "@/components/admin/Toast";
import type { CmsUserRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/blog/$id")({
  component: BlogEditor,
});

function BlogEditor() {
  const { id } = Route.useParams();
  const router = useRouter();
  const isNew = id === "new";
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast, ToastContainer } = useToast();

  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Educação Ambiental");
  const [published, setPublished] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const u = await getCurrentCmsUser();
        setUser(u);
        if (!isNew) {
          const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single();
          if (error || !data) {
            toast.error("Artigo não encontrado", "Verifique se o ID é válido.");
            return;
          }
          setTitle(data.title); setBody(data.body); setExcerpt(data.excerpt);
          setCategory(data.category); setPublished(data.published);
          setCoverUrl(data.cover_url ?? null);
          setSeoTitle(data.seo_title ?? ""); setSeoDesc(data.seo_description ?? "");
        }
      } catch (e: any) {
        toast.error("Erro ao carregar", e?.message ?? "Não foi possível carregar o artigo.");
      }
    }
    load();
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande", "O limite é 10 MB.");
      return;
    }
    setUploading(true);
    toast.info("Enviando imagem…", undefined, 0);
    try {
      const ext = file.name.split(".").pop();
      const path = `blog/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;
      const url = storageUrl("media", path);
      setCoverUrl(url);
      if (user) {
        await supabase.from("media").insert({ filename: file.name, storage_path: path, public_url: url, category: "blog", size_bytes: file.size, mime_type: file.type, uploaded_by: user.id });
      }
      toast.success("Imagem enviada com sucesso!");
    } catch (e: any) {
      toast.error("Falha no upload", e?.message ?? "Verifique sua conexão e tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setInlineError(null);
    if (!title.trim()) {
      setInlineError("O título é obrigatório.");
      toast.warn("Campo obrigatório", "Preencha o título antes de salvar.");
      return;
    }
    if (!body.trim()) {
      setInlineError("O conteúdo é obrigatório.");
      toast.warn("Campo obrigatório", "Preencha o conteúdo antes de salvar.");
      return;
    }

    setSaving(true);
    toast.info("Salvando artigo…", undefined, 0);
    try {
      const words = body.split(/\s+/).length;
      const readTime = `${Math.max(1, Math.round(words / 200))} min de leitura`;
      const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80) + "-" + Date.now().toString(36);

      if (isNew) {
        const { error } = await supabase.from("blog_posts").insert({
          slug, title, body, excerpt: excerpt || body.slice(0, 160),
          category, cover_url: coverUrl, published,
          published_at: published ? new Date().toISOString() : null,
          read_time: readTime, seo_title: seoTitle || null, seo_description: seoDesc || null,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").update({
          title, body, excerpt: excerpt || body.slice(0, 160),
          category, cover_url: coverUrl, published,
          published_at: published ? new Date().toISOString() : null,
          read_time: readTime, seo_title: seoTitle || null, seo_description: seoDesc || null,
        }).eq("id", id);
        if (error) throw error;
      }

      await writeAuditLog({ user, action: isNew ? "create" : "update", module: "blog", new_value: { title, published } });

      toast.success(isNew ? "Artigo criado!" : "Artigo atualizado!", published ? "Publicado e visível no blog." : "Salvo como rascunho.");
      setTimeout(() => router.navigate({ to: "/admin/blog" }), 1500);
    } catch (e: any) {
      const msg = e?.message ?? "";
      if (msg.includes("duplicate") || msg.includes("unique")) {
        toast.error("Título duplicado", "Já existe um artigo com este título.");
      } else if (msg.includes("permission") || msg.includes("RLS")) {
        toast.error("Sem permissão", "Você não tem permissão para realizar esta ação.");
      } else {
        toast.error("Erro ao salvar", msg || "Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <ToastContainer />
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/blog" className="text-white/40 hover:text-white"><ArrowLeft size={18} /></Link>
        <h1 className="text-xl font-bold text-white">{isNew ? "Novo artigo" : "Editar artigo"}</h1>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Título *</label>
          <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); setInlineError(null); }}
            placeholder="Título do artigo"
            className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-colors ${!title.trim() && inlineError ? "border-red-500/60" : "border-white/10 focus:border-primary/60"}`} />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Conteúdo *</label>
          <textarea value={body} onChange={(e) => { setBody(e.target.value); setInlineError(null); }}
            rows={12} placeholder="Escreva o conteúdo do artigo…"
            className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-colors resize-y ${!body.trim() && inlineError ? "border-red-500/60" : "border-white/10 focus:border-primary/60"}`} />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Resumo</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
            placeholder="Breve resumo para listagens e SEO…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a2118] px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60">
              {["Educação Ambiental", "Rural", "Tecnologia", "Hidrologia", "Florestal", "Licenciamento"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Status</label>
            <select value={published ? "published" : "draft"} onChange={(e) => setPublished(e.target.value === "published")}
              className="w-full rounded-lg border border-white/10 bg-[#1a2118] px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60">
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Imagem de capa</label>
          {coverUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-white/10">
              <img src={coverUrl} alt="Capa" className="w-full max-h-48 object-cover" />
              <button onClick={() => { setCoverUrl(null); toast.info("Imagem removida."); }}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/60">
                <X size={12} />
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 py-8 text-sm text-white/30 hover:border-primary/40 hover:text-white/60 disabled:opacity-50">
              <Upload size={18} /> {uploading ? "Enviando…" : "Clique para fazer upload (máx. 10 MB)"}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>

        <div className="rounded-xl border border-white/5 bg-white/5 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">SEO</h3>
          <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Meta title"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60" />
          <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={2} placeholder="Meta description"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 resize-none" />
        </div>

        {inlineError && (
          <Alert type="error" title={inlineError} onClose={() => setInlineError(null)} />
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Salvando…" : "Salvar artigo"}
          </button>
          <Link to="/admin/blog"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-white/60 hover:text-white hover:border-white/30 transition-colors">
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
