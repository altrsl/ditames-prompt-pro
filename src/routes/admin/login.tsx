import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Leaf, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { signIn, getCurrentCmsUser } from "@/lib/admin";
import { writeAuditLog } from "@/lib/admin";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      const user = await getCurrentCmsUser();

      if (!user || user.status !== "active") {
        setError("Usuário inativo ou sem acesso ao CMS.");
        setLoading(false);
        return;
      }

      await writeAuditLog({
        user,
        action: "login",
        module: "users",
        metadata: { email },
      });

      router.navigate({ to: "/admin" });
    } catch {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1410] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mb-4">
            <Leaf size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Ditames CMS</h1>
          <p className="text-sm text-white/40 mt-1">Painel administrativo</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-10 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-white/20 mt-8">
          Acesso restrito — Ditames Ambiental
        </p>
      </div>
    </div>
  );
}
