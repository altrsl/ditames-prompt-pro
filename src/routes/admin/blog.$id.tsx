import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { getCurrentCmsUser } from "@/lib/admin";
import { supabase, storageUrl } from "@/lib/supabase";
import type { CmsUserRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/blog/$id")({
  component: BlogEditor,
});

function BlogEditor() {
  const { id } = Route.useParams();
  const router = useRouter();
  const isNew = id === "new";
  const fileRef = useRef<HTMLInputElement>(null);

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const u = await getCurrentCmsUser();
      setUser(u);
      if (!isNew) {
        const { data } = await supabase.from("blog_posts").select("*").eq("id", id).single();
        if (data) {
          setTitle(data.title); setBody(data.body); setExcerpt(data.excerpt);
          setCategory(data.category); setPublished(data.published);
          setCoverUrl(data.cover_url ?? null); setSeoTitle(data.seo_title ?? ""); setSeoDesc(data.seo_description ?? "");
        }
      }
    }
    load();
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `blog/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file);
      if (upErr) throw upErr;
      const url = storageUrl("media", path);
      setCoverUrl(url);
      await supabase.from("media").insert({ filename: file.name, storage_path: path, public_url: url, category: "blog", size_bytes: file.size, mime_type: file.type, uploaded_by: user.id });
    } catch { setError("Erro ao fazer upload."); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) { setError("Título e conteúdo são obrigatórios."); return; }
    setSaving(true); setError(null);
    try {
      const words = body.split(/\s+/).length;
      const readTime = `${Math.max(1, Math.round(words / 200))} min de leitura`;
      const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80) + "-" + Date.now().toString(36);

      if (isNew) {
        await supabase.from("blog_posts").insert({ slug, title, body, excerpt: excerpt || body.slice(0, 160), category, cover_url: coverUrl, published, published_at: published ? new Date().toISOString() : null, read_time: readTime, seo_title: seoTitle || null, seo_description: seoDesc || null });
      } else {
        await supabase.from("blog_posts").update({ title, body, excerpt: excerpt || body.slice(0, 160), category, cover_url: coverUrl, published, published_at: published ? new Date().toISOString() : null, read_time: readTime, seo_title: seoTitle || null, seo_description: seoDesc || null }).eq("id", id);
      }
      setSuccess(true);
      setTimeout(() => router.navigate({ to: "/admin/blog" }), 1200);
    } catch { setError("Erro ao salvar artigo."); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/blog" className="text-white/40 hover:text-white"><ArrowLeft size={18} /></Link>
        <h1 className="text-xl font-bold text-white">{isNew ? "Novo artigo" : "Editar artigo"}</h1>
      </div>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Título *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do artigo"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Conteúdo *</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} placeholder="Escreva o conteúdo…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 resize-y" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Resumo</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} placeholder="Breve resumo…"
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
              <button onClick={() => setCoverUrl(null)} className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/60"><X size={12} /></button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 py-8 text-sm text-white/30 hover:border-primary/40 hover:text-white/60 disabled:opacity-50">
              <Upload size={18} /> {uploading ? "Enviando…" : "Clique para fazer upload"}
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
        {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>}
        {success && <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">Salvo com sucesso!</div>}
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
            <Save size={15} /> {saving ? "Salvando…" : "Salvar"}
          </button>
          <Link to="/admin/blog" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-white/60 hover:text-white hover:border-white/30">Cancelar</Link>
        </div>
      </div>
    </div>
  );
}
