import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Instagram, RefreshCw, AlertTriangle, CheckCircle2, ExternalLink, Settings } from "lucide-react";
import { getCurrentCmsUser, hasPermission } from "@/lib/admin";
import { syncInstagramFeed, listNews } from "@/lib/news";
import type { CmsUserRow, NewsRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/instagram")({
  component: AdminInstagram,
});

function AdminInstagram() {
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [posts, setPosts] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);

  const hasToken = !!import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN;

  useEffect(() => {
    async function load() {
      const u = await getCurrentCmsUser();
      setUser(u);
      const items = await listNews({ source: "instagram" });
      setPosts(items);
      setLoading(false);
    }
    load();
  }, []);

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    setResult(null);
    try {
      const r = await syncInstagramFeed(user);
      setResult(r);
      const items = await listNews({ source: "instagram" });
      setPosts(items);
    } catch (e) {
      setResult({ imported: 0, skipped: 0, errors: [(e as Error).message] });
    } finally {
      setSyncing(false);
    }
  };

  const canSync = hasPermission(user, "create_edit_news");

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Instagram</h1>
        <p className="text-sm text-white/40 mt-0.5">Importação automática de posts do feed</p>
      </div>

      {/* Config card */}
      <div className={`rounded-xl border p-5 mb-6 ${hasToken ? "border-green-500/20 bg-green-500/5" : "border-yellow-500/20 bg-yellow-500/5"}`}>
        <div className="flex items-start gap-3">
          {hasToken
            ? <CheckCircle2 size={18} className="text-green-400 shrink-0 mt-0.5" />
            : <AlertTriangle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
          }
          <div className="flex-1">
            <div className={`text-sm font-semibold ${hasToken ? "text-green-400" : "text-yellow-400"}`}>
              {hasToken ? "Token configurado" : "Token não configurado"}
            </div>
            {!hasToken && (
              <div className="mt-2 text-sm text-white/50 space-y-1">
                <p>Para habilitar a importação, adicione no seu <code className="text-white/70 bg-white/5 px-1 rounded">.env</code>:</p>
                <pre className="mt-2 rounded-lg bg-black/30 px-4 py-3 text-xs text-white/60 overflow-x-auto">
{`VITE_INSTAGRAM_ACCESS_TOKEN=seu_token_aqui
VITE_INSTAGRAM_USER_ID=seu_user_id`}
                </pre>
                <p className="text-xs text-white/30 mt-2">
                  Obtenha o token em: Meta for Developers → seu App → Instagram Graph API
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* O que é importado */}
      <div className="rounded-xl border border-white/5 bg-white/5 p-5 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Regras de importação</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-semibold text-green-400 mb-1">✓ Importado</div>
            <ul className="text-xs text-white/50 space-y-0.5">
              <li>• Posts de imagem única</li>
              <li>• Carrosséis (todas as imagens)</li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-red-400 mb-1">✗ Ignorado</div>
            <ul className="text-xs text-white/50 space-y-0.5">
              <li>• Reels</li>
              <li>• Stories</li>
              <li>• Posts já importados (sem duplicata)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sync */}
      {canSync && (
        <div className="mb-6">
          <button
            onClick={handleSync}
            disabled={syncing || !hasToken}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Sincronizando…" : "Sincronizar agora"}
          </button>

          {result && (
            <div className={`mt-4 rounded-xl border p-4 text-sm ${result.errors.length > 0 ? "border-red-500/20 bg-red-500/5" : "border-green-500/20 bg-green-500/5"}`}>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-green-400 font-semibold">✓ {result.imported} importados</span>
                <span className="text-white/40">{result.skipped} ignorados/duplicatas</span>
                {result.errors.length > 0 && (
                  <span className="text-red-400">{result.errors.length} erro(s)</span>
                )}
              </div>
              {result.errors.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i} className="text-xs text-red-400/70">{e}</li>
                  ))}
                </ul>
              )}
              {result.imported > 0 && (
                <p className="text-xs text-white/40 mt-2">
                  Posts importados como rascunho — publique em <Link to="/admin/news" className="text-primary hover:underline">Notícias</Link>.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Posts importados */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-4">
          Posts importados ({posts.length})
        </h2>

        {loading ? (
          <div className="text-center py-10 text-white/30 text-sm">Carregando…</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-white/30 text-sm">
            Nenhum post importado ainda.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div key={post.id} className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
                {post.cover_image && (
                  <div className="aspect-square overflow-hidden">
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mb-2 ${
                    post.status === "published" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {post.status === "published" ? "Publicado" : "Rascunho"}
                  </div>
                  <div className="text-sm font-semibold text-white leading-tight truncate">{post.title}</div>
                  <div className="flex items-center justify-between mt-3">
                    <Link
                      to="/admin/news/$id"
                      params={{ id: post.id }}
                      className="text-xs text-primary hover:underline"
                    >
                      Editar
                    </Link>
                    {post.instagram_url && (
                      <a href={post.instagram_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-white/30 hover:text-pink-400 transition-colors">
                        <ExternalLink size={11} /> Ver original
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
