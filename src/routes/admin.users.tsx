import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserPlus, Shield, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Trash2, Loader2 } from "lucide-react";
import {
  getCurrentCmsUser, listCmsUsers, createCmsUser,
  updateCmsUser, deleteCmsUser, hasPermission,
  PERMISSION_LABELS, PERMISSION_GROUPS, writeAuditLog,
} from "@/lib/admin";
import { useToast, useErrorModal, Alert, friendlyError } from "@/components/admin/Toast";
import type { CmsUserRow, CmsPermissions, CmsRole } from "@/lib/database.types";
import { DEFAULT_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS, ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/database.types";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [currentUser, setCurrentUser] = useState<CmsUserRow | null>(null);
  const [users, setUsers] = useState<CmsUserRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast, ToastContainer } = useToast();
  const { showError, ErrorModalContainer } = useErrorModal();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<CmsRole>("editor");
  const [permissions, setPermissions] = useState<CmsPermissions>({ ...DEFAULT_PERMISSIONS });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleRoleChange = (role: CmsRole) => {
    setSelectedRole(role);
    setPermissions({ ...DEFAULT_PERMISSIONS, ...ROLE_DEFAULT_PERMISSIONS[role] });
  };

  async function load() {
    try {
      const u = await getCurrentCmsUser();
      setCurrentUser(u);
      const list = await listCmsUsers();
      setUsers(list);
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, load);
    } finally {
      setLoading(false);
    }
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

    if (!canCreate) {
      setFormError("Você não possui permissão para criar usuários.");
      return;
    }
    if (password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setFormError(null);
    setFormLoading(true);
    try {
      const newUser = await createCmsUser(email, password, name, permissions, selectedRole);
      await writeAuditLog({
        user: currentUser,
        action: "create",
        module: "users",
        record_id: newUser.id,
        new_value: { name, email, role: selectedRole, permissions },
      });
      toast.success("Usuário criado com sucesso!", `${name} já pode acessar o painel.`);
      setShowForm(false);
      setName(""); setEmail(""); setPassword("");
      setSelectedRole("editor");
      setPermissions({ ...DEFAULT_PERMISSIONS });
      load();
    } catch (e) {
      const { message } = friendlyError(e);
      setFormError(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (user: CmsUserRow) => {
    if (!currentUser) return;
    if (!canEdit) {
      showError("Sem permissão", "Você não possui permissão para alterar o status de usuários.");
      return;
    }
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      await updateCmsUser(user.id, { status: newStatus });
      await writeAuditLog({
        user: currentUser, action: "update", module: "users",
        record_id: user.id, field: "status",
        previous_value: user.status, new_value: newStatus,
      });
      toast.success(newStatus === "active" ? "Usuário ativado." : "Usuário desativado.");
      load();
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message);
    }
  };

  const handleUpdatePerms = async (target: CmsUserRow, newPerms: CmsPermissions) => {
    if (!currentUser) return;
    if (!canManagePerms) {
      showError("Sem permissão", "Você não possui permissão para alterar permissões de usuários.");
      throw new Error("forbidden");
    }
    if (target.id === currentUser.id) {
      showError("Ação não permitida", "Você não pode alterar suas próprias permissões.");
      throw new Error("self-edit-forbidden");
    }
    try {
      await updateCmsUser(target.id, { permissions: newPerms });
      await writeAuditLog({
        user: currentUser, action: "update", module: "users",
        record_id: target.id, field: "permissions", new_value: newPerms,
      });
      toast.success("Permissões atualizadas!");
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message);
      throw e;
    }
  };

  const handleDelete = async (user: CmsUserRow) => {
    if (!currentUser) return;
    if (!canRemove) {
      showError("Sem permissão", "Você não possui permissão para remover usuários.");
      return;
    }
    if (user.id === currentUser.id) {
      showError("Ação não permitida", "Você não pode remover seu próprio usuário.");
      return;
    }
    if (user.role === "director") {
      showError("Ação não permitida", "Não é possível remover um usuário Diretor por aqui.");
      return;
    }
    if (!confirm(`Remover o acesso de "${user.name}" ao painel? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteCmsUser(user.id);
      await writeAuditLog({
        user: currentUser, action: "delete", module: "users",
        record_id: user.id, previous_value: { name: user.name, email: user.email },
      });
      toast.success("Usuário removido do CMS.", "O acesso ao painel foi revogado.");
      load();
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <ToastContainer />
      <ErrorModalContainer />

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

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Criar usuário</h2>

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
                placeholder="•••••••• (mín. 6 caracteres)" minLength={6} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Perfil</label>
              <select value={selectedRole} onChange={(e) => handleRoleChange(e.target.value as CmsRole)}
                className="w-full rounded-lg border border-white/10 bg-[#1a2118] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60">
                {(["editor", "moderator", "analyst", "dev"] as CmsRole[]).map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              <p className="text-[10px] text-white/30 mt-1">{ROLE_DESCRIPTIONS[selectedRole]}</p>
            </div>
          </div>

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

          {formError && <Alert type="error" title={formError} onClose={() => setFormError(null)} />}

          <div className="flex gap-3">
            <button type="submit" disabled={formLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
              {formLoading && <Loader2 size={14} className="animate-spin" />}
              {formLoading ? "Criando…" : "Criar usuário"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

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
                      <div className="text-[10px] text-white/20 uppercase mt-0.5">{ROLE_LABELS[u.role]}</div>
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
                      {canManagePerms && !isMe && u.role !== "director" && (
                        <button onClick={() => setExpandedUser(expanded ? null : u.id)}
                          className="text-white/30 hover:text-white transition-colors" title="Permissões">
                          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}
                      {canRemove && !isMe && u.role !== "director" && (
                        <button onClick={() => handleDelete(u)}
                          className="text-white/30 hover:text-red-400 transition-colors" title="Remover usuário">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

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

function PermissionsEditor({ user, onSave }: { user: CmsUserRow; onSave: (p: CmsPermissions) => Promise<void> }) {
  const [perms, setPerms] = useState<CmsPermissions>({ ...DEFAULT_PERMISSIONS, ...user.permissions });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof CmsPermissions) => setPerms((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(perms);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // erro já tratado e exibido pelo onSave (showError)
    } finally {
      setSaving(false);
    }
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
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
          {saving && <Loader2 size={13} className="animate-spin" />}
          {saving ? "Salvando…" : "Salvar permissões"}
        </button>
        {saved && <span className="text-sm text-green-400">Salvo!</span>}
      </div>
    </div>
  );
}
