## Visão geral

Expandir o site atual da Ditames Ambiental (hoje single-page) para um ecossistema multi-page com IA integrada, mantendo a identidade visual já implementada (verde #609430, Anton + Montserrat, padrão topográfico).

## Arquitetura de rotas (TanStack Start)

```
src/routes/
  __root.tsx              → Header fixo + Footer + WhatsApp flutuante
  index.tsx               → Home (manter estrutura atual)
  sobre.tsx               → Sobre a Ditames
  servicos.tsx            → Hub de serviços
  servicos.$slug.tsx      → Página individual de serviço (template master)
  cases.tsx               → Grid de clientes/cases
  cultura.tsx             → 5 pilares, Eudaimonia
  ia.tsx                  → Inteligência Ambiental (chatbot)
  contato.tsx             → Formulário + canais
  api/chat.ts             → Endpoint streaming Lovable AI Gateway
```

Cada rota terá `head()` próprio com title, description e og tags únicos.

## Componentes compartilhados

- `src/components/site/Header.tsx` — nav fixa com menu (Home, Sobre, Serviços, Cases, Cultura, IA, Contato)
- `src/components/site/Footer.tsx` — institucional completo
- `src/components/site/WhatsAppFab.tsx` — botão flutuante fixo
- `src/components/site/ServiceTemplate.tsx` — template master de serviço (Hero, O que é, Quando, Como atuamos, Etapas, Diferencial, CTA)
- `src/lib/services.ts` — fonte única dos 12 serviços (slug, nome, ícone, descrição, quando, etapas) consumida pelo hub, páginas individuais e IA

Esses são montados dentro de `__root.tsx` ao redor do `<Outlet />`.

## Template master de serviço

Todas as 12 páginas `/servicos/$slug` renderizam o mesmo `ServiceTemplate` lendo de `services.ts`. Estrutura fixa: Hero → O que é → Quando é necessário → Como a Ditames atua → Etapas (timeline) → Diferencial → CTA verde escuro.

## Inteligência Ambiental (IA)

- Página `/ia` com interface chat (AI Elements: Conversation, Message, PromptInput, Shimmer)
- Sugestões iniciais como chips clicáveis (6 cenários do briefing)
- Endpoint `src/routes/api/chat.ts` com `streamText` + Lovable AI Gateway (`google/gemini-3-flash-preview`)
- System prompt restritivo: só recomenda serviços existentes no catálogo da Ditames (passado no prompt), tom simples, sem juridiquês, encaminha para `/servicos/$slug` ou WhatsApp
- Conversa única em memória (sem persistência) — sem perguntas de threading, pois é triagem rápida

## Conteúdos

Vou redigir conteúdos institucionais coerentes para Sobre, Cultura (5 pilares + Eudaimonia), Cases (grid de placeholders setoriais até receber clientes reais), Contato. Os 12 serviços recebem conteúdo técnico padronizado.

## Correções técnicas

- Fix do erro runtime atual `Map is not a constructor`: ícone `Map` do lucide-react está sombreando `globalThis.Map`. Renomear import para `Map as MapIcon`.
- Habilitar Lovable Cloud não é necessário (IA usa apenas o AI Gateway, sem persistência).

## O que NÃO está incluso

- Formulário de contato funcional com backend (apenas UI + mailto/WhatsApp)
- Cases reais (uso placeholders setoriais)
- Persistência de histórico do chat
- Autenticação

Confirma que posso seguir com tudo isso?