import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Newspaper, Layers, HelpCircle, Users, ArrowRight, Instagram, TrendingUp } from "lucide-react";
import { getCurrentCmsUser, getAuditLogs, ACTION_LABELS, MODULE_LABELS } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import type { CmsUserRow, AuditLogRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Counts = {
  news: number;
  blog: number;
  cases: number;
  faq: number;
  users: number;
  news_instagram: number;
};

function AdminDashboard() {
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [counts, setCounts] = useState<Counts>({ news: 0, blog: 0, cases: 0, faq: 0, users: 0, news_instagram: 0 });
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [u, auditLogs] = await Promise.all([
        getCurrentCmsUser(),
        getAuditLogs(undefined, undefined, 10),
      ]);
      setUser(u);
      setLogs(auditLogs);

      // Contagens
      const [news, blog, cases, faq, users, newsInsta] = await Promise.all([
        supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("cases").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("faq").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("cms_users").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("news").select("id", { count: "exact", head: true }).eq("source", "instagram"),
      ]);

      setCounts({
        news: news.count ?? 0,
        blog: blog.count ?? 0,
        cases: cases.count ?? 0,
        faq: faq.count ?? 0,
        users: users.count ?? 0,
        news_instagram: newsInsta.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const stats = [
    { label: "Notícias publicadas",  value: counts.news,      icon: Newspaper, to: "/admin/news",      color: "text-green-400" },
    { label: "Artigos no blog",      value: counts.blog,      icon: FileText,  to: "/admin/blog",      color: "text-blue-400" },
    { label: "Cases ativos",         value: counts.cases,     icon: Layers,    to: "/admin/cases",     color: "text-yellow-400" },
    { label: "Perguntas FAQ",        value: counts.faq,       icon: HelpCircle,to: "/admin/faq",       color: "text-purple-400" },
    { label: "Do Instagram",         value: counts.news_instagram, icon: Instagram, to: "/admin/instagram", color: "text-pink-400" },
    { label: "Usuários ativos",      value: counts.users,     icon: Users,     to: "/admin/users",     color: "text-primary" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Olá{user ? `, ${user.name.split(" ")[0]}` : ""}! 👋
        </h1>
        <p className="text-sm text-white/40 mt-1">Painel de controle — Ditames Ambiental</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group rounded-xl border border-white/5 bg-white/5 p-5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between">
              <s.icon size={20} className={s.color} />
              <ArrowRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
            <div className={`mt-3 text-3xl font-bold ${loading ? "text-white/20" : "text-white"}`}>
              {loading ? "—" : s.value}
            </div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Ações rápidas */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Nova notícia",   to: "/admin/news/new",       icon: Newspaper },
          { label: "Novo artigo",    to: "/admin/blog/new",       icon: FileText },
          { label: "Sync Instagram", to: "/admin/instagram",      icon: Instagram },
          { label: "Ver audit log",  to: "/admin/audit",          icon: TrendingUp },
        ].map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            <a.icon size={16} />
            {a.label}
          </Link>
        ))}
      </div>

      {/* Audit log recente */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Atividade recente
          </h2>
          <Link to="/admin/audit" className="text-xs text-primary hover:underline">
            Ver tudo
          </Link>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
          {logs.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-white/30">
              Nenhuma atividade registrada ainda.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase">
                    {(log.user_name ?? "?").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm text-white/80">
                      <span className="font-semibold text-white">{log.user_name ?? "Sistema"}</span>
                      {" "}{ACTION_LABELS[log.action] ?? log.action}{" "}
                      em {MODULE_LABELS[log.module] ?? log.module}
                    </span>
                    {log.field && (
                      <span className="text-xs text-white/30 ml-1">· campo: {log.field}</span>
                    )}
                  </div>
                  <div className="shrink-0 text-xs text-white/30">
                    {new Date(log.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
