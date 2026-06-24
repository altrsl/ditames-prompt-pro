import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Brain, MessageCircle, Sparkles, ExternalLink } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { WHATSAPP_URL } from "@/lib/services";

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

function IAPage() {
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/chat" }));
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = (text: string) => {
    if (!text.trim() || status === "submitted" || status === "streaming") return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <>
      <PageHero
        eyebrow="Inteligência Ambiental"
        title={<>Descubra o serviço <span className="text-primary">certo para você</span></>}
        subtitle="Triagem inteligente da Ditames. Descreva sua situação em linguagem simples e receba o direcionamento técnico correto — sem juridiquês, sem rodeio."
      />

      <section className="bg-background pb-24">
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
            <a href={WHATSAPP_URL} className="btn-outline w-full">
              <MessageCircle size={16} /> Prefiro falar com humano
            </a>
          </aside>

          {/* Chat */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col h-[640px]">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Brain size={20} />
              </div>
              <div>
                <div className="font-display uppercase text-sm tracking-wider text-ink">
                  Assistente Ditames
                </div>
                <div className="text-xs text-muted-foreground">
                  {status === "streaming" || status === "submitted" ? "Pensando..." : "Online"}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-5">
                  <div className="rounded-xl bg-secondary/50 p-4 text-sm text-ink leading-relaxed">
                    Olá! Sou a Inteligência Ambiental da Ditames. Me conta o que está acontecendo
                    no seu projeto que eu te indico o caminho certo.
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

              <div ref={bottomRef} />
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
