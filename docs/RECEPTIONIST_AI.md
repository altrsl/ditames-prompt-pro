# RECEPTIONIST AI — Recepcionista Ambiental Ditames

## O que é

A **Recepcionista Ambiental** é o principal diferencial interativo do site. É uma IA de triagem que:

1. Ouve a situação do usuário em linguagem simples
2. Faz no máximo 1-2 perguntas de contexto
3. Identifica qual serviço Ditames resolve o caso
4. Recomenda o serviço com explicação e link
5. Oferece dois caminhos: página do serviço ou WhatsApp

## Implementação técnica

- **Rota frontend:** `/ia` (`src/routes/ia.tsx`)
- **Rota API (SSR):** `/api/chat` (`src/routes/api/chat.ts`)
- **SDK:** Vercel AI SDK (`ai`, `@ai-sdk/react`)
- **Modelo:** `google/gemini-3-flash-preview` via Lovable AI Gateway
- **Chave:** `process.env.LOVABLE_API_KEY` (gerenciada pelo Lovable)

## System prompt

O assistente se apresenta como "Inteligência Ambiental Ditames" e segue regras inegociáveis:
- Linguagem simples, sem juridiquês
- Tom acolhedor e objetivo
- Máximo 1-2 perguntas antes de recomendar
- Só recomenda serviços do catálogo oficial
- Sempre encerra com link para serviço + WhatsApp

## Pontos de entrada no site

A Recepcionista é chamada em múltiplos pontos estratégicos:
- **Header:** botão "✨ Recepcionista Ambiental" (desktop + mobile)
- **Homepage — NotificacaoAmbiental:** 6 cards temáticos que levam para `/ia`
- **Homepage — seção IA:** banner de destaque no meio da página
- **Footer:** CTA "Recebeu uma exigência ambiental?"
- **Blog:** link "Tire sua dúvida agora com a Recepcionista"

## Cards de entrada (NotificacaoAmbiental)

1. Recebi uma multa ambiental
2. Preciso regularizar uma área
3. Tenho problemas com APP
4. Preciso resolver uma exigência ambiental
5. Tenho dúvidas sobre uma nascente
6. Quero entender minha situação

## Posicionamento

**NÃO** é um chatbot genérico de atendimento.
**É** uma ferramenta de triagem técnica especializada em meio ambiente.

O objetivo é converter visitantes que chegam com problemas (multa, notificação, APP) em leads qualificados para a equipe técnica da Ditames.

## Futuras melhorias planejadas

- Sugestões dinâmicas baseadas no histórico de conversas
- Integração com formulário de contato ao final da conversa
- Persistência do histórico via Supabase
- Identificação de intenção para direcionamento automático
