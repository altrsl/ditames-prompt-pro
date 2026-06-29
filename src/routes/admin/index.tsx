import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  FileText, Newspaper, Layers, HelpCircle, Users, ArrowRight,
  Instagram, TrendingUp, Link2, Edit3, BarChart3, PenSquare,
  ChevronDown, ChevronUp, Calendar, Clock, CheckCircle2,
  AlertCircle, Eye, Archive, Globe,
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
  news_archived: number;
  news_instagram: number;
  news_manual: number;
  blog_published: number;
  blog_draft: number;
  cases: number;
  faq: number;
  users: number;
  edits_today: number;
  edits_week: number;
  media_files: number;
};

function MetricSection({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={15} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-white/60">{title}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, to, loading }: {
  label: string; value: number; icon: React.ElementType;
  color: string; bg: string; to: string; loading: boolean;
}) {
  return (
    <Link to={to} className="group rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
          <Icon size={16} className={color} />
        </div>
        <ArrowRight size={12} className="text-white/20 group-hover:text-white/60 transition-colors mt-1" />
      </div>
      <div className={`mt-3 text-2xl font-bold ${loading ? "text-white/20" : "text-white"}`}>
        {loading ? "—" : value}
      </div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
    </Link>
  );
}

function AdminDashboard() {
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [counts, setCounts] = useState<Counts>({
    news_published: 0, news_draft: 0, news_archived: 0,
    news_instagram: 0, news_manual: 0,
    blog_published: 0, blog_draft: 0,
    cases: 0, faq: 0, users: 0,
    edits_today: 0, edits_week: 0, media_files: 0,
  });
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [u, auditLogs] = await Promise.all([
        getCurrentCmsUser(),
        getAuditLogs(undefined, undefined, 8),
      ]);
      setUser(u);
      setLogs(auditLogs);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

      const [
        newsP, newsD, newsA, newsI, newsM,
        blogP, blogD,
        cases, faq, users,
        edToday, edWeek, media,
      ] = await Promise.all([
        supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "archived"),
        supabase.from("news").select("id", { count: "exact", head: true }).eq("source", "instagram"),
        supabase.from("news").select("id", { count: "exact", head: true }).eq("source", "manual"),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("published", false),
        supabase.from("cases").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("faq").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("cms_users").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("audit_logs").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("audit_logs").select("id", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
        supabase.from("media").select("id", { count: "exact", head: true }),
      ]);

      setCounts({
        news_published: newsP.count ?? 0,
        news_draft: newsD.count ?? 0,
        news_archived: newsA.count ?? 0,
        news_instagram: newsI.count ?? 0,
        news_manual: newsM.count ?? 0,
        blog_published: blogP.count ?? 0,
        blog_draft: blogD.count ?? 0,
        cases: cases.count ?? 0,
        faq: faq.count ?? 0,
        users: users.count ?? 0,
        edits_today: edToday.count ?? 0,
        edits_week: edWeek.count ?? 0,
        media_files: media.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const totalNews = counts.news_published + counts.news_draft + counts.news_archived;
  const pctInstagram = totalNews > 0 ? Math.round((counts.news_instagram / totalNews) * 100) : 0;
  const pctManual = totalNews > 0 ? Math.round((counts.news_manual / totalNews) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Olá{user ? `, ${user.name.split(" ")[0]}` : ""}! 👋
          </h1>
          <p className="text-sm text-white/40 mt-1">Painel de controle — Ditames Ambiental</p>
        </div>
        <a href="/?edit=true"
          className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
          <Edit3 size={15} /> Navegar no site
        </a>
      </div>

      {/* Ações rápidas */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { label: "Nova notícia",   to: "/admin/news/new",   icon: Newspaper },
          { label: "Novo artigo",    to: "/admin/blog/new",   icon: FileText },
          { label: "Importar link",  to: "/admin/import",     icon: Link2 },
          { label: "Sync Instagram", to: "/admin/instagram",  icon: Instagram },
        ].map((a) => (
          <Link key={a.label} to={a.to}
            className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
            <a.icon size={15} /> {a.label}
          </Link>
        ))}
      </div>

      {/* ── MÉTRICAS DE CONTEÚDO ── */}
      <MetricSection title="Conteúdo publicado" icon={BarChart3}>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 pt-1">
          <StatCard label="Notícias publicadas" value={counts.news_published} icon={Newspaper}  color="text-green-400"  bg="bg-green-500/10"  to="/admin/news"  loading={loading} />
          <StatCard label="Notícias rascunho"   value={counts.news_draft}     icon={PenSquare}   color="text-yellow-400" bg="bg-yellow-500/10" to="/admin/news"  loading={loading} />
          <StatCard label="Artigos publicados"  value={counts.blog_published} icon={FileText}    color="text-blue-400"   bg="bg-blue-500/10"   to="/admin/blog"  loading={loading} />
          <StatCard label="Artigos rascunho"    value={counts.blog_draft}     icon={PenSquare}   color="text-sky-400"    bg="bg-sky-500/10"    to="/admin/blog"  loading={loading} />
        </div>
      </MetricSection>

      {/* ── MÉTRICAS DO SISTEMA ── */}
      <MetricSection title="Sistema" icon={TrendingUp} defaultOpen={true}>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 pt-1">
          <StatCard label="Cases ativos"      value={counts.cases}       icon={Layers}      color="text-orange-400" bg="bg-orange-500/10" to="/admin/cases"  loading={loading} />
          <StatCard label="Perguntas FAQ"     value={counts.faq}         icon={HelpCircle}  color="text-purple-400" bg="bg-purple-500/10" to="/admin/faq"    loading={loading} />
          <StatCard label="Usuários ativos"   value={counts.users}       icon={Users}       color="text-primary"    bg="bg-primary/10"    to="/admin/users"  loading={loading} />
          <StatCard label="Arquivos de mídia" value={counts.media_files} icon={Globe}       color="text-cyan-400"   bg="bg-cyan-500/10"   to="/admin/news"   loading={loading} />
        </div>
      </MetricSection>

      {/* ── ATIVIDADE ── */}
      <MetricSection title="Atividade" icon={Clock} defaultOpen={true}>
        <div className="grid gap-3 sm:grid-cols-3 pt-1">
          <div className="rounded-xl bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={13} className="text-primary" />
              <span className="text-xs text-white/50">Hoje</span>
            </div>
            <div className={`text-3xl font-bold ${loading ? "text-white/20" : "text-white"}`}>{loading ? "—" : counts.edits_today}</div>
            <div className="text-xs text-white/30 mt-1">ações registradas</div>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={13} className="text-primary" />
              <span className="text-xs text-white/50">Últimos 7 dias</span>
            </div>
            <div className={`text-3xl font-bold ${loading ? "text-white/20" : "text-white"}`}>{loading ? "—" : counts.edits_week}</div>
            <div className="text-xs text-white/30 mt-1">ações registradas</div>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Archive size={13} className="text-primary" />
              <span className="text-xs text-white/50">Arquivadas</span>
            </div>
            <div className={`text-3xl font-bold ${loading ? "text-white/20" : "text-white"}`}>{loading ? "—" : counts.news_archived}</div>
            <div className="text-xs text-white/30 mt-1">notícias arquivadas</div>
          </div>
        </div>
      </MetricSection>

      {/* ── ORIGEM DAS NOTÍCIAS ── */}
      <MetricSection title="Notícias por origem" icon={Instagram} defaultOpen={false}>
        <div className="space-y-3 pt-1">
          {[
            { label: "Manual",    value: counts.news_manual,    color: "bg-primary",    pct: pctManual },
            { label: "Instagram", value: counts.news_instagram, color: "bg-pink-500",   pct: pctInstagram },
          ].map((o) => (
            <div key={o.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/60">{o.label}</span>
                <span className="text-xs text-white/40">{loading ? "—" : `${o.value} (${o.pct}%)`}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <div className={`h-full rounded-full ${o.color} transition-all duration-700`}
                  style={{ width: loading ? "0%" : `${o.pct}%` }} />
              </div>
            </div>
          ))}
          <div className="text-xs text-white/30 pt-1">Total: {loading ? "—" : totalNews} notícias</div>
        </div>
      </MetricSection>

      {/* ── AUDIT LOG RECENTE ── */}
      <MetricSection title="Atividade recente" icon={CheckCircle2} defaultOpen={true}>
        <div className="pt-1">
          {logs.length === 0 ? (
            <div className="py-6 text-center text-sm text-white/30">Nenhuma atividade registrada.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[9px] font-bold uppercase">
                    {(log.user_name ?? "?").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <span className="font-semibold text-white">{log.user_name ?? "Sistema"}</span>
                    <span className="text-white/50"> {ACTION_LABELS[log.action] ?? log.action} em </span>
                    <span className="text-primary">{MODULE_LABELS[log.module] ?? log.module}</span>
                    {log.field && <span className="text-white/30"> · {log.field}</span>}
                  </div>
                  <div className="shrink-0 text-[10px] text-white/30 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="pt-3">
            <Link to="/admin/audit" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver audit log completo <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      </MetricSection>
    </div>
  );
}
