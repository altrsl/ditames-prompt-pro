import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Archive, Instagram, FileText } from "lucide-react";
import { getCurrentCmsUser, hasPermission } from "@/lib/admin";
import { listNews, publishNews, archiveNews, deleteNews } from "@/lib/news";
import { useToast, useErrorModal, friendlyError } from "@/components/admin/Toast";
import type { CmsUserRow, NewsRow, NewsStatus } from "@/lib/database.types";

export const Route = createFileRoute("/admin/news_")({
  component: AdminNews,
});

const STATUS_LABELS: Record<NewsStatus, string> = {
  published: "Publicado",
  draft: "Rascunho",
  archived: "Arquivado",
};

const STATUS_COLORS: Record<NewsStatus, string> = {
  published: "bg-green-500/20 text-green-400",
  draft: "bg-yellow-500/20 text-yellow-400",
  archived: "bg-white/10 text-white/40",
};

function AdminNews() {
  const router = useRouter();
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [news, setNews] = useState<NewsRow[]>([]);
  const [filter, setFilter] = useState<NewsStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const { toast, ToastContainer } = useToast();
  const { showError, ErrorModalContainer } = useErrorModal();

  const canEdit = hasPermission(user, "create_edit_news");
  const canPublish = hasPermission(user, "publish_archive_content");

  async function load() {
    try {
      const u = await getCurrentCmsUser();
      setUser(u);
      const items = await listNews(filter !== "all" ? { status: filter } : undefined);
      setNews(items);
    } catch (e) {
      const { title, message } = friendlyError(e);
      showError(title, message, load);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  const handlePublish = async (id: string) => {
    if (!user) return;
    if (!hasPermission(user, "publish_archive_content")) {
      showError("Sem permissão", "Você não possui permissão para publicar notícias.");
      return;
    }
    try { await publishNews(id, user); toast.success("Notícia publicada!", "Já está visível no site."); load(); }
    catch (e) { const { title, message } = friendlyError(e); showError(title, message); }
  };

  const handleArchive = async (id: string) => {
    if (!user) return;
    if (!hasPermission(user, "publish_archive_content")) {
      showError("Sem permissão", "Você não possui permissão para arquivar notícias.");
      return;
    }
    try { await archiveNews(id, user); toast.info("Notícia arquivada."); load(); }
    catch (e) { const { title, message } = friendlyError(e); showError(title, message); }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!hasPermission(user, "create_edit_news")) {
      showError("Sem permissão", "Você não possui permissão para remover notícias.");
      return;
    }
    if (!confirm("Remover esta notícia permanentemente? Esta ação não pode ser desfeita.")) return;
    try { await deleteNews(id, user); toast.success("Notícia removida."); load(); }
    catch (e) { const { title, message } = friendlyError(e); showError(title, message); }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <ToastContainer />
      <ErrorModalContainer />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Notícias</h1>
          <p className="text-sm text-white/40 mt-0.5">Gerencie notícias manuais e importadas do Instagram</p>
        </div>
        {canEdit && (
          <Link
            to="/admin/news/$id"
            params={{ id: "new" }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Nova notícia
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "published", "draft", "archived"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              filter === s
                ? "border-primary bg-primary text-white"
                : "border-white/10 text-white/40 hover:text-white hover:border-white/30"
            }`}
          >
            {s === "all" ? "Todas" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Carregando…</div>
      ) : news.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">
          Nenhuma notícia encontrada.
          {canEdit && (
            <Link to="/admin/news/$id" params={{ id: "new" }} className="block mt-3 text-primary hover:underline">
              Criar primeira notícia
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {news.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                {/* Ícone de origem */}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  item.source === "instagram" ? "bg-pink-500/20" : "bg-primary/20"
                }`}>
                  {item.source === "instagram"
                    ? <Instagram size={16} className="text-pink-400" />
                    : <FileText size={16} className="text-primary" />
                  }
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white truncate">{item.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                    <span className="text-xs text-white/30">{item.category}</span>
                    {item.source === "instagram" && (
                      <span className="text-[10px] text-pink-400/60">Instagram</span>
                    )}
                    <span className="text-xs text-white/20">
                      {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 shrink-0">
                  {canEdit && (
                    <Link
                      to="/admin/news/$id"
                      params={{ id: item.id }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </Link>
                  )}
                  {canPublish && item.status !== "published" && (
                    <button
                      onClick={() => handlePublish(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-green-400 hover:bg-green-400/10 transition-colors"
                      title="Publicar"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  {canPublish && item.status === "published" && (
                    <button
                      onClick={() => handleArchive(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                      title="Arquivar"
                    >
                      <Archive size={14} />
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
