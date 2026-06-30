import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Leaf, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "@/lib/admin";
import { friendlyError, Alert } from "@/components/admin/Toast";

export const Route = createFileRoute("/admin/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Informe seu e-mail para continuar.");
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
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
          <h1 className="text-xl font-bold text-white">Recuperar senha</h1>
          <p className="text-sm text-white/40 mt-1 text-center">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 size={24} className="text-green-400" />
              </div>
            </div>
            <p className="text-sm text-white/70">
              Se houver uma conta cadastrada com <strong className="text-white">{email}</strong>,
              um e-mail com instruções foi enviado.
            </p>
            <p className="text-xs text-white/30">
              Não recebeu? Verifique a caixa de spam ou tente novamente em alguns minutos.
            </p>
          </div>
        ) : (
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
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
            </div>

            {error && <Alert type="error" title={error} onClose={() => setError(null)} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Enviando…" : "Enviar link de recuperação"}
            </button>
          </form>
        )}

        <Link
          to="/admin/login"
          className="mt-8 flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} /> Voltar para o login
        </Link>
      </div>
    </div>
  );
}
