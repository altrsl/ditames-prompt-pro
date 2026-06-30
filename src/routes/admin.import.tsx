import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Link2, Sparkles, ArrowRight, Newspaper, FileText,
  AlertTriangle, CheckCircle2, Edit3, Save, Upload, X, ArrowLeft,
} from "lucide-react";
import { importFromUrl, validateUrl, detectSourceType } from "@/lib/link-importer";
import { createNewsManual } from "@/lib/news";
import { getCurrentCmsUser, hasPermission, writeAuditLog } from "@/lib/admin";
import { supabase, storageUrl } from "@/lib/supabase";
import type { ImportedContent } from "@/lib/link-importer";
import type { NewsStatus } from "@/lib/database.types";

export const Route = createFileRoute("/admin/import")({
  component: AdminImport,
});

type PostType = "news" | "blog";

function AdminImport() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // Etapas: "input" → "loading" → "edit" → "saved"
  const [step, setStep] = useState<"input" | "loading" | "edit" | "saved">("input");
  const [url, setUrl] = useState("");
  const [postType, setPostType] = useState<PostType>("news");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Dados extraídos + editáveis
  const [imported, setImported] = useState<ImportedContent | null>(null);
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

  // ─── ETAPA 1: IMPORTAR ───────────────────────────────────────

  const handleImport = async () => {
    setUrlError(null);
    setImportError(null);

    if (!url.trim()) { setUrlError("Cole um link válido."); return; }
    if (!validateUrl(url.trim())) { setUrlError("URL inválida. Use http:// ou https://"); return; }

    setStep("loading");

    try {
      const data = await importFromUrl(url.trim());
      setImported(data);
      setTitle(data.title);
      setContent(data.content);
      setExcerpt(data.excerpt);
      setCoverImage(data.cover_image);
      setSeoTitle(data.title);
      setSeoDesc(data.excerpt.slice(0, 160));

      // Categoria padrão por tipo
      setCategory(postType === "news" ? "Institucional" : "Educação Ambiental");

      setStep("edit");
    } catch (e) {
      setImportError((e as Error).message);
      setStep("input");
    }
  };

  // ─── UPLOAD DE IMAGEM ────────────────────────────────────────

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const user = await getCurrentCmsUser();
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const folder = postType === "news" ? "noticias" : "blog";
      const path = `${folder}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;
      const publicUrl = storageUrl("media", path);
      setCoverImage(publicUrl);
      await supabase.from("media").insert({
        filename: file.name, storage_path: path, public_url: publicUrl,
        category: folder, size_bytes: file.size, mime_type: file.type, uploaded_by: user.id,
      });
    } catch { /* silencioso */ }
    finally { setUploading(false); }
  };

  // ─── ETAPA 2: SALVAR ─────────────────────────────────────────

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    const user = await getCurrentCmsUser();
    if (!user) return;

    setSaving(true);
    try {
      if (postType === "news") {
        await createNewsManual(
          {
            title, content, excerpt, category,
            cover_image: coverImage ?? undefined,
            images: imported?.images ?? [],
            status,
            seo_title: seoTitle,
            seo_description: seoDesc,
          },
          user
        );
      } else {
        // Blog post via Supabase direto
        await supabase.from("blog_posts").insert({
          slug: generateSlug(title),
          title, excerpt, body: content, category,
          cover_url: coverImage ?? null,
          read_time: estimateReadTime(content),
          published: status === "published",
          published_at: status === "published" ? new Date().toISOString() : null,
          seo_title: seoTitle || null,
          seo_description: seoDesc || null,
        });
      }

      await writeAuditLog({
        user,
        action: "create",
        module: postType === "news" ? "news" : "blog",
        new_value: {
          title,
          source_type: imported?.source_type ?? "external_link",
          source_url: imported?.source_url,
        },
      });

      setStep("saved");
      setTimeout(() => router.navigate({ to: postType === "news" ? "/admin/news" : "/admin/blog" }), 1500);
    } catch (e) {
      setImportError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Criar post via link</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Cole qualquer URL e o sistema gera o conteúdo automaticamente
          </p>
        </div>
      </div>

      {/* ── ETAPA: INPUT ─────────────────────────────────────── */}
      {step === "input" && (
        <div className="space-y-6">
          {/* Tipo do post */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
              Tipo de post
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { type: "news" as PostType, icon: Newspaper, label: "Notícia", desc: "Institucional, eventos, atividades" },
                { type: "blog" as PostType, icon: FileText, label: "Blog", desc: "Artigos educativos, conteúdo informativo" },
              ]).map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setPostType(opt.type)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    postType === opt.type
                      ? "border-primary bg-primary/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <opt.icon size={18} className={postType === opt.type ? "text-primary mt-0.5" : "text-white/40 mt-0.5"} />
                  <div>
                    <div className={`text-sm font-semibold ${postType === opt.type ? "text-white" : "text-white/60"}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
              URL do conteúdo
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setUrlError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleImport()}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <button
                onClick={handleImport}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                <Sparkles size={15} /> Gerar post
              </button>
            </div>
            {urlError && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} /> {urlError}
              </p>
            )}
          </div>

          {/* Exemplos de uso */}
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">
              Funciona com
            </div>
            <div className="grid gap-2 text-xs text-white/40">
              {[
                "📸 Post do Instagram (instagram.com/p/...)",
                "📰 Artigo de jornal ou portal de notícias",
                "🏛️ Comunicado de órgão ambiental",
                "📄 Qualquer página com título e descrição",
              ].map((ex) => (
                <div key={ex}>{ex}</div>
              ))}
            </div>
          </div>

          {importError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {importError}
            </div>
          )}
        </div>
      )}

      {/* ── ETAPA: LOADING ───────────────────────────────────── */}
      {step === "loading" && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
            <Sparkles size={24} className="text-primary animate-pulse" />
          </div>
          <div className="text-sm font-semibold text-white">Extraindo conteúdo…</div>
          <div className="text-xs text-white/40">Analisando metadados da página</div>
        </div>
      )}

      {/* ── ETAPA: EDIT ──────────────────────────────────────── */}
      {step === "edit" && imported && (
        <div className="space-y-5">
          {/* Badge de origem */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
              imported.source_type === "instagram"
                ? "bg-pink-500/20 text-pink-400"
                : "bg-blue-500/20 text-blue-400"
            }`}>
              {imported.source_type === "instagram" ? "Instagram" : "Link externo"}
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
              postType === "news" ? "bg-primary/20 text-primary" : "bg-purple-500/20 text-purple-400"
            }`}>
              {postType === "news" ? "Notícia" : "Blog"}
            </span>
            <a href={imported.source_url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-white/30 hover:text-white/60 transition-colors truncate max-w-xs">
              {imported.source_url}
            </a>
            <button onClick={() => setStep("input")}
              className="ml-auto text-xs text-white/30 hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft size={11} /> Trocar link
            </button>
          </div>

          {/* Aviso de edição */}
          <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
            <Edit3 size={14} className="text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-white/60">
              Conteúdo gerado automaticamente. Revise e edite todos os campos antes de publicar.
            </p>
          </div>

          {/* Título */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Título *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors" />
          </div>

          {/* Conteúdo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Conteúdo *</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors resize-y" />
          </div>

          {/* Resumo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Resumo</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Categoria */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Categoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1a2118] px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60">
                {postType === "news"
                  ? ["Institucional", "Projeto", "Evento", "Regulatório", "Instagram"].map((c) => <option key={c}>{c}</option>)
                  : ["Educação Ambiental", "Rural", "Tecnologia", "Hidrologia", "Florestal"].map((c) => <option key={c}>{c}</option>)
                }
              </select>
            </div>

            {/* Status */}
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
              {imported.cover_image && !coverImage && (
                <span className="ml-2 text-[10px] text-yellow-400 normal-case">imagem não carregada — faça upload manual</span>
              )}
            </label>
            {coverImage ? (
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <img src={coverImage} alt="Capa" className="w-full max-h-48 object-cover" />
                <button onClick={() => setCoverImage(null)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/60 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 py-6 text-sm text-white/30 hover:border-primary/40 hover:text-white/60 transition-colors disabled:opacity-50">
                <Upload size={16} /> {uploading ? "Enviando…" : "Fazer upload de imagem"}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-white/5 bg-white/5 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">SEO</h3>
            <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Meta title"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60" />
            <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)}
              rows={2} placeholder="Meta description"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 resize-none" />
          </div>

          {importError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{importError}</div>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !title.trim() || !content.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
              <Save size={15} /> {saving ? "Salvando…" : "Salvar post"}
            </button>
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-white/60 hover:text-white hover:border-white/30 transition-colors">
              Cancelar
            </Link>
          </div>
        </div>
      )}

      {/* ── ETAPA: SAVED ─────────────────────────────────────── */}
      {step === "saved" && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/20">
            <CheckCircle2 size={28} className="text-green-400" />
          </div>
          <div className="text-sm font-semibold text-white">Post salvo com sucesso!</div>
          <div className="text-xs text-white/40">Redirecionando…</div>
        </div>
      )}
    </div>
  );
}

function generateSlug(title: string): string {
  return (
    title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80)
    + "-" + Date.now().toString(36)
  );
}

function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min de leitura`;
}
