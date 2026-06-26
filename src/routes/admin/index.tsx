import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  FileText, Newspaper, Layers, HelpCircle, Users, ArrowRight,
  Instagram, TrendingUp, Link2, Edit3, BarChart3, Globe, PenSquare,
} from "lucide-react";
import { getCurrentCmsUser, getAuditLogs, ACTION_LABELS, MODULE_LABELS } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import type { CmsUserRow, AuditLogRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Counts = {
  news_published: number;
  news_draft: number;
  news_instagram: number;
  news_link: number;
  news_manual: number;
  blog: number;
  cases: number;
  faq: number;
  users: number;
  edits_today: number;
};

function AdminDashboard() {
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [counts, setCounts] = useState<Counts>({
    news_published: 0, news_draft: 0, news_instagram: 0,
    news_link: 0, news_manual: 0, blog: 0, cases: 0,
    faq: 0, users: 0, edits_today: 0,
  });
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

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        newsPublished, newsDraft, newsInsta, newsManual,
        blog, cases, faq, users, editsToday,
      ] = await Promise.all([
        supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("news").select("id", { count: "exact", head: true }).eq("source", "instagram"),
        supabase.from("news").select("id", { count: "exact", head: true }).eq("source", "manual"),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("cases").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("faq").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("cms_users").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("audit_logs").select("id", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
      ]);

      setCounts({
        news_published: newsPublished.count ?? 0,
        news_draft: newsDraft.count ?? 0,
        news_instagram: newsInsta.count ?? 0,
        news_manual: newsManual.count ?? 0,
        news_link: 0,
        blog: blog.count ?? 0,
        cases: cases.count ?? 0,
        faq: faq.count ?? 0,
        users: users.count ?? 0,
        edits_today: editsToday.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const mainStats = [
    { label: "Notícias publicadas", value: counts.news_published, icon: Newspaper,  to: "/admin/news",      color: "text-green-400",  bg: "bg-green-500/10" },
    { label: "Rascunhos",           value: counts.news_draft,     icon: PenSquare,   to: "/admin/news",      color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Artigos blog",        value: counts.blog,           icon: FileText,    to: "/admin/blog",      color: "text-blue-400",   bg: "bg-blue-500/10" },
    { label: "Cases ativos",        value: counts.cases,          icon: Layers,      to: "/admin/cases",     color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "FAQ",                 value: counts.faq,            icon: HelpCircle,  to: "/admin/faq",       color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Usuários ativos",     value: counts.users,          icon: Users,       to: "/admin/users",     color: "text-primary",    bg: "bg-primary/10" },
  ];

  const totalNews = counts.news_published + counts.news_draft;
  const pctInstagram = totalNews > 0 ? Math.round((counts.news_instagram / totalNews) * 100) : 0;
  const pctManual    = totalNews > 0 ? Math.round((counts.news_manual    / totalNews) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Olá{user ? `, ${user.name.split(" ")[0]}` : ""}! 👋
          </h1>
          <p className="text-sm text-white/40 mt-1">Painel de controle — Ditames Ambiental</p>
        </div>
        <a
          href="/?edit=true"
          className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          <Edit3 size={15} /> Navegar no site
        </a>
      </div>

      {/* Stats principais */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 mb-6">
        {mainStats.map((s) => (
          <Link key={s.label} to={s.to}
            className="group rounded-xl border border-white/5 bg-white/5 p-5 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon size={18} className={s.color} />
              </div>
              <ArrowRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
            <div className={`mt-3 text-3xl font-bold ${loading ? "text-white/20" : "text-white"}`}>
              {loading ? "—" : s.value}
            </div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Métricas de origem + edições hoje */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {/* Origem das notícias */}
        <div className="sm:col-span-2 rounded-xl border border-white/5 bg-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={15} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">
              Notícias por origem
            </span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Manual",    value: counts.news_manual,    icon: PenSquare, color: "bg-primary",   pct: pctManual },
              { label: "Instagram", value: counts.news_instagram, icon: Instagram, color: "bg-pink-500",  pct: pctInstagram },
            ].map((o) => (
              <div key={o.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <o.icon size={12} className="text-white/40" />
                    <span className="text-xs text-white/60">{o.label}</span>
                  </div>
                  <span className="text-xs text-white/40">{loading ? "—" : `${o.value} (${o.pct}%)`}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${o.color} transition-all`}
                    style={{ width: loading ? "0%" : `${o.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edições hoje */}
        <div className="rounded-xl border border-white/5 bg-white/5 p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={15} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">
              Hoje
            </span>
          </div>
          <div className={`text-4xl font-bold ${loading ? "text-white/20" : "text-white"}`}>
            {loading ? "—" : counts.edits_today}
          </div>
          <div className="text-xs text-white/40">ações registradas</div>
          <Link to="/admin/audit"
            className="mt-4 text-xs text-primary hover:underline flex items-center gap-1">
            Ver audit log <ArrowRight size={10} />
          </Link>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Nova notícia",   to: "/admin/news/new",   icon: Newspaper },
          { label: "Novo artigo",    to: "/admin/blog/new",   icon: FileText },
          { label: "Importar link",  to: "/admin/import",     icon: Link2 },
          { label: "Sync Instagram", to: "/admin/instagram",  icon: Instagram },
        ].map((a) => (
          <Link key={a.label} to={a.to}
            className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
            <a.icon size={16} /> {a.label}
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
                      <span className="text-xs text-white/30 ml-1">· {log.field}</span>
                    )}
                  </div>
                  <div className="shrink-0 text-xs text-white/30">
                    {new Date(log.created_at).toLocaleString("pt-BR", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
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
