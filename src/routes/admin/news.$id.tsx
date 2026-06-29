import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Save, Upload, X, Eye, Loader2 } from "lucide-react";
import { getCurrentCmsUser, writeAuditLog } from "@/lib/admin";
import { supabase, storageUrl } from "@/lib/supabase";
import type { CmsUserRow, NewsStatus } from "@/lib/database.types";

export const Route = createFileRoute("/admin/news/$id")({
  component: NewsEditor,
});

// Busca notícia diretamente — sem depender de lib/news.ts
async function fetchNews(id: string) {
  const { data } = await supabase.from("news").select("*").eq("id", id).single();
  return data;
}

function NewsEditor() {
  const { id } = Route.useParams();
  const router = useRouter();
  const isNew = id === "new";
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Institucional");
  const [status, setStatus] = useState<NewsStatus>("draft");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [instagramUrl, setInstagramUrl] = useState<string | null>(null);
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
      setUserLoaded(true);

      if (!isNew) {
        const item = await fetchNews(id);
        if (item) {
          setTitle(item.title ?? "");
          setContent(item.content ?? "");
          setExcerpt(item.excerpt ?? "");
          setCategory(item.category ?? "Institucional");
          setStatus(item.status ?? "draft");
          setCoverImage(item.cover_image ?? null);
          setInstagramUrl(item.instagram_url ?? null);
          setSeoTitle(item.seo_title ?? "");
          setSeoDesc(item.seo_description ?? "");
        }
      }
    }
    load();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `noticias/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file);
      if (upErr) throw upErr;
      const url = storageUrl("media", path);
      setCoverImage(url);
      if (user) {
        await supabase.from("media").insert({
          filename: file.name, storage_path: path, public_url: url,
          category: "noticias", size_bytes: file.size, mime_type: file.type,
          uploaded_by: user.id,
        });
      }
    } catch {
      setError("Erro ao fazer upload da imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) { setError("O título é obrigatório."); return; }
    if (!content.trim()) { setError("O conteúdo é obrigatório."); return; }

    setSaving(true);
    try {
      const words = content.split(/\s+/).length;
      const readTime = `${Math.max(1, Math.round(words / 200))} min de leitura`;
      const slug = title.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "").trim()
        .replace(/\s+/g, "-").slice(0, 80)
        + "-" + Date.now().toString(36);

      const payload = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.trim().slice(0, 160),
        category,
        cover_image: coverImage ?? null,
        images: coverImage ? [coverImage] : [],
        source: "manual" as const,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
        read_time: readTime,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDesc.trim() || null,
        updated_by: user?.id ?? null,
      };

      let savedId = id;

      if (isNew) {
        const { data, error: insertError } = await supabase
          .from("news")
          .insert({ ...payload, slug, created_by: user?.id ?? null })
          .select("id")
          .single();

        if (insertError) throw insertError;
        savedId = data.id;
      } else {
        const { error: updateError } = await supabase
          .from("news")
          .update(payload)
          .eq("id", id);

        if (updateError) throw updateError;
      }

      await writeAuditLog({
        user,
        action: isNew ? "create" : "update",
        module: "news",
        record_id: savedId,
        new_value: { title: title.trim(), status },
      });

      setSuccess(true);
      setTimeout(() => router.navigate({ to: "/admin/news" }), 1200);
    } catch (e: any) {
      console.error("[news save]", e);
      setError(`Erro ao salvar: ${e?.message ?? "Tente novamente."}`);
    } finally {
      setSaving(false);
    }
  };

  // Enquanto carrega, mostra estado neutro mas funcional
  const isDirector = user?.role === "director";
  const canPublish = isDirector || !!user?.permissions?.publish_archive_content;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/news" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-white">
          {isNew ? "Nova notícia" : "Editar notícia"}
        </h1>
        {!userLoaded && <Loader2 size={14} className="text-white/30 animate-spin" />}
      </div>

      <div className="space-y-5">
        {/* Título */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
            Título *
          </label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da notícia"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors" />
        </div>

        {/* Conteúdo */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
            Conteúdo *
          </label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            rows={10} placeholder="Escreva o conteúdo da notícia…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors resize-y" />
        </div>

        {/* Resumo */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
            Resumo <span className="text-white/20 normal-case font-normal">(aparece nas listagens)</span>
          </label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
            rows={2} placeholder="Breve resumo para listagens e SEO…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a2118] px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60">
              {["Institucional", "Projeto", "Evento", "Regulatório", "Instagram"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status — sempre mostra todas as opções, sem depender de canPublish para renderizar */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as NewsStatus)}
              className="w-full rounded-lg border border-white/10 bg-[#1a2118] px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60">
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
        </div>

        {/* Imagem de capa */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
            Imagem de capa
          </label>
          {coverImage ? (
            <div className="relative rounded-xl overflow-hidden border border-white/10">
              <img src={coverImage} alt="Capa" className="w-full max-h-48 object-cover" />
              <button onClick={() => setCoverImage(null)}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/60">
                <X size={12} />
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 py-8 text-sm text-white/30 hover:border-primary/40 hover:text-white/60 disabled:opacity-50">
              <Upload size={18} /> {uploading ? "Enviando…" : "Clique para fazer upload"}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>

        {/* SEO */}
        <div className="rounded-xl border border-white/5 bg-white/5 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">SEO</h3>
          <div>
            <label className="block text-xs text-white/40 mb-1">Meta title</label>
            <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title || "Título da notícia — Ditames Ambiental"}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Meta description</label>
            <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)}
              rows={2} placeholder={excerpt || "Descrição para mecanismos de busca…"}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 resize-none" />
          </div>
        </div>

        {/* Link Instagram (se vier de importação) */}
        {instagramUrl && (
          <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-0.5">Publicação original</div>
              <div className="text-xs text-white/40 truncate">{instagramUrl}</div>
            </div>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1 text-xs font-semibold text-pink-400 hover:underline">
              <Eye size={12} /> Ver no Instagram
            </a>
          </div>
        )}

        {/* Feedback */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
            Salvo com sucesso! Redirecionando…
          </div>
        )}

        {/* Salvar */}
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Salvando…" : "Salvar notícia"}
          </button>
          <Link to="/admin/news"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-white/60 hover:text-white hover:border-white/30 transition-colors">
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
