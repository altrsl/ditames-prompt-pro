import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Save, Upload, X, Eye, Loader2, GripVertical, ImagePlus, Pencil } from "lucide-react";
import { getCurrentCmsUser, writeAuditLog, hasPermission } from "@/lib/admin";
import { supabase, storageUrl } from "@/lib/supabase";
import { useToast, useErrorModal, Alert, friendlyError } from "@/components/admin/Toast";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  getNewsImages, addNewsImage, updateNewsImage,
  deleteNewsImage, reorderNewsImages, newsImageUrl,
} from "@/lib/news";
import type { CmsUserRow, NewsStatus, NewsImageRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/news/$id")({
  component: NewsEditor,
});

function NewsEditor() {
  const { id } = Route.useParams();
  const router = useRouter();
  const isNew = id === "new";
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast, ToastContainer } = useToast();
  const { showError, ErrorModalContainer } = useErrorModal();

  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Institucional");
  const [status, setStatus] = useState<NewsStatus>("draft");
  const [instagramUrl, setInstagramUrl] = useState<string | null>(null);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Galeria
  const [images, setImages] = useState<NewsImageRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [savedNewsId, setSavedNewsId] = useState<string | null>(isNew ? null : id);

  useEffect(() => {
    async function load() {
      try {
        const u = await getCurrentCmsUser();
        setUser(u);
        setUserLoaded(true);
        if (!isNew) {
          const { data, error } = await supabase.from("news").select("*").eq("id", id).single();
          if (error || !data) {
            showError("Notícia não encontrada", "Verifique se o registro existe e tente novamente.");
            return;
          }
          setTitle(data.title ?? "");
          setContent(data.content ?? "");
          setExcerpt(data.excerpt ?? "");
          setCategory(data.category ?? "Institucional");
          setStatus(data.status ?? "draft");
          setInstagramUrl(data.instagram_url ?? null);
          setSeoTitle(data.seo_title ?? "");
          setSeoDesc(data.seo_description ?? "");
          // Carrega imagens da galeria
          const imgs = await getNewsImages(id);
          setImages(imgs);
        }
      } catch (e) {
        const { title: t, message } = friendlyError(e);
        showError(t, message);
        setUserLoaded(true);
      }
    }
    load();
  }, [id]);

  // ─── UPLOAD DE IMAGEM ──────────────────────────────────────

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    if (!user) { showError("Sessão expirada", "Faça login novamente."); return; }

    // Para notícia nova: precisa salvar primeiro para ter o ID
    if (isNew && !savedNewsId) {
      showError("Salve primeiro", "Salve a notícia antes de adicionar imagens para que elas possam ser associadas corretamente.");
      return;
    }

    const newsId = savedNewsId ?? id;
    const oversized = files.find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      showError("Arquivo muito grande", `"${oversized.name}" excede o limite de 10 MB.`);
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const invalid = files.find((f) => !allowed.includes(f.type));
    if (invalid) {
      showError("Formato não suportado", `"${invalid.name}" não é suportado. Use JPG, PNG, WebP ou GIF.`);
      return;
    }

    setUploading(true);
    toast.info(`Enviando ${files.length > 1 ? `${files.length} imagens` : "imagem"}…`, undefined, 0);

    let successCount = 0;
    for (const file of files) {
      try {
        const ext = file.name.split(".").pop();
        const storagePath = `noticias/${newsId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: upErr } = await supabase.storage.from("media").upload(storagePath, file);
        if (upErr) throw upErr;

        // Registrar na tabela media
        await supabase.from("media").insert({
          filename: file.name,
          storage_path: storagePath,
          public_url: storageUrl("media", storagePath),
          category: "noticias",
          size_bytes: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
        });

        // Registrar em news_images
        const img = await addNewsImage(newsId, storagePath, {
          altText: title || file.name,
          displayOrder: images.length + successCount + 1,
        });

        setImages((prev) => [...prev, img]);
        successCount++;
      } catch (e) {
        const { title: t, message } = friendlyError(e);
        showError(t, `Erro ao enviar "${file.name}": ${message}`);
      }
    }

    if (successCount > 0) {
      toast.success(
        successCount === files.length ? "Imagens enviadas!" : `${successCount} de ${files.length} enviadas`,
        "Aparecem na galeria abaixo."
      );
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  // ─── EDITAR LEGENDA / ALT ──────────────────────────────────

  const startEditImage = (img: NewsImageRow) => {
    setEditingImageId(img.id);
    setEditCaption(img.caption ?? "");
    setEditAlt(img.alt_text ?? "");
  };

  const handleSaveImageMeta = async () => {
    if (!editingImageId) return;
    try {
      await updateNewsImage(editingImageId, { caption: editCaption || null, alt_text: editAlt || null });
      setImages((prev) => prev.map((img) =>
        img.id === editingImageId ? { ...img, caption: editCaption || null, alt_text: editAlt || null } : img
      ));
      setEditingImageId(null);
      toast.success("Imagem atualizada.");
    } catch (e) {
      const { title: t, message } = friendlyError(e);
      showError(t, message);
    }
  };

  // ─── EXCLUIR IMAGEM ───────────────────────────────────────

  const handleDeleteImage = async (img: NewsImageRow) => {
    if (!confirm("Remover esta imagem permanentemente?")) return;
    try {
      await deleteNewsImage(img);
      setImages((prev) => prev.filter((i) => i.id !== img.id));
      toast.success("Imagem removida.");
    } catch (e) {
      const { title: t, message } = friendlyError(e);
      showError(t, message);
    }
  };

  // ─── REORDENAR (mover para cima/baixo) ───────────────────

  const moveImage = async (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newImages.length) return;
    [newImages[index], newImages[swapIdx]] = [newImages[swapIdx], newImages[index]];
    setImages(newImages);
    try {
      await reorderNewsImages(newImages.map((img) => img.id));
    } catch (e) {
      const { title: t, message } = friendlyError(e);
      showError(t, message);
    }
  };

  // ─── SALVAR NOTÍCIA ───────────────────────────────────────

  const handleSave = async () => {
    setInlineError(null);
    if (!hasPermission(user, "create_edit_news")) {
      showError("Sem permissão", isNew ? "Você não possui permissão para criar novas publicações." : "Você não possui permissão para editar esta publicação.");
      return;
    }
    if (status === "published" && !hasPermission(user, "publish_archive_content")) {
      showError("Sem permissão", "Você não possui permissão para publicar conteúdo. Salve como rascunho.");
      return;
    }
    if (!title.trim()) { setInlineError("O título é obrigatório."); return; }
    if (!content.trim()) { setInlineError("O conteúdo é obrigatório."); return; }

    setSaving(true);
    toast.info("Salvando notícia…", undefined, 0);
    try {
      const words = content.split(/\s+/).length;
      const readTime = `${Math.max(1, Math.round(words / 200))} min de leitura`;
      const slug = title.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80)
        + "-" + Date.now().toString(36);

      // cover_image continua como a primeira imagem da galeria (compatibilidade)
      const firstImage = images[0];
      const coverImage = firstImage ? storageUrl("media", firstImage.storage_path) : null;

      const payload = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.trim().slice(0, 160),
        category,
        cover_image: coverImage,
        images: images.map((img) => storageUrl("media", img.storage_path)),
        source: "manual" as const,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
        read_time: readTime,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDesc.trim() || null,
        updated_by: user?.id ?? null,
      };

      let newId = savedNewsId ?? id;
      if (isNew) {
        const { data, error } = await supabase
          .from("news").insert({ ...payload, slug, created_by: user?.id ?? null })
          .select("id").single();
        if (error) throw error;
        newId = data.id;
        setSavedNewsId(newId);
        // Agora que temos o ID, reordena as imagens se houver
        if (images.length > 0) {
          await reorderNewsImages(images.map((img) => img.id));
        }
      } else {
        const { error } = await supabase.from("news").update(payload).eq("id", id);
        if (error) throw error;
      }

      await writeAuditLog({ user, action: isNew ? "create" : "update", module: "news",
        record_id: newId, new_value: { title: title.trim(), status, images: images.length } });

      toast.success(isNew ? "Notícia criada!" : "Notícia atualizada!", status === "published" ? "Publicada e visível no site." : "Salva como rascunho.");
      setTimeout(() => router.navigate({ to: "/admin/news" }), 1500);
    } catch (e) {
      const { title: t, message } = friendlyError(e);
      showError(t, message, handleSave);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <ToastContainer />
      <ErrorModalContainer />

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
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Título *</label>
          <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); setInlineError(null); }}
            placeholder="Título da notícia"
            className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-colors ${!title.trim() && inlineError ? "border-red-500/60" : "border-white/10 focus:border-primary/60"}`} />
        </div>

        {/* Conteúdo */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
            Conteúdo *
            <span className="text-white/20 normal-case font-normal ml-2">
              Negrito, itálico, subtítulos, listas, imagens e links suportados
            </span>
          </label>
          <div className={!content.trim() && inlineError ? "ring-1 ring-red-500/60 rounded-lg" : ""}>
            <RichTextEditor
              value={content}
              onChange={(html) => { setContent(html); setInlineError(null); }}
              placeholder="Escreva o conteúdo da notícia…"
              folder="noticias"
              userId={user?.id}
              minHeight={320}
            />
          </div>
        </div>

        {/* Resumo */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
            Resumo <span className="text-white/20 normal-case font-normal">(aparece nas listagens)</span>
          </label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
            placeholder="Breve resumo para listagens e SEO…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 resize-none" />
        </div>

        {/* Categoria + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a2118] px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60">
              {["Institucional", "Projeto", "Evento", "Regulatório", "Instagram"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
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

        {/* ── GALERIA DE IMAGENS ─────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50">
              Galeria de imagens
              <span className="text-white/20 normal-case font-normal ml-2">({images.length} {images.length === 1 ? "imagem" : "imagens"})</span>
            </label>
            <button onClick={() => fileRef.current?.click()} disabled={uploading || (isNew && !savedNewsId)}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors">
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
              {uploading ? "Enviando…" : "Adicionar imagens"}
            </button>
          </div>

          {isNew && !savedNewsId && (
            <p className="text-xs text-yellow-400/70 mb-3 flex items-center gap-1">
              ⚠️ Salve a notícia primeiro para poder adicionar imagens.
            </p>
          )}

          {images.length === 0 ? (
            <button onClick={() => fileRef.current?.click()} disabled={uploading || (isNew && !savedNewsId)}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 py-8 text-sm text-white/30 hover:border-primary/40 hover:text-white/60 disabled:opacity-50 transition-colors">
              <Upload size={18} /> Clique para fazer upload (JPG, PNG, WebP · múltiplos arquivos · máx. 10 MB cada)
            </button>
          ) : (
            <div className="space-y-2">
              {images.map((img, idx) => (
                <div key={img.id}>
                  {/* Card da imagem */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button onClick={() => moveImage(idx, "up")} disabled={idx === 0}
                        className="text-white/20 hover:text-white disabled:opacity-0 transition-colors">
                        <GripVertical size={12} />
                      </button>
                    </div>

                    <img src={newsImageUrl(img.storage_path)} alt={img.alt_text ?? title}
                      className="h-14 w-20 rounded-lg object-cover shrink-0" />

                    <div className="min-w-0 flex-1">
                      {idx === 0 && (
                        <span className="text-[10px] font-bold uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded mb-1 inline-block">
                          Capa
                        </span>
                      )}
                      <div className="text-xs text-white/50 truncate">
                        {img.caption ?? <span className="text-white/20">Sem legenda</span>}
                      </div>
                      <div className="text-[10px] text-white/25 truncate">
                        {img.alt_text ?? <span>Sem texto ALT</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => moveImage(idx, "up")} disabled={idx === 0}
                        className="flex h-7 w-7 items-center justify-center rounded text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors text-xs font-bold">
                        ↑
                      </button>
                      <button onClick={() => moveImage(idx, "down")} disabled={idx === images.length - 1}
                        className="flex h-7 w-7 items-center justify-center rounded text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors text-xs font-bold">
                        ↓
                      </button>
                      <button onClick={() => startEditImage(img)}
                        className="flex h-7 w-7 items-center justify-center rounded text-white/30 hover:text-white hover:bg-white/10 transition-colors">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDeleteImage(img)}
                        className="flex h-7 w-7 items-center justify-center rounded text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Editar legenda/alt */}
                  {editingImageId === img.id && (
                    <div className="mx-3 rounded-b-xl border border-t-0 border-white/10 bg-white/5 p-3 space-y-2">
                      <div>
                        <label className="block text-[10px] text-white/30 mb-1">Legenda</label>
                        <input type="text" value={editCaption} onChange={(e) => setEditCaption(e.target.value)}
                          placeholder="Legenda exibida na galeria (opcional)"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-primary/60" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/30 mb-1">Texto ALT (acessibilidade/SEO)</label>
                        <input type="text" value={editAlt} onChange={(e) => setEditAlt(e.target.value)}
                          placeholder="Descrição da imagem para leitores de tela"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-primary/60" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleSaveImageMeta}
                          className="text-xs text-primary hover:underline">Salvar</button>
                        <button onClick={() => setEditingImageId(null)}
                          className="text-xs text-white/30 hover:text-white">Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-3 text-xs text-white/30 hover:border-primary/30 hover:text-white/50 disabled:opacity-50 transition-colors">
                <ImagePlus size={14} /> Adicionar mais imagens
              </button>
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            multiple onChange={handleImageUpload} className="hidden" />
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
            <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={2}
              placeholder={excerpt || "Descrição para mecanismos de busca…"}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 resize-none" />
          </div>
        </div>

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

        {inlineError && <Alert type="error" title={inlineError} onClose={() => setInlineError(null)} />}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Salvando…" : "Salvar notícia"}
          </button>
          <Link to="/admin/news" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-white/60 hover:text-white hover:border-white/30 transition-colors">
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
