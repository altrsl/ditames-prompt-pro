import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Save, Upload, X, Eye } from "lucide-react";
import { getCurrentCmsUser, hasPermission, writeAuditLog } from "@/lib/admin";
import { createNewsManual, updateNews, getNewsById } from "@/lib/news";
import { supabase, storageUrl } from "@/lib/supabase";
import type { CmsUserRow, NewsRow, NewsStatus } from "@/lib/database.types";

export const Route = createFileRoute("/admin/news/$id")({
  component: NewsEditor,
});

function NewsEditor() {
  const { id } = Route.useParams();
  const router = useRouter();
  const isNew = id === "new";
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [original, setOriginal] = useState<NewsRow | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Institucional");
  const [status, setStatus] = useState<NewsStatus>("draft");
  const [coverImage, setCoverImage] = useState<string | null>(null);
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
        const item = await getNewsById(id);
        if (item) {
          setOriginal(item);
          setTitle(item.title);
          setContent(item.content);
          setExcerpt(item.excerpt);
          setCategory(item.category);
          setStatus(item.status);
          setCoverImage(item.cover_image ?? null);
          setSeoTitle(item.seo_title ?? "");
          setSeoDesc(item.seo_description ?? "");
        }
      }
    }
    load();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `noticias/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file);
      if (upErr) throw upErr;
      const url = storageUrl("media", path);
      setCoverImage(url);
      // Registra na tabela media
      await supabase.from("media").insert({
        filename: file.name,
        storage_path: path,
        public_url: url,
        category: "noticias",
        size_bytes: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
      });
    } catch (e) {
      setError("Erro ao fazer upload da imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !title.trim() || !content.trim()) {
      setError("Título e conteúdo são obrigatórios.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        await createNewsManual(
          { title, content, excerpt, category, cover_image: coverImage ?? undefined, status, seo_title: seoTitle, seo_description: seoDesc },
          user
        );
      } else {
        await updateNews(id, { title, content, excerpt, category, cover_image: coverImage, status, seo_title: seoTitle, seo_description: seoDesc }, user);
      }
      setSuccess(true);
      setTimeout(() => router.navigate({ to: "/admin/news" }), 1200);
    } catch (e) {
      setError("Erro ao salvar notícia.");
    } finally {
      setSaving(false);
    }
  };

  const canPublish = hasPermission(user, "publish_archive_content");

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/news" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-white">
          {isNew ? "Nova notícia" : "Editar notícia"}
        </h1>
        {original?.source === "instagram" && (
          <span className="text-[10px] font-bold uppercase tracking-widest bg-pink-500/20 text-pink-400 px-2 py-1 rounded-full">
            Instagram
          </span>
        )}
      </div>

      <div className="space-y-5">
        {/* Título */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da notícia"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>

        {/* Conteúdo */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Conteúdo *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="Escreva o conteúdo da notícia…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors resize-y"
          />
        </div>

        {/* Resumo */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Resumo (excerpt)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Breve resumo para listagens e SEO…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a2118] px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
            >
              {["Institucional", "Projeto", "Evento", "Regulatório", "Instagram"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as NewsStatus)}
              disabled={!canPublish && status !== "draft"}
              className="w-full rounded-lg border border-white/10 bg-[#1a2118] px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-50"
            >
              <option value="draft">Rascunho</option>
              {canPublish && <option value="published">Publicado</option>}
              {canPublish && <option value="archived">Arquivado</option>}
            </select>
          </div>
        </div>

        {/* Imagem de capa */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Imagem de capa</label>
          {coverImage ? (
            <div className="relative rounded-xl overflow-hidden border border-white/10">
              <img src={coverImage} alt="Capa" className="w-full max-h-48 object-cover" />
              <button
                onClick={() => setCoverImage(null)}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/60 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 py-8 text-sm text-white/30 hover:border-primary/40 hover:text-white/60 transition-colors disabled:opacity-50"
            >
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
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title || "Título da notícia — Ditames Ambiental"}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Meta description</label>
            <textarea
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              rows={2}
              placeholder={excerpt || "Descrição para mecanismos de busca…"}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Link Instagram */}
        {original?.instagram_url && (
          <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-0.5">Publicação original</div>
              <div className="text-xs text-white/40 truncate">{original.instagram_url}</div>
            </div>
            <a
              href={original.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1 text-xs font-semibold text-pink-400 hover:underline"
            >
              <Eye size={12} /> Ver no Instagram
            </a>
          </div>
        )}

        {/* Feedback */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
        )}
        {success && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">Salvo com sucesso!</div>
        )}

        {/* Salvar */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Save size={15} /> {saving ? "Salvando…" : "Salvar"}
          </button>
          <Link
            to="/admin/news"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-white/60 hover:text-white hover:border-white/30 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
