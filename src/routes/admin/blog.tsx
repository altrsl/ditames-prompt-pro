import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Eye, Archive } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentCmsUser, hasPermission } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import type { CmsUserRow } from "@/lib/database.types";

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlog,
});

type BlogRow = { id: string; title: string; category: string; published: boolean; published_at: string | null; created_at: string };

function AdminBlog() {
  const [user, setUser] = useState<CmsUserRow | null>(null);
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const u = await getCurrentCmsUser();
    setUser(u);
    const { data } = await supabase.from("blog_posts").select("id, title, category, published, published_at, created_at").order("created_at", { ascending: false });
    setPosts((data ?? []) as BlogRow[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este artigo?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    load();
  };

  const handleToggle = async (post: BlogRow) => {
    await supabase.from("blog_posts").update({ published: !post.published, published_at: !post.published ? new Date().toISOString() : null }).eq("id", post.id);
    load();
  };

  const canEdit = hasPermission(user, "create_edit_blog");

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Blog</h1>
          <p className="text-sm text-white/40 mt-0.5">Artigos educativos e informativos</p>
        </div>
        {canEdit && (
          <Link to="/admin/blog/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            <Plus size={16} /> Novo artigo
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Carregando…</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">
          Nenhum artigo ainda.
          {canEdit && <Link to="/admin/blog/new" className="block mt-3 text-primary hover:underline">Criar primeiro artigo</Link>}
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden divide-y divide-white/5">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white truncate">{p.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${p.published ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {p.published ? "Publicado" : "Rascunho"}
                  </span>
                  <span className="text-xs text-white/30">{p.category}</span>
                  <span className="text-xs text-white/20">{new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {canEdit && (
                  <Link to="/admin/blog/$id" params={{ id: p.id }} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                    <Pencil size={14} />
                  </Link>
                )}
                <button onClick={() => handleToggle(p)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors ${p.published ? "hover:text-yellow-400 hover:bg-yellow-400/10" : "hover:text-green-400 hover:bg-green-400/10"}`}>
                  {p.published ? <Archive size={14} /> : <Eye size={14} />}
                </button>
                {canEdit && (
                  <button onClick={() => handleDelete(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
