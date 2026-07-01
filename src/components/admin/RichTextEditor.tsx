/**
 * Ditames CMS — RichTextEditor
 * Editor rich text baseado em Tiptap com toolbar completa,
 * suporte a imagens em qualquer posição, colagem limpa do Word/Google Docs,
 * e estilo consistente com o design system do projeto.
 */

import { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import { supabase, storageUrl } from "@/lib/supabase";
import type { MediaCategory } from "@/lib/database.types";

// ─── TIPOS ────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  folder?: MediaCategory;
  userId?: string | null;
  minHeight?: number;
  disabled?: boolean;
}

// ─── TOOLBAR BUTTON ───────────────────────────────────────────

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded text-sm transition-colors disabled:opacity-30 ${
        active
          ? "bg-primary/20 text-primary"
          : "text-white/50 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

// ─── TOOLBAR ──────────────────────────────────────────────────

function Toolbar({
  editor,
  folder,
  userId,
}: {
  editor: Editor;
  folder: MediaCategory;
  userId?: string | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        alert("Arquivo muito grande. O limite é 10 MB.");
        return;
      }

      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) {
        console.error("[RichTextEditor] erro no upload:", error);
        alert("Não foi possível enviar a imagem. Tente novamente.");
        return;
      }

      const url = storageUrl("media", path);

      // Registra na tabela media
      if (userId) {
        await supabase.from("media").insert({
          filename: file.name,
          storage_path: path,
          public_url: url,
          category: folder,
          size_bytes: file.size,
          mime_type: file.type,
          uploaded_by: userId,
        });
      }

      // Insere a imagem no ponto exato do cursor
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();

      if (fileRef.current) fileRef.current.value = "";
    },
    [editor, folder, userId]
  );

  const handleSetLink = () => {
    const url = window.prompt("URL do link:");
    if (!url) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .setLink({ href: url, target: "_blank" })
        .run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 px-3 py-2 bg-white/5">
      {/* Estilo do bloco */}
      <select
        value={
          editor.isActive("heading", { level: 2 })
            ? "h2"
            : editor.isActive("heading", { level: 3 })
            ? "h3"
            : "p"
        }
        onChange={(e) => {
          if (e.target.value === "p") editor.chain().focus().setParagraph().run();
          else if (e.target.value === "h2")
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          else if (e.target.value === "h3")
            editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        className="h-7 rounded border border-white/10 bg-white/5 px-2 text-xs text-white focus:outline-none focus:border-primary/60 mr-1"
      >
        <option value="p">Parágrafo</option>
        <option value="h2">Subtítulo</option>
        <option value="h3">Tópico</option>
      </select>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Formatação inline */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Negrito (Ctrl+B)"
      >
        <span className="font-bold text-xs">B</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Itálico (Ctrl+I)"
      >
        <span className="italic text-xs">I</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Sublinhado (Ctrl+U)"
      >
        <span className="underline text-xs">S</span>
      </ToolbarButton>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Listas */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Lista com marcadores"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="2" cy="4" r="1.5" fill="currentColor"/>
          <rect x="5" y="3" width="8" height="2" rx="1" fill="currentColor"/>
          <circle cx="2" cy="8" r="1.5" fill="currentColor"/>
          <rect x="5" y="7" width="8" height="2" rx="1" fill="currentColor"/>
          <circle cx="2" cy="12" r="1.5" fill="currentColor"/>
          <rect x="5" y="11" width="8" height="2" rx="1" fill="currentColor"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Lista numerada"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <text x="1" y="5" fontSize="5" fill="currentColor">1.</text>
          <rect x="5" y="3" width="8" height="2" rx="1" fill="currentColor"/>
          <text x="1" y="9" fontSize="5" fill="currentColor">2.</text>
          <rect x="5" y="7" width="8" height="2" rx="1" fill="currentColor"/>
          <text x="1" y="13" fontSize="5" fill="currentColor">3.</text>
          <rect x="5" y="11" width="8" height="2" rx="1" fill="currentColor"/>
        </svg>
      </ToolbarButton>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Bloco de destaque */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Bloco de destaque"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="2.5" height="10" rx="1" fill="currentColor"/>
          <rect x="5" y="4" width="8" height="2" rx="1" fill="currentColor" opacity=".7"/>
          <rect x="5" y="8" width="6" height="2" rx="1" fill="currentColor" opacity=".7"/>
        </svg>
      </ToolbarButton>

      {/* Divisor horizontal */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Divisor de seção"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="6" width="12" height="2" rx="1" fill="currentColor"/>
        </svg>
      </ToolbarButton>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Link */}
      <ToolbarButton
        onClick={handleSetLink}
        active={editor.isActive("link")}
        title="Inserir link"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5.5 8.5L8.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M3.5 6.5L2 8a2.5 2.5 0 003.5 3.5l1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M6.5 3.5L8 2a2.5 2.5 0 013.5 3.5L10 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </ToolbarButton>

      {/* Imagem */}
      <ToolbarButton
        onClick={() => fileRef.current?.click()}
        title="Inserir imagem"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <circle cx="4.5" cy="5" r="1.2" fill="currentColor"/>
          <path d="M1 9.5l3-3 2.5 2.5 2-2 3.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </ToolbarButton>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Desfazer / Refazer */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Desfazer (Ctrl+Z)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 6.5C2 4 4 2 7 2c2.5 0 4.5 1.5 5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M2 3v3.5h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Refazer (Ctrl+Y)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M12 6.5C12 4 10 2 7 2c-2.5 0-4.5 1.5-5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M12 3v3.5H8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </ToolbarButton>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escreva o conteúdo aqui…",
  folder = "blog",
  userId,
  minHeight = 320,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Desabilita code e codeBlock que não são necessários aqui
        code: false,
        codeBlock: false,
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rich-text-image",
        },
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "rich-text-link",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Typography,
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Normaliza: se só tiver <p></p> vazio, retorna string vazia
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: "rich-text-editor-content focus:outline-none",
        spellcheck: "true",
      },
    },
  });

  // Sincroniza valor externo sem re-renderizar se o conteúdo for o mesmo
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const normalized = current === "<p></p>" ? "" : current;
    if (normalized !== (value || "")) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  const wordCount = editor?.storage.characterCount.words() ?? 0;

  return (
    <div className={`rounded-lg border border-white/10 bg-white/5 overflow-hidden transition-colors focus-within:border-primary/60 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Estilos do conteúdo do editor */}
      <style>{`
        .rich-text-editor-content {
          padding: 16px;
          min-height: ${minHeight}px;
          color: rgba(255,255,255,0.85);
          font-size: 14px;
          line-height: 1.75;
          font-family: 'Montserrat', system-ui, sans-serif;
        }
        .rich-text-editor-content h2 {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 20px 0 8px;
          line-height: 1.3;
        }
        .rich-text-editor-content h3 {
          font-size: 15px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin: 16px 0 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .rich-text-editor-content p {
          margin-bottom: 10px;
        }
        .rich-text-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: rgba(255,255,255,0.2);
          float: left;
          pointer-events: none;
          height: 0;
        }
        .rich-text-editor-content strong { color: #ffffff; }
        .rich-text-editor-content em { color: rgba(255,255,255,0.75); }
        .rich-text-editor-content ul {
          list-style: disc;
          padding-left: 20px;
          margin-bottom: 10px;
        }
        .rich-text-editor-content ol {
          list-style: decimal;
          padding-left: 20px;
          margin-bottom: 10px;
        }
        .rich-text-editor-content li {
          margin-bottom: 4px;
        }
        .rich-text-editor-content blockquote {
          border-left: 3px solid oklch(0.58 0.14 138);
          padding: 8px 14px;
          margin: 12px 0;
          background: oklch(0.58 0.14 138 / 0.08);
          border-radius: 0 6px 6px 0;
          color: rgba(255,255,255,0.7);
          font-style: italic;
        }
        .rich-text-editor-content hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.1);
          margin: 20px 0;
        }
        .rich-text-image {
          max-width: 100%;
          border-radius: 8px;
          margin: 16px 0;
          display: block;
        }
        .rich-text-link {
          color: oklch(0.58 0.14 138);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .rich-text-link:hover {
          opacity: 0.8;
        }
        .ProseMirror-selectednode {
          outline: 2px solid oklch(0.58 0.14 138);
          outline-offset: 2px;
          border-radius: 4px;
        }
      `}</style>

      {editor && (
        <Toolbar editor={editor} folder={folder} userId={userId} />
      )}

      <EditorContent editor={editor} />

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/5 bg-white/5">
        <span className="text-[11px] text-white/25">
          {wordCount} {wordCount === 1 ? "palavra" : "palavras"}
        </span>
        <span className="text-[11px] text-white/25">
          Ctrl+B negrito · Ctrl+I itálico · Ctrl+Z desfazer
        </span>
      </div>
    </div>
  );
}
