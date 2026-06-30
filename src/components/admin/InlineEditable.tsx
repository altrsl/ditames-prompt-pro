/**
 * Ditames CMS — Inline Editable Components
 *
 * Arquitetura genérica e reutilizável.
 * Qualquer componente do site pode adotar edição inline com uma linha.
 *
 * Componentes:
 *   <E.Text>    — textos inline e multiline
 *   <E.Image>   — imagens com upload/URL/remover
 *   <E.Block>   — bloco com menu (editar, excluir, duplicar)
 *
 * Uso:
 *   import * as E from "@/components/admin/InlineEditable";
 *   <E.Text k="hero_title" fallback="Título padrão" as="h1" className="..." />
 *   <E.Image k="hero_img" fallback={heroImg} className="..." />
 */

import {
  useRef, useState, type ElementType, type ReactNode,
} from "react";
import {
  Check, X, Upload, Link2, Image as ImageIcon,
  Trash2, Edit3, MoreHorizontal,
} from "lucide-react";
import { useEditMode, useEditable } from "@/lib/edit-mode";
import { supabase, storageUrl } from "@/lib/supabase";
import { useToast, useErrorModal, friendlyError } from "@/components/admin/Toast";
import type { MediaCategory } from "@/lib/database.types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

// ─── TOOLTIP DE METADADOS ─────────────────────────────────────

interface Meta { createdBy?: string; updatedBy?: string; updatedAt?: string }

