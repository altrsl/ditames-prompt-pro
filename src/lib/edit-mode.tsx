/**
 * Ditames CMS — Edit Mode Context
 *
 * Correções:
 * 1. Usa onAuthStateChange para detectar sessão em tempo real
 * 2. Lê ?edit=true na URL para ativar o modo edição automaticamente
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";
import { getCmsUser } from "./admin";
import type { CmsUserRow } from "./database.types";

interface EditModeContextValue {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  cmsUser: CmsUserRow | null;
  isAuthenticated: boolean;
}

const EditModeContext = createContext<EditModeContextValue>({
  editMode: false,
  setEditMode: () => {},
  cmsUser: null,
  isAuthenticated: false,
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const [cmsUser, setCmsUser] = useState<CmsUserRow | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 1. Verifica sessão atual imediatamente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setIsAuthenticated(true);
      const user = await getCmsUser(session.user.id);
      setCmsUser(user);

      // 2. Ativa modo edição automaticamente se ?edit=true na URL
      const params = new URLSearchParams(window.location.search);
      if (params.get("edit") === "true") {
        setEditMode(true);
        // Remove o parâmetro da URL sem recarregar a página
        const url = new URL(window.location.href);
        url.searchParams.delete("edit");
        window.history.replaceState({}, "", url.toString());
      }
    });

    // 3. Escuta mudanças de sessão em tempo real (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setIsAuthenticated(true);
          const user = await getCmsUser(session.user.id);
          setCmsUser(user);
        } else {
          setIsAuthenticated(false);
          setCmsUser(null);
          setEditMode(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Desativa modo edição ao pressionar Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editMode) setEditMode(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editMode]);

  return (
    <EditModeContext.Provider value={{ editMode, setEditMode, cmsUser, isAuthenticated }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
