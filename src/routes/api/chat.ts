import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { services } from "@/lib/services";

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
5. Sempre encerre oferecendo dois caminhos: ver a página do serviço (link /servicos/SLUG) ou falar no WhatsApp.
6. Se a pessoa pedir algo fora do escopo ambiental/territorial, explique educadamente que a Ditames atua nessas frentes e ofereça atendimento humano.

Catálogo oficial de serviços da Ditames:
${catalog}

Formato da recomendação final (em markdown):
**Serviço recomendado:** Nome do Serviço
Motivo em 1-2 frases.

➡️ [Ver página do serviço](/servicos/slug-do-servico)
💬 Ou fale agora no WhatsApp.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: systemPrompt,
          messages: await convertToModelMessages(body.messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse();
      },
    },
  },
});
