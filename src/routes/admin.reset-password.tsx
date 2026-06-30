import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { updatePassword, getSession } from "@/lib/admin";
import { friendlyError, Alert } from "@/components/admin/Toast";

export const Route = createFileRoute("/admin/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const session = await getSession();
      setValidSession(!!session);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => router.navigate({ to: "/admin/login" }), 2000);
    } catch (e) {
      const { message } = friendlyError(e);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1410] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mb-4">
            <Leaf size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Definir nova senha</h1>
        </div>

        {validSession === null && (
          <div className="text-center text-sm text-white/40 flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Verificando link…
          </div>
        )}

        {validSession === false && (
          <Alert
            type="error"
            title="Link inválido ou expirado"
            message="Solicite um novo link de recuperação de senha e tente novamente."
          />
        )}

        {validSession === true && !done && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
                Nova senha
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="•••••••• (mín. 6 caracteres)"
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
                Confirmar nova senha
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            {error && <Alert type="error" title={error} onClose={() => setError(null)} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Salvando…" : "Salvar nova senha"}
            </button>
          </form>
        )}

        {done && (
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 size={24} className="text-green-400" />
              </div>
            </div>
            <p className="text-sm text-white/70">Senha atualizada com sucesso!</p>
            <p className="text-xs text-white/30">Redirecionando para o login…</p>
          </div>
        )}
      </div>
    </div>
  );
}
