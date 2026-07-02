import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, MessageCircle, Mail, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { WHATSAPP_URL } from "@/lib/services";
import { supabase } from "@/lib/supabase";
import { useErrorModal, friendlyError } from "@/components/admin/Toast";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Ditames Ambiental" },
      { name: "description", content: "Fale com um especialista da Ditames Ambiental. Atendimento por WhatsApp, telefone ou formulário." },
      { property: "og:title", content: "Fale com a Ditames Ambiental" },
      { property: "og:description", content: "Atendimento técnico para projetos ambientais em todo o Brasil." },
    ],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const { showError, ErrorModalContainer } = useErrorModal();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const nome = String(data.get("nome") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const telefone = String(data.get("telefone") ?? "").trim();
    const servico = String(data.get("servico") ?? "").trim();
    const mensagem = String(data.get("mensagem") ?? "").trim();

    if (!nome || !email || !mensagem) {
      showError("Campos obrigatórios", "Preencha nome, e-mail e mensagem antes de enviar.");
      return;
    }

    setSending(true);
    let persisted = false;

    try {
      const { error } = await supabase.from("contacts").insert({
        name: nome,
        email,
        phone: telefone || null,
        service: servico || null,
        message: mensagem,
        source: "site_form",
        forwarded_to_whatsapp: true,
      });
      if (error) throw error;
      persisted = true;
    } catch (e) {
      // Não bloqueia o envio por WhatsApp mesmo se a persistência falhar —
      // o contato ainda chega ao especialista, só não fica registrado no CMS.
      console.error("[contato] falha ao persistir contato:", e);
    }

    // Monta a mensagem completa, agora incluindo TODOS os campos preenchidos
    // (antes: email, telefone e serviço eram coletados e descartados)
    const linhas = [
      `Olá, sou ${nome}.`,
      email && `E-mail: ${email}`,
      telefone && `Telefone: ${telefone}`,
      servico && servico !== "Não sei qual preciso" && `Serviço de interesse: ${servico}`,
      "",
      mensagem,
    ].filter(Boolean);

    const body = encodeURIComponent(linhas.join("\n"));

    setSent(true);
    form.reset();

    // Abre em nova aba — antes usava window.location.href, que navegava
    // a aba inteira para fora do site (comportamento destrutivo e
    // inconsistente com os outros links de WhatsApp da própria página,
    // que já abrem normalmente como link).
    window.open(`${WHATSAPP_URL.split("?")[0]}?text=${body}`, "_blank", "noopener,noreferrer");

    if (!persisted) {
      showError(
        "Mensagem enviada, mas não registrada",
        "Sua mensagem foi encaminhada para o WhatsApp, mas não conseguimos salvar uma cópia no nosso sistema. Se possível, confirme o envio por lá."
      );
    }

    setSending(false);
  };

  return (
    <>
      <ErrorModalContainer />
      <PageHero
        eyebrow="Vamos conversar"
        title={<>Pronto para resolver seu <span className="text-primary">desafio ambiental?</span></>}
        subtitle="Conte sobre seu projeto. Um especialista da Ditames retorna para iniciar o atendimento técnico."
      />

      <section className="bg-background py-20 md:py-24">
        <div className="container-x grid lg:grid-cols-[1fr_1.4fr] gap-12">
          <div className="space-y-5">
            <a
              href={WHATSAPP_URL}
              className="block rounded-2xl bg-primary text-primary-foreground p-7 transition-all hover:opacity-95"
            >
              <MessageCircle size={26} />
              <div className="mt-4 font-display uppercase text-xl tracking-wide">WhatsApp</div>
              <div className="mt-1 text-sm opacity-90">Resposta rápida em horário comercial</div>
            </a>
            <div className="rounded-2xl border border-border bg-card p-7">
              <Phone size={22} className="text-primary" />
              <div className="mt-4 font-display uppercase text-lg text-ink">Telefone</div>
              <div className="mt-1 text-sm text-muted-foreground">(47) 3300-3466</div>
              <div className="text-sm text-muted-foreground">WhatsApp: (47) 9 9691-0055</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-7">
              <Mail size={22} className="text-primary" />
              <div className="mt-4 font-display uppercase text-lg text-ink">E-mail</div>
              <a href="mailto:ambiental@ditames.com.br" className="mt-1 block text-sm text-muted-foreground hover:text-primary">
                ambiental@ditames.com.br
              </a>
            </div>
            <a
              href="https://www.google.com/maps/place/Ditames+Soluções+Ambientais/@-27.2309585,-49.6484217,97m"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/50"
            >
              <MapPin size={22} className="text-primary" />
              <div className="mt-4 font-display uppercase text-lg text-ink">Sede</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Rua Brasil, 22 — Sumaré<br />
                Rio do Sul, SC — CEP 89165-613
              </div>
              <div className="mt-2 text-xs uppercase tracking-widest text-primary">Ver no Google Maps →</div>
            </a>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-8 md:p-10 space-y-5"
          >
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Nome</label>
              <input
                name="nome"
                required
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">E-mail</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Telefone</label>
                <input
                  name="telefone"
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tipo de serviço</label>
              <select
                name="servico"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              >
                <option>Não sei qual preciso</option>
                <option>Licenciamento Ambiental</option>
                <option>Regularização Ambiental</option>
                <option>Topografia</option>
                <option>Georreferenciamento</option>
                <option>Inventário Florestal</option>
                <option>Loteamentos</option>
                <option>Consultoria Ambiental</option>
                <option>Outro</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mensagem</label>
              <textarea
                name="mensagem"
                required
                rows={5}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-50">
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {sending ? "Enviando…" : "Enviar via WhatsApp"}
            </button>
            {sent && (
              <p className="flex items-center justify-center gap-2 text-sm text-primary text-center">
                <CheckCircle2 size={15} /> Mensagem enviada! O WhatsApp foi aberto em uma nova aba.
              </p>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
