/**
 * Ditames CMS — Edit Mode Context
 *
 * Controla o estado global do modo de edição inline.
 * Quando ativo, componentes do site exibem controles de edição.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentCmsUser, getSession } from "./admin";
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
    async function check() {
      const session = await getSession();
      if (!session) return;
      setIsAuthenticated(true);
      const user = await getCurrentCmsUser();
      setCmsUser(user);
    }
    check();
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
