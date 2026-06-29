/**
 * Ditames CMS — Auth + Permissions + Audit Log
 */

import { supabase } from "./supabase";
import type { CmsUserRow, CmsPermissions, AuditLogRow } from "./database.types";

// ─── AUTH ─────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getAuthUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ─── CMS USERS ───────────────────────────────────────────────

export async function getCmsUser(userId: string): Promise<CmsUserRow | null> {
  const { data, error } = await supabase
    .from("cms_users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as CmsUserRow;
}

export async function getCurrentCmsUser(): Promise<CmsUserRow | null> {
  const user = await getAuthUser();
  if (!user) return null;

  let cmsUser = await getCmsUser(user.id);

  // Se o usuário está autenticado mas não tem entrada em cms_users,
  // cria automaticamente como director (primeiro usuário = master)
  if (!cmsUser) {
    const { data } = await supabase
      .from("cms_users")
      .select("id")
      .limit(1);

    const isFirst = !data || data.length === 0;
    const role = isFirst ? "director" : "dev";

    const { data: created } = await supabase
      .from("cms_users")
      .insert({
        id: user.id,
        email: user.email ?? "",
        name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Usuário",
        role,
        status: "active",
        permissions: {},
      })
      .select()
      .single();

    cmsUser = created as CmsUserRow | null;
  }

  return cmsUser;
}

export async function listCmsUsers(): Promise<CmsUserRow[]> {
  const { data, error } = await supabase
    .from("cms_users")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CmsUserRow[];
}

export async function createCmsUser(
  email: string,
  password: string,
  name: string,
  permissions: CmsPermissions
): Promise<CmsUserRow> {
  // 1. Cria no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin
    ? // Se tiver service role use admin API; senão use signUp (funciona no client)
      { data: null, error: new Error("use-signup") }
    : { data: null, error: new Error("use-signup") };

  // Fallback: invite via signUp (o usuário receberá email de confirmação)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (signUpError) throw signUpError;
  if (!signUpData.user) throw new Error("Erro ao criar usuário");

  // 2. Insere na tabela cms_users
  const { data, error } = await supabase
    .from("cms_users")
    .insert({
      id: signUpData.user.id,
      email,
      name,
      role: "dev",
      permissions,
      status: "active",
    })
    .select()
    .single();
  if (error) throw error;
  return data as CmsUserRow;
}

export async function updateCmsUser(
  userId: string,
  updates: Partial<Pick<CmsUserRow, "name" | "status" | "permissions">>
): Promise<CmsUserRow> {
  const { data, error } = await supabase
    .from("cms_users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as CmsUserRow;
}

export async function deactivateCmsUser(userId: string) {
  return updateCmsUser(userId, { status: "inactive" });
}

// ─── PERMISSÕES ──────────────────────────────────────────────

export function hasPermission(
  user: CmsUserRow | null,
  permission: keyof CmsPermissions
): boolean {
  if (!user) return false;
  if (user.role === "director") return true;
  return !!user.permissions?.[permission];
}

export function isDirector(user: CmsUserRow | null): boolean {
  return user?.role === "director";
}

// ─── AUDIT LOG ───────────────────────────────────────────────

export async function writeAuditLog(entry: {
  user: CmsUserRow | null;
  action: string;
  module: string;
  record_id?: string;
  field?: string;
  previous_value?: unknown;
  new_value?: unknown;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabase.from("audit_logs").insert({
      user_id: entry.user?.id ?? null,
      user_name: entry.user?.name ?? "Sistema",
      action: entry.action,
      module: entry.module,
      record_id: entry.record_id ?? null,
      field: entry.field ?? null,
      previous_value: entry.previous_value != null
        ? JSON.stringify(entry.previous_value)
        : null,
      new_value: entry.new_value != null
        ? JSON.stringify(entry.new_value)
        : null,
      metadata: entry.metadata ?? {},
    });
  } catch (e) {
    // Audit log nunca deve quebrar a operação principal
    console.error("[audit]", e);
  }
}

export async function getAuditLogs(
  module?: string,
  recordId?: string,
  limit = 50
): Promise<AuditLogRow[]> {
  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (module) query = query.eq("module", module);
  if (recordId) query = query.eq("record_id", recordId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AuditLogRow[];
}

// ─── LABELS LEGÍVEIS ─────────────────────────────────────────

export const PERMISSION_LABELS: Record<keyof CmsPermissions, string> = {
  edit_homepage: "Editar homepage",
  edit_homepage_images: "Editar imagens da homepage",
  edit_cases: "Editar cases",
  create_edit_news: "Criar/editar notícias",
  create_edit_blog: "Criar/editar blog",
  create_edit_services: "Criar/editar serviços",
  edit_seo: "Editar SEO",
  create_users: "Criar usuários",
  edit_users: "Editar usuários",
  remove_users: "Remover usuários",
  manage_permissions: "Gerenciar permissões",
  view_audit_log: "Visualizar audit log",
  publish_archive_content: "Publicar/arquivar conteúdo",
};

export const PERMISSION_GROUPS = [
  {
    label: "CMS — Conteúdo",
    keys: [
      "edit_homepage",
      "edit_homepage_images",
      "edit_cases",
      "create_edit_news",
      "create_edit_blog",
      "create_edit_services",
      "edit_seo",
    ] as (keyof CmsPermissions)[],
  },
  {
    label: "Sistema",
    keys: [
      "create_users",
      "edit_users",
      "remove_users",
      "manage_permissions",
      "view_audit_log",
      "publish_archive_content",
    ] as (keyof CmsPermissions)[],
  },
];

export const ACTION_LABELS: Record<string, string> = {
  create: "Criou",
  update: "Editou",
  delete: "Removeu",
  publish: "Publicou",
  archive: "Arquivou",
  login: "Entrou no sistema",
};

export const MODULE_LABELS: Record<string, string> = {
  news: "Notícias",
  blog: "Blog",
  cases: "Cases",
  faq: "FAQ",
  services: "Serviços",
  users: "Usuários",
  homepage: "Homepage",
};
