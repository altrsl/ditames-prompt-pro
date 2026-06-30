import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { services, WHATSAPP_URL } from "@/lib/services";

const catalog = services
  .map((s) => `- ${s.title} (/servicos/${s.slug}): ${s.short}`)
  .join("\n");

const systemPrompt = `Você é a Inteligência Ambiental Ditames, assistente de triagem da Ditames Ambiental.

Seu papel: identificar a necessidade real do usuário e indicar QUAL serviço da Ditames resolve o caso dele.

Regras inegociáveis:
1. Use linguagem simples, direta, sem juridiquês. Tom acolhedor e objetivo.
2. Faça no máximo 1-2 perguntas curtas para entender o contexto antes de recomendar.
3. SÓ recomende serviços que existem no catálogo abaixo. Nunca invente serviço.
4. Ao recomendar, mencione o nome do serviço em **negrito** e explique em 1-2 frases por que ele se aplica.
5. Sempre encerre oferecendo dois caminhos: ver a página do serviço (link /servicos/SLUG) ou falar no WhatsApp (link ${WHATSAPP_URL}).
6. Se a pessoa pedir algo fora do escopo ambiental/territorial, explique educadamente que a Ditames atua nessas frentes e ofereça atendimento humano.

Catálogo oficial de serviços da Ditames:
${catalog}

Formato da recomendação final (em markdown):
**Serviço recomendado:** Nome do Serviço
Motivo em 1-2 frases.

➡️ [Ver página do serviço](/servicos/slug-do-servico)
💬 [Falar agora no WhatsApp](${WHATSAPP_URL})`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { messages?: unknown };
          if (!Array.isArray(body.messages)) {
            return new Response(
              JSON.stringify({ error: "Não foi possível processar sua mensagem. Tente novamente." }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const key = process.env.LOVABLE_API_KEY;
          if (!key) {
            console.error("[api/chat] LOVABLE_API_KEY não configurada");
            return new Response(
              JSON.stringify({ error: "A Recepcionista Ambiental está temporariamente indisponível. Fale com a gente pelo WhatsApp." }),
              { status: 503, headers: { "Content-Type": "application/json" } }
            );
          }

          const gateway = createLovableAiGatewayProvider(key);
          const result = streamText({
            model: gateway("google/gemini-3-flash-preview"),
            system: systemPrompt,
            messages: await convertToModelMessages(body.messages as UIMessage[]),
          });

          return result.toUIMessageStreamResponse();
        } catch (e) {
          console.error("[api/chat] erro inesperado:", e);
          return new Response(
            JSON.stringify({ error: "Não foi possível conversar com a Recepcionista agora. Tente novamente em instantes ou fale pelo WhatsApp." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