function Tooltip({ meta }: { meta?: Meta }) {
  if (!meta) return null;
  return (
    <div className="pointer-events-none absolute -top-1 left-0 -translate-y-full z-[10000]
      bg-[#1a2118] border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white/50
      shadow-xl whitespace-nowrap min-w-max">
      {meta.createdBy && <div>Criado por <span className="text-white/80">{meta.createdBy}</span></div>}
      {meta.updatedBy && (
        <div>
          Última edição: <span className="text-white/80">{meta.updatedBy}</span>
          {meta.updatedAt && <span className="ml-1 text-white/30">
            {new Date(meta.updatedAt).toLocaleDateString("pt-BR")}
          </span>}
        </div>
      )}
    </div>
  );
}

// ─── EDIT HIGHLIGHT ───────────────────────────────────────────

function EditHint() {
  return (
    <span className="absolute -top-1 -right-1 hidden group-hover:flex h-5 w-5
      items-center justify-center rounded-full bg-primary text-white z-10 pointer-events-none">
      <Edit3 size={9} />
    </span>
  );
}

// ─── TEXT ─────────────────────────────────────────────────────

interface TextProps {
  k: string;                        // chave no banco
  fallback: string;                 // valor padrão (hardcoded)
  as?: ElementType;                 // tag HTML: p, h1, h2, span, div...
  className?: string;
  multiline?: boolean;
  module?: string;
  meta?: Meta;
  children?: ReactNode;             // conteúdo rico (JSX) — mostrado em modo normal
}

export function Text({
  k, fallback, as: Tag = "span", className = "",
  multiline = false, module, meta, children,
}: TextProps) {
  const { editMode } = useEditMode();
  const [value, save] = useEditable(k, fallback, module);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [hover, setHover] = useState(false);
  const { toast, ToastContainer } = useToast();
  const { showError, ErrorModalContainer } = useErrorModal();

  // Modo normal — renderiza igual ao original
  if (!editMode) {
    return <Tag className={className}>{children ?? value}</Tag>;
  }

  const handleSave = async () => {
    if (draft === value) { setEditing(false); return; }
    if (!draft.trim()) {
      showError("Texto vazio", "O campo não pode ficar em branco. Cancele ou digite um conteúdo.");
      return;
    }
    setSaving(true);
    try {
      await save(draft);
      toast.success("Texto atualizado!");
      setEditing(false);
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, handleSave);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setDraft(value); setEditing(false); };

  if (editing) {
    return (
      <span className="relative inline-block w-full">
        <ToastContainer />
        <ErrorModalContainer />
        {multiline ? (
          <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
            className={`${className} w-full bg-primary/5 border-2 border-primary/60 rounded-lg
              px-2 py-1 outline-none resize-y min-h-[60px] text-inherit`} />
        ) : (
          <input autoFocus type="text" value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
            className={`${className} w-full bg-primary/5 border-2 border-primary/60 rounded-lg
              px-2 py-1 outline-none text-inherit`} />
        )}
        <span className="absolute -bottom-8 right-0 flex items-center gap-1 z-[10000]">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-white hover:opacity-90 disabled:opacity-50">
            <Check size={10} /> {saving ? "…" : "Salvar"}
          </button>
          <button onClick={handleCancel}
            className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[10px] text-white/60 hover:text-white">
            <X size={10} /> Cancelar
          </button>
        </span>
      </span>
    );
  }

  return (
    <Tag
      className={`${className} relative cursor-pointer group`}
      onClick={() => { setDraft(value); setEditing(true); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Clique para editar"
    >
      {/* Borda de highlight */}
      <span className="absolute inset-0 rounded ring-2 ring-primary/0 group-hover:ring-primary/50
        transition-all pointer-events-none" />
      <EditHint />
      {hover && <Tooltip meta={meta} />}
      {children ?? value}
    </Tag>
  );
}

// ─── IMAGE ────────────────────────────────────────────────────

interface ImageProps {
  k: string;
  fallback: string;
  alt: string;
  className?: string;
  module?: string;
  meta?: Meta;
  folder?: MediaCategory;      // pasta no Storage: "homepage", "cases", "blog"...
}

export function Image({
  k, fallback, alt, className = "", module, meta, folder = "homepage",
}: ImageProps) {
  const { editMode, cmsUser } = useEditMode();
  const [value, save] = useEditable(k, fallback, module);
  const [showMenu, setShowMenu] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const [hover, setHover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast, ToastContainer } = useToast();
  const { showError, ErrorModalContainer } = useErrorModal();

  if (!editMode) {
    return <img src={value} alt={alt} className={className} />;
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      showError("Arquivo muito grande", "O limite é 10 MB. Reduza o tamanho da imagem e tente novamente.");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      showError("Formato não suportado", "Use imagens nos formatos JPG, PNG, WebP, SVG ou GIF.");
      return;
    }
    if (!cmsUser) {
      showError("Sessão expirada", "Faça login novamente para continuar editando.");
      return;
    }

    setUploading(true);
    setShowMenu(false);
    try {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file);
      if (upErr) throw upErr;
      const url = storageUrl("media", path);

      const { error: mediaErr } = await supabase.from("media").insert({
        filename: file.name, storage_path: path, public_url: url,
        category: folder, size_bytes: file.size, mime_type: file.type,
        uploaded_by: cmsUser.id,
      });
      if (mediaErr) throw mediaErr;

      await save(url);
      toast.success("Imagem substituída com sucesso!");
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, () => fileRef.current?.click());
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleUrl = async () => {
    if (!urlDraft.trim()) {
      showError("URL vazia", "Informe uma URL válida de imagem.");
      return;
    }
    try {
      new URL(urlDraft.trim());
    } catch {
      showError("URL inválida", "Verifique se o endereço está correto e começa com http:// ou https://");
      return;
    }
    try {
      await save(urlDraft.trim());
      toast.success("Imagem atualizada!");
      setShowUrl(false);
      setUrlDraft("");
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remover esta imagem? Ela voltará à imagem padrão do site.")) return;
    setShowMenu(false);
    try {
      await save(fallback);
      toast.success("Imagem removida.", "Voltou à imagem padrão.");
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message);
    }
  };

  return (
    <div
      className="relative group inline-block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setShowMenu(false); }}
    >
      <ToastContainer />
      <ErrorModalContainer />

      <img
        src={value}
        alt={alt}
        className={`${className} ${uploading ? "opacity-40" : ""} transition-opacity`}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all
          rounded cursor-pointer flex items-center justify-center"
        onClick={() => setShowMenu((v) => !v)}
      >
        <div className="hidden group-hover:flex items-center gap-1.5 bg-[#1a2118]/90
          rounded-lg px-3 py-1.5 text-xs font-semibold text-white border border-primary/30">
          <ImageIcon size={12} className="text-primary" />
          {uploading ? "Enviando…" : "Editar imagem"}
        </div>
      </div>

      {/* Menu contextual */}
      {showMenu && (
        <div className="absolute top-2 right-2 z-[10000] bg-[#1a2118] border border-white/10
          rounded-xl shadow-xl overflow-hidden min-w-[160px]">
          <button onClick={() => { setShowMenu(false); fileRef.current?.click(); }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-white/70
              hover:text-white hover:bg-white/5 transition-colors">
            <Upload size={12} /> Substituir imagem
          </button>
          <button onClick={() => { setShowMenu(false); setShowUrl(true); }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-white/70
              hover:text-white hover:bg-white/5 transition-colors">
            <Link2 size={12} /> Inserir URL
          </button>
          <button onClick={handleRemove}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-red-400
              hover:bg-red-500/10 transition-colors border-t border-white/5">
            <Trash2 size={12} /> Remover (voltar ao padrão)
          </button>
          <button onClick={() => setShowMenu(false)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-white/30
              hover:text-white hover:bg-white/5 transition-colors border-t border-white/5">
            <X size={12} /> Cancelar
          </button>
        </div>
      )}

      {/* Input URL */}
      {showUrl && (
        <div className="absolute top-full left-0 right-0 z-[10000] mt-2 bg-[#1a2118]
          border border-white/10 rounded-xl p-3 shadow-xl">
          <input autoFocus type="url" value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleUrl(); if (e.key === "Escape") setShowUrl(false); }}
            placeholder="https://..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2
              text-xs text-white placeholder-white/20 focus:outline-none focus:border-primary/60" />
          <div className="flex gap-2 mt-2">
            <button onClick={handleUrl}
              className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-white hover:opacity-90">
              Aplicar
            </button>
            <button onClick={() => setShowUrl(false)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 hover:text-white">
              <X size={11} />
            </button>
          </div>
        </div>
      )}

      {hover && <Tooltip meta={meta} />}
      <input ref={fileRef} type="file" accept={ALLOWED_TYPES.join(",")} onChange={handleUpload} className="hidden" />
    </div>
  );
}

// ─── BLOCK ────────────────────────────────────────────────────

interface BlockProps {
  children: ReactNode;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  label?: string;
}

export function Block({ children, className = "", onEdit, onDelete, label }: BlockProps) {
  const { editMode } = useEditMode();
  const [showMenu, setShowMenu] = useState(false);

  if (!editMode) return <div className={className}>{children}</div>;

  return (
    <div
      className={`${className} relative group`}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Borda de highlight */}
      <div className="absolute inset-0 rounded ring-2 ring-primary/0 group-hover:ring-primary/30
        transition-all pointer-events-none z-10" />

      {/* Botão de menu do bloco */}
      <button
        onClick={() => setShowMenu((v) => !v)}
        className="absolute top-1 right-1 z-20 hidden group-hover:flex h-6 w-6
          items-center justify-center rounded-md bg-[#1a2118]/90 border border-primary/30
          text-primary hover:bg-primary hover:text-white transition-colors"
        title={label ?? "Opções do bloco"}
      >
        <MoreHorizontal size={12} />
      </button>

      {showMenu && (
        <div className="absolute top-7 right-1 z-[10000] bg-[#1a2118] border border-white/10
          rounded-xl shadow-xl overflow-hidden min-w-[140px]">
          {onEdit && (
            <button onClick={() => { setShowMenu(false); onEdit(); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-white/70
                hover:text-white hover:bg-white/5 transition-colors">
              <Edit3 size={12} /> Editar
            </button>
          )}
          {onDelete && (
            <button onClick={() => { setShowMenu(false); onDelete(); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-red-400
                hover:bg-red-500/10 transition-colors border-t border-white/5">
              <Trash2 size={12} /> Excluir
            </button>
          )}
          <button onClick={() => setShowMenu(false)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-white/30
              hover:text-white hover:bg-white/5 transition-colors border-t border-white/5">
            <X size={12} /> Cancelar
          </button>
        </div>
      )}

      {children}
    </div>
  );
}

// ─── RE-EXPORTS LEGACY (compatibilidade com código anterior) ──
export { Text as InlineText, Image as InlineImage };
