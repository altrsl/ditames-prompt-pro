import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, FileText, Newspaper, Users,
  LogOut, ChevronRight, Menu, X, Shield, History,
  Leaf, Instagram, Link2, Edit3,
} from "lucide-react";
import { getCurrentCmsUser, signOut, hasPermission } from "@/lib/admin";
import type { CmsUserRow } from "@/lib/database.types";
import { getSession } from "@/lib/admin";
import { useErrorModal, friendlyError } from "@/components/admin/Toast";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login") return;
    const session = await getSession();
    if (!session) throw redirect({ to: "/admin/login" });
  },
  component: AdminLayout,
});

const NAV_ITEMS = [
  { label: "Dashboard",      to: "/admin",             icon: LayoutDashboard, permission: null },
  { label: "Notícias",       to: "/admin/news",        icon: Newspaper,       permission: "create_edit_news" as const },
  { label: "Blog",           to: "/admin/blog",        icon: FileText,        permission: "create_edit_blog" as const },
  { label: "Importar link",  to: "/admin/import",      icon: Link2,           permission: "create_edit_news" as const },
  { label: "Cases",          to: "/admin/cases",       icon: Leaf,            permission: "edit_cases" as const },
  { label: "Instagram",      to: "/admin/instagram",   icon: Instagram,       permission: "create_edit_news" as const },
  { label: "Usuários",       to: "/admin/users",       icon: Users,           permission: "create_users" as const },
  { label: "Audit Log",      to: "/admin/audit",       icon: History,         permission: "view_audit_log" as const },
];

function AdminLayout() {
  const router = useRouter();
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showError, ErrorModalContainer } = useErrorModal();

  useEffect(() => {
    getCurrentCmsUser()
      .then(setUser)
      .catch((e) => {
        const { title, message } = friendlyError(e);
        showError(title, message);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.navigate({ to: "/admin/login" });
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, handleLogout);
    }
  };

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(user, item.permission)
  );

  return (
    <div className="min-h-screen bg-[#0f1410] flex">
      <ErrorModalContainer />
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a2118] border-r border-white/5 flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Leaf size={16} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-white">Ditames</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">CMS Admin</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-white/40 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {visibleNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors group"
              activeProps={{ className: "!text-white !bg-primary/20 !border-l-2 !border-primary" }}
            >
              <item.icon size={16} className="shrink-0" />
              <span>{item.label}</span>
              <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/5">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 mb-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/30 text-primary text-xs font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                <div className="flex items-center gap-1">
                  {user.role === "director" && <Shield size={9} className="text-primary" />}
                  <span className="text-[10px] text-white/40 capitalize">{user.role}</span>
                </div>
              </div>
            </div>
          )}
          <a
            href="/?edit=true"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors mb-1"
          >
            <Edit3 size={15} />
            <span>Navegar no site</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={15} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#1a2118]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/60 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-white">Ditames CMS</span>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
