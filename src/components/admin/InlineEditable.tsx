/**
 * Ditames CMS — Inline Editable Components
 *
 * Componentes que envolvem textos e imagens do site.
 * Em modo edição: exibem controles de edição.
 * Em modo normal: renderizam exatamente como antes — sem impacto visual.
 */

import { useRef, useState } from "react";
import { Check, X, Upload, Link2, Image, Trash2, Edit3 } from "lucide-react";
import { useEditMode } from "@/lib/edit-mode";
import { supabase, storageUrl } from "@/lib/supabase";
import { writeAuditLog } from "@/lib/admin";

// ─── TOOLTIP DE METADADOS ─────────────────────────────────────

interface EditMetadata {
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

function EditTooltip({ meta }: { meta: EditMetadata }) {
  return (
    <div className="absolute -top-2 left-0 -translate-y-full z-50 pointer-events-none
      bg-[#1a2118] border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white/50
      shadow-xl whitespace-nowrap min-w-max">
      {meta.createdBy && (
        <div>Criado por <span className="text-white/70">{meta.createdBy}</span>
          {meta.createdAt && <span className="ml-1 text-white/30">{new Date(meta.createdAt).toLocaleDateString("pt-BR")}</span>}
        </div>
      )}
      {meta.updatedBy && (
        <div>Editado por <span className="text-white/70">{meta.updatedBy}</span>
          {meta.updatedAt && <span className="ml-1 text-white/30">{new Date(meta.updatedAt).toLocaleDateString("pt-BR")}</span>}
        </div>
      )}
    </div>
  );
}

// ─── INLINE TEXT ──────────────────────────────────────────────

interface InlineTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  className?: string;
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
  multiline?: boolean;
  meta?: EditMetadata;
  children?: React.ReactNode;
}

export function InlineText({
  value,
  onSave,
  className = "",
  as: Tag = "span",
  multiline = false,
  meta,
  children,
}: InlineTextProps) {
  const { editMode, cmsUser } = useEditMode();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  if (!editMode) {
    return <Tag className={className}>{children ?? value}</Tag>;
  }

  const handleSave = async () => {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(draft);
      await writeAuditLog({
        user: cmsUser,
        action: "update",
        module: "homepage",
        field: "text",
        previous_value: value,
        new_value: draft,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <span className="relative inline-block w-full">
        {multiline ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={`${className} w-full bg-primary/5 border border-primary/40 rounded-lg px-2 py-1 outline-none resize-y min-h-[80px]`}
          />
        ) : (
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
            className={`${className} w-full bg-primary/5 border border-primary/40 rounded-lg px-2 py-1 outline-none`}
          />
        )}
        <span className="absolute -bottom-8 right-0 flex items-center gap-1 z-50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            <Check size={10} /> {saving ? "Salvando…" : "Salvar"}
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[10px] text-white/60 hover:text-white"
          >
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
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      title="Clique para editar"
    >
      {children ?? value}
      {/* Highlight de edição */}
      <span className="absolute inset-0 rounded ring-2 ring-primary/0 group-hover:ring-primary/40 transition-all pointer-events-none" />
      <span className="absolute -top-1 -right-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white z-10">
        <Edit3 size={9} />
      </span>
      {showTooltip && meta && <EditTooltip meta={meta} />}
    </Tag>
  );
}

// ─── INLINE IMAGE ─────────────────────────────────────────────

interface InlineImageProps {
  src: string;
  alt: string;
  onSave: (newUrl: string) => Promise<void>;
  onRemove?: () => Promise<void>;
  className?: string;
  meta?: EditMetadata;
}

export function InlineImage({
  src,
  alt,
  onSave,
  onRemove,
  className = "",
  meta,
}: InlineImageProps) {
  const { editMode, cmsUser } = useEditMode();
  const [showMenu, setShowMenu] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!editMode) {
    return <img src={src} alt={alt} className={className} />;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cmsUser) return;
    setUploading(true);
    setShowMenu(false);
    try {
      const ext = file.name.split(".").pop();
      const path = `homepage/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;
      const publicUrl = storageUrl("media", path);
      await supabase.from("media").insert({
        filename: file.name, storage_path: path, public_url: publicUrl,
        category: "homepage", size_bytes: file.size, mime_type: file.type,
        uploaded_by: cmsUser.id,
      });
      await onSave(publicUrl);
      await writeAuditLog({ user: cmsUser, action: "update", module: "homepage", field: "image", previous_value: src, new_value: publicUrl });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSave = async () => {
    if (!urlDraft.trim() || !cmsUser) return;
    await onSave(urlDraft.trim());
    await writeAuditLog({ user: cmsUser, action: "update", module: "homepage", field: "image", previous_value: src, new_value: urlDraft });
    setShowUrlInput(false);
    setUrlDraft("");
  };

  return (
    <div className="relative group inline-block">
      <img
        src={src}
        alt={alt}
        className={`${className} ${uploading ? "opacity-50" : ""}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => { setShowTooltip(false); }}
      />

      {/* Overlay de edição */}
      <div
        className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all rounded cursor-pointer flex items-center justify-center"
        onClick={() => setShowMenu(!showMenu)}
      >
        <div className="hidden group-hover:flex items-center gap-1.5 bg-[#1a2118]/90 rounded-lg px-3 py-1.5 text-xs font-semibold text-white border border-primary/30">
          <Image size={12} className="text-primary" /> Editar imagem
        </div>
      </div>

      {/* Menu de opções */}
      {showMenu && (
        <div className="absolute top-2 right-2 z-50 bg-[#1a2118] border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
          <button
            onClick={() => { setShowMenu(false); fileRef.current?.click(); }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Upload size={12} /> Upload de arquivo
          </button>
          <button
            onClick={() => { setShowMenu(false); setShowUrlInput(true); }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Link2 size={12} /> Inserir URL
          </button>
          {onRemove && (
            <button
              onClick={async () => { setShowMenu(false); await onRemove(); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5"
            >
              <Trash2 size={12} /> Remover
            </button>
          )}
          <button
            onClick={() => setShowMenu(false)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-white/30 hover:text-white hover:bg-white/5 transition-colors border-t border-white/5"
          >
            <X size={12} /> Cancelar
          </button>
        </div>
      )}

      {/* Input de URL */}
      {showUrlInput && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-[#1a2118] border border-white/10 rounded-xl p-3 shadow-xl">
          <input
            autoFocus
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-primary/60"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleUrlSave}
              className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-white hover:opacity-90">
              Aplicar
            </button>
            <button onClick={() => setShowUrlInput(false)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 hover:text-white">
              <X size={11} />
            </button>
          </div>
        </div>
      )}

      {showTooltip && meta && <EditTooltip meta={meta} />}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
    </div>
  );
}
