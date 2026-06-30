/**
 * Ditames CMS — Edit Mode Context + Content Store
 *
 * Sistema global de edição inline.
 * - useEditable(key, defaultValue) — hook universal para qualquer texto
 * - EditModeProvider — contexto com cache de conteúdo do banco
 * - onAuthStateChange — detecta sessão em tempo real
 */

import {
  createContext, useContext, useEffect, useState,
  useCallback, useRef, type ReactNode,
} from "react";
import { supabase } from "./supabase";
import { getCmsUser, writeAuditLog } from "./admin";
import type { CmsUserRow } from "./database.types";

// ─── TIPOS ────────────────────────────────────────────────────

interface EditModeContextValue {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  cmsUser: CmsUserRow | null;
  isAuthenticated: boolean;
  // Cache de conteúdo: chave → valor atual (do banco ou do código)
  content: Record<string, string>;
  // Salva um valor no banco e atualiza o cache local
  saveContent: (key: string, value: string, module?: string) => Promise<void>;
}

const EditModeContext = createContext<EditModeContextValue>({
  editMode: false,
  setEditMode: () => {},
  cmsUser: null,
  isAuthenticated: false,
  content: {},
  saveContent: async () => {},
});

// ─── PROVIDER ─────────────────────────────────────────────────

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const [cmsUser, setCmsUser] = useState<CmsUserRow | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [content, setContent] = useState<Record<string, string>>({});
  const cmsUserRef = useRef<CmsUserRow | null>(null);

  // Mantém ref sincronizado para usar dentro de callbacks
  useEffect(() => { cmsUserRef.current = cmsUser; }, [cmsUser]);

  // Carrega todo o conteúdo editável do banco uma vez
  const loadContent = useCallback(async () => {
    const { data } = await supabase.from("homepage_content").select("key, value");
    if (data?.length) {
      setContent(Object.fromEntries(data.map((r) => [r.key, r.value])));
    }
  }, []);

  // Salva no banco e atualiza cache local
  const saveContent = useCallback(async (key: string, value: string, module = "homepage") => {
    const { error } = await supabase
      .from("homepage_content")
      .upsert({ key, value, type: "text" }, { onConflict: "key" });

    if (error) throw error;

    setContent((prev) => ({ ...prev, [key]: value }));

    await writeAuditLog({
      user: cmsUserRef.current,
      action: "update",
      module,
      field: key,
      new_value: value,
    });
  }, []);

  useEffect(() => {
    // Verifica sessão atual
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setIsAuthenticated(true);
      const user = await getCmsUser(session.user.id);
      setCmsUser(user);
      await loadContent();

      // Ativa modo edição se ?edit=true
      const params = new URLSearchParams(window.location.search);
      if (params.get("edit") === "true") {
        setEditMode(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("edit");
        window.history.replaceState({}, "", url.toString());
      }
    });

    // Escuta mudanças de sessão em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setIsAuthenticated(true);
          const user = await getCmsUser(session.user.id);
          setCmsUser(user);
          await loadContent();
        } else {
          setIsAuthenticated(false);
          setCmsUser(null);
          setEditMode(false);
          setContent({});
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadContent]);

  // ESC fecha modo edição
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editMode) setEditMode(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editMode]);

  return (
    <EditModeContext.Provider value={{
      editMode, setEditMode, cmsUser, isAuthenticated, content, saveContent,
    }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}

// ─── HOOK UNIVERSAL ───────────────────────────────────────────
/**
 * useEditable(key, defaultValue, module?)
 *
 * Retorna o valor atual (do banco se disponível, senão o defaultValue)
 * e uma função save(newValue) que persiste no Supabase.
 *
 * Uso:
 *   const [title, saveTitle] = useEditable("hero_title", "Texto padrão");
 */
export function useEditable(key: string, defaultValue: string, module?: string) {
  const { content, saveContent } = useEditMode();
  const value = content[key] ?? defaultValue;
  const save = useCallback(
    (newValue: string) => saveContent(key, newValue, module),
    [key, module, saveContent]
  );
  return [value, save] as const;
}
