/**
 * Ditames CMS — Edit Mode Toolbar
 *
 * Barra flutuante exibida no topo do site quando o modo edição está ativo.
 * Não altera nenhum componente visual existente do site.
 */

import { Link } from "@tanstack/react-router";
import { Edit3, X, LayoutDashboard, Save, Eye, Shield } from "lucide-react";
import { useEditMode } from "@/lib/edit-mode";
import { writeAuditLog } from "@/lib/admin";

export function EditModeToolbar() {
  const { editMode, setEditMode, cmsUser, isAuthenticated } = useEditMode();

  if (!isAuthenticated) return null;

  if (!editMode) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
        <button
          onClick={() => setEditMode(true)}
          className="flex items-center gap-2 rounded-full bg-[#1a2118] border border-primary/40 px-4 py-2.5 text-xs font-semibold text-primary shadow-lg hover:bg-primary hover:text-white transition-all"
          title="Ativar modo edição"
        >
          <Edit3 size={13} /> Modo Edição
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Barra superior */}
      <div className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-between px-4 py-2 bg-[#1a2118] border-b border-primary/30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Modo Edição
            </span>
          </div>
          {cmsUser && (
            <span className="text-xs text-white/40 hidden sm:block">
              {cmsUser.name}
              {cmsUser.role === "director" && <Shield size={10} className="inline ml-1 text-primary" />}
            </span>
          )}
          <span className="text-[10px] text-white/30 hidden md:block">
            Clique em qualquer texto ou imagem para editar · ESC para sair
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            onClick={() => setEditMode(false)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:border-white/30 transition-colors"
          >
            <LayoutDashboard size={12} /> Dashboard
          </Link>
          <button
            onClick={() => setEditMode(false)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:border-white/30 transition-colors"
          >
            <Eye size={12} /> Visualizar
          </button>
          <button
            onClick={() => setEditMode(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
            title="Fechar modo edição"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Spacer para não sobrepor o conteúdo */}
      <div className="h-10" />
    </>
  );
}
