import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserPlus, Shield, User, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from "lucide-react";
import {
  getCurrentCmsUser, listCmsUsers, createCmsUser,
  updateCmsUser, deactivateCmsUser, hasPermission,
  isDirector, PERMISSION_LABELS, PERMISSION_GROUPS, writeAuditLog,
} from "@/lib/admin";
import type { CmsUserRow, CmsPermissions } from "@/lib/database.types";
import { DEFAULT_PERMISSIONS } from "@/lib/database.types";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [currentUser, setCurrentUser] = useState<CmsUserRow | null>(null);
  const [users, setUsers] = useState<CmsUserRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<CmsPermissions>({ ...DEFAULT_PERMISSIONS });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  async function load() {
    const u = await getCurrentCmsUser();
    setCurrentUser(u);
    const list = await listCmsUsers();
    setUsers(list);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const canCreate = hasPermission(currentUser, "create_users");
  const canEdit = hasPermission(currentUser, "edit_users");
  const canRemove = hasPermission(currentUser, "remove_users");
  const canManagePerms = hasPermission(currentUser, "manage_permissions");

  const handleTogglePerm = (key: keyof CmsPermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError(null);
    setFormLoading(true);
    try {
      const newUser = await createCmsUser(email, password, name, permissions);
      await writeAuditLog({
        user: currentUser,
        action: "create",
        module: "users",
        record_id: newUser.id,
        new_value: { name, email, permissions },
      });
      setShowForm(false);
      setName(""); setEmail(""); setPassword("");
      setPermissions({ ...DEFAULT_PERMISSIONS });
      load();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (user: CmsUserRow) => {
    if (!currentUser || !canEdit) return;
    const newStatus = user.status === "active" ? "inactive" : "active";
    await updateCmsUser(user.id, { status: newStatus });
    await writeAuditLog({
      user: currentUser,
      action: "update",
      module: "users",
      record_id: user.id,
      field: "status",
      previous_value: user.status,
      new_value: newStatus,
    });
    load();
  };

  const handleUpdatePerms = async (target: CmsUserRow, newPerms: CmsPermissions) => {
    if (!currentUser || !canManagePerms) return;
    await updateCmsUser(target.id, { permissions: newPerms });
    await writeAuditLog({
      user: currentUser,
      action: "update",
      module: "users",
      record_id: target.id,
      field: "permissions",
      new_value: newPerms,
    });
    load();
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Usuários</h1>
          <p className="text-sm text-white/40 mt-0.5">Gerencie acessos ao painel CMS</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <UserPlus size={16} /> Novo usuário
          </button>
        )}
      </div>

      {/* Form novo usuário */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Criar usuário Dev</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Nome</label>
              <input required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60"
                placeholder="Nome completo" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">E-mail</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60"
                placeholder="email@ditames.com.br" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Senha inicial</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60"
                placeholder="••••••••" minLength={6} />
            </div>
          </div>

          {/* Permissões */}
          <div className="space-y-4">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">{group.label}</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.keys.map((key) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => handleTogglePerm(key)}
                        className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${permissions[key] ? "bg-primary" : "bg-white/10"}`}
                      >
                        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${permissions[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                      </div>
                      <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                        {PERMISSION_LABELS[key]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {formError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{formError}</div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={formLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
              {formLoading ? "Criando…" : "Criar usuário"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de usuários */}
      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Carregando…</div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {users.map((u) => {
              const isMe = u.id === currentUser?.id;
              const expanded = expandedUser === u.id;
              return (
                <div key={u.id}>
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase ${
                      u.role === "director" ? "bg-primary/30 text-primary" : "bg-white/10 text-white/60"
                    }`}>
                      {u.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{u.name}</span>
                        {u.role === "director" && <Shield size={12} className="text-primary" />}
                        {isMe && <span className="text-[10px] text-white/30">(você)</span>}
                      </div>
                      <div className="text-xs text-white/40">{u.email}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        u.status === "active" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/30"
                      }`}>
                        {u.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                      {canEdit && !isMe && u.role !== "director" && (
                        <button onClick={() => handleToggleStatus(u)}
                          className="text-white/30 hover:text-white transition-colors" title="Alternar status">
                          {u.status === "active" ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
                        </button>
                      )}
                      {canManagePerms && u.role !== "director" && (
                        <button onClick={() => setExpandedUser(expanded ? null : u.id)}
                          className="text-white/30 hover:text-white transition-colors" title="Permissões">
                          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Permissões expandidas */}
                  {expanded && u.role !== "director" && (
                    <PermissionsEditor
                      user={u}
                      onSave={(perms) => handleUpdatePerms(u, perms)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PermissionsEditor({ user, onSave }: { user: CmsUserRow; onSave: (p: CmsPermissions) => void }) {
  const [perms, setPerms] = useState<CmsPermissions>({ ...DEFAULT_PERMISSIONS, ...user.permissions });
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof CmsPermissions) => setPerms((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    onSave(perms);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="border-t border-white/5 bg-white/5 px-5 py-5">
      <div className="space-y-4">
        {PERMISSION_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">{group.label}</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.keys.map((key) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div onClick={() => toggle(key)}
                    className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${perms[key] ? "bg-primary" : "bg-white/10"}`}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${perms[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                    {PERMISSION_LABELS[key]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={handleSave}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
          Salvar permissões
        </button>
        {saved && <span className="text-sm text-green-400">Salvo!</span>}
      </div>
    </div>
  );
}
