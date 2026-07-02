import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Brain, MessageCircle, Sparkles, ExternalLink } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { WHATSAPP_URL } from "@/lib/services";
import { useErrorModal, friendlyError } from "@/components/admin/Toast";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ia")({
  head: () => ({
    meta: [
      { title: "Recepcionista Ambiental — Ditames" },
      { name: "description", content: "Precisa de ajuda para entender seu caso ambiental? Converse com a recepcionista digital da Ditames e descubra o caminho técnico correto." },
      { property: "og:title", content: "Recepcionista Ambiental Ditames" },
      { property: "og:description", content: "Triagem em linguagem simples para encontrar o serviço certo." },
    ],
  }),
  component: IAPage,
});

const suggestions = [
  "Quero abrir uma indústria",
  "Preciso regularizar minha propriedade rural",
  "Tenho uma nascente na minha área",
  "Quero fazer um loteamento",
  "Preciso suprimir vegetação",
  "Não sei qual serviço preciso",
];

// Extrai texto puro de uma mensagem do useChat (remove markdown de links/negrito)
function plainText(parts: { type: string; text?: string }[]): string {
  return parts
    .map((p) => (p.type === "text" ? p.text ?? "" : ""))
    .join("")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [label](url) → label
    .replace(/\*\*([^*]+)\*\*/g, "$1");       // **bold** → bold
}

// Gera um resumo curto da conversa para encaminhar ao especialista via WhatsApp
function buildWhatsAppSummary(messages: { role: string; parts: { type: string; text?: string }[] }[]): string {
  if (messages.length === 0) {
    return "Olá, vim pelo site da Ditames e gostaria de falar com um especialista.";
  }

  const userMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => plainText(m.parts))
    .filter(Boolean);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const assistantSummary = lastAssistant ? plainText(lastAssistant.parts) : "";

  let summary = "Olá! Conversei com a Recepcionista Ambiental do site e gostaria de continuar com um especialista.\n\n";

  if (userMessages.length > 0) {
    summary += `Minha situação: ${userMessages[0].slice(0, 200)}\n\n`;
  }
  if (assistantSummary) {
    summary += `Última orientação recebida: ${assistantSummary.slice(0, 300)}`;
  }

  // WhatsApp tem limite prático de URL — garante uma mensagem segura
  return summary.slice(0, 700);
}

function getWhatsAppUrlWithSummary(messages: { role: string; parts: { type: string; text?: string }[] }[]): string {
  const summary = buildWhatsAppSummary(messages);
  const base = WHATSAPP_URL.split("?")[0];
  return `${base}?text=${encodeURIComponent(summary)}`;
}

function IAPage() {
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/chat" }));
  const { messages, sendMessage, status, error } = useChat({ transport });
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const whatsappUrl = useMemo(() => getWhatsAppUrlWithSummary(messages), [messages]);
  const { showError, ErrorModalContainer } = useErrorModal();

  // Extrai o nome do serviço sugerido da última mensagem da IA, se houver
  const extractServiceSuggested = () => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return null;
    const text = plainText(last.parts);
    const match = text.match(/\*\*Serviço recomendado:\*\*\s*([^\n]+)/);
    return match ? match[1].trim() : null;
  };

  const handleForwardToHuman = async () => {
    // Grava o lead no banco em segundo plano — não bloqueia a navegação
    // para o WhatsApp mesmo se falhar (o usuário não deve ser prejudicado
    // por um erro de persistência)
    if (messages.length > 0) {
      const conversationLog = messages.map((m) => ({
        role: m.role,
        text: plainText(m.parts),
      }));
      const summary = buildWhatsAppSummary(messages);
      const service_suggested = extractServiceSuggested();

      supabase.from("leads").insert({
        conversation: conversationLog,
        summary,
        service_suggested,
        forwarded_to_whatsapp: true,
        status: "new",
      }).then(({ error }) => {
        if (error) console.error("[leads] falha ao registrar lead:", error);
      });
    }

    // Abre o WhatsApp com o resumo
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (error) {
      const { title, message } = friendlyError(error);
      showError(
        title || "Não foi possível conversar agora",
        message || "A Recepcionista Ambiental está indisponível no momento. Fale com a gente pelo WhatsApp.",
      );
    }
  }, [error]);

  const chatRef = useRef<HTMLDivElement>(null);

  // Scroll ancorado: só desce automaticamente se o usuário já estiver
  // perto do final — se rolou para cima para ler, não interfere.
  useEffect(() => {
    const container = chatRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    // Só rola automaticamente se estiver a menos de 120px do final
    if (distanceFromBottom < 120) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll até o chat ao carregar a página — evita que o usuário
  // chegue no PageHero e precise rolar para encontrar a caixa de chat
  useEffect(() => {
    const chatSection = document.getElementById("chat");
    if (!chatSection) return;
    // Pequeno delay para garantir que o layout já renderizou
    const timer = setTimeout(() => {
      chatSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const send = (text: string) => {
    if (!text.trim() || status === "submitted" || status === "streaming") return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <>
      <ErrorModalContainer />
      <PageHero
        eyebrow="Recepcionista Digital"
        title={<>Olá! Posso te ajudar a <span className="text-primary">entender seu caso?</span></>}
        subtitle="Sou a recepcionista digital da Ditames. Te ouço em linguagem simples, ajudo a identificar a solução ambiental certa e te encaminho para um especialista da nossa equipe quando fizer sentido."
      />


      <section id="chat" className="bg-background pb-24">
        <div className="container-x grid lg:grid-cols-[1fr_2fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={18} />
                <span className="font-display uppercase text-sm tracking-wider">Como funciona</span>
              </div>
              <ol className="mt-5 space-y-3 text-sm text-foreground/80">
                <li>1. Descreva sua situação em linguagem simples.</li>
                <li>2. A IA faz 1-2 perguntas para entender o contexto.</li>
                <li>3. Recebe o serviço Ditames recomendado.</li>
                <li>4. Vai direto para a página do serviço ou WhatsApp.</li>
              </ol>
            </div>
            <button onClick={handleForwardToHuman} className="btn-outline w-full">
              <MessageCircle size={16} /> Prefiro falar com humano
            </button>
            {messages.length > 0 && (
              <p className="text-xs text-muted-foreground text-center -mt-2">
                Sua conversa será resumida e enviada junto.
              </p>
            )}
            <div className="text-center">
              <Link
                to="/contato"
                className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
              >
                Outras formas de contato
              </Link>
            </div>
          </aside>

          {/* Chat */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col h-[640px]">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Brain size={20} />
              </div>
              <div>
                <div className="font-display uppercase text-sm tracking-wider text-ink">
                  Recepcionista Ditames
                </div>
                <div className="text-xs text-muted-foreground">
                  {status === "streaming" || status === "submitted" ? "Pensando..." : "Online"}
                </div>
              </div>
            </div>

            <div ref={chatRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-5">
                  <div className="rounded-xl bg-secondary/50 p-4 text-sm text-ink leading-relaxed">
                    Olá! Sou a recepcionista digital da Ditames. Me conta o que está
                    acontecendo no seu projeto que eu te oriento — e, se preciso, chamo
                    um especialista da nossa equipe.
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                      Sugestões
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-primary hover:bg-secondary"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((m) => {
                const text = m.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("");
                const isUser = m.role === "user";
                return (
                  <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/60 text-ink"
                      }`}
                    >
                      {isUser ? (
                        text
                      ) : (
                        <Markdownish text={text} />
                      )}
                    </div>
                  </div>
                );
              })}

              {(status === "submitted" || status === "streaming") && messages.at(-1)?.role === "user" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-secondary/60 px-5 py-3 text-sm text-ink">
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "120ms" }} />
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "240ms" }} />
                    </span>
                  </div>
                </div>
              )}


            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-border bg-surface px-4 py-3 flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Descreva sua situação..."
                className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-sm text-ink placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                disabled={status === "submitted" || status === "streaming"}
              />
              <button
                type="submit"
                disabled={!input.trim() || status === "submitted" || status === "streaming"}
                className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                aria-label="Enviar"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="px-4 pb-2 text-center text-[11px] text-muted-foreground">
              Ao enviar, você concorda com nossa{" "}
              <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                Política de Privacidade
              </a>
              . Conversas encaminhadas a especialistas podem ser registradas.
            </p>
          </div>
        </div>

        <div className="container-x mt-8 text-center">
          <Link to="/servicos" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark">
            Ou veja todos os serviços <ExternalLink size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}

/* Minimal markdown: **bold**, [text](url), preserve line breaks */
function Markdownish({ text }: { text: string }) {
  const parts: (string | { url: string; label: string })[] = [];
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(text))) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
    parts.push({ label: m[1], url: m[2] });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));

  const renderBold = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
      chunk.startsWith("**") && chunk.endsWith("**") ? (
        <strong key={i} className="font-semibold text-primary">
          {chunk.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{chunk}</span>
      ),
    );

  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{renderBold(p)}</span>
        ) : p.url.startsWith("/") ? (
          <Link
            key={i}
            to={p.url}
            className="inline-flex items-center gap-1 font-semibold text-primary underline hover:text-primary-dark"
          >
            {p.label}
          </Link>
        ) : (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-primary underline hover:text-primary-dark"
          >
            {p.label}
          </a>
        ),
      )}
    </>
  );
}
