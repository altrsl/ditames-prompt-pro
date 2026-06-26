# PROJECT CONTEXT — Ditames Ambiental

## Sobre a empresa

**Ditames Ambiental** é uma empresa de engenharia ambiental, geotecnologia e licenciamento fundada em 16/08/2022, com sede em Rio do Sul, SC.

- **Atuação:** 47 municípios em Santa Catarina
- **Clientes atendidos:** 687+
- **Equipe:** 40+ profissionais e parceiros
- **Contato:** (47) 3300-3466 | (47) 9 9691-0055 (WhatsApp)
- **E-mail:** comercial@ditames.com.br
- **Endereço:** Rua Brasil, 22 — Sumaré, Rio do Sul, SC — CEP 89165-613
- **Instagram:** @ditamesambiental
- **LinkedIn:** /company/ditames-ambiental/

## Missão

Fortalecer pessoas, propriedades e empresas com soluções ambientais completas que promovam segurança, conformidade e crescimento sustentável.

## Visão

Ser a referência nacional em soluções ambientais integradas que aliam técnica, tecnologia e responsabilidade no menor caminho possível.

## Posicionamento estratégico

A Ditames **não é um escritório jurídico**. É uma empresa de soluções ambientais técnicas que:

- Resolve problemas ambientais de forma prática
- Auxilia quem recebeu exigências, multas ou notificações
- Conduz regularizações do início ao fim
- Atua de forma técnica e estratégica
- Explica situações complexas em linguagem simples
- É referência para quem não sabe por onde começar

## Público-alvo principal

1. **Proprietários rurais** — regularização fundiária e ambiental
2. **Loteadores e incorporadoras** — estudos, projetos e aprovações
3. **Indústrias** — licenciamento e gestão ambiental industrial
4. **Construtoras** — apoio técnico e ambiental para obras
5. **Pessoas com problemas ambientais** — multas, notificações, exigências de órgãos, APP, nascentes, embargos

## Stack técnico

- **Frontend:** React 19 + TypeScript + TanStack Start (SSR) + Vite
- **Estilização:** Tailwind CSS v4 + shadcn/ui
- **Roteamento:** TanStack Router (file-based)
- **IA:** Vercel AI SDK + Lovable AI Gateway (Gemini 3 Flash)
- **Banco de dados:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (bucket `media`)
- **Deploy:** Lovable (com sync via GitHub)
- **Repositório:** https://github.com/altrsl/ditames-prompt-pro

## Estrutura de arquivos relevantes

```
src/
  routes/           # Páginas (file-based routing)
    index.tsx       # Homepage
    ia.tsx          # Recepcionista Ambiental
    cases.tsx       # Cases
    blog.index.tsx  # Blog
    noticias.index.tsx
    servicos/
    sobre.tsx
    cultura.tsx
    contato.tsx
  components/
    site/           # Header, Footer, PageHero, PostCard, etc.
    ui/             # shadcn/ui components
  lib/
    supabase.ts     # Cliente Supabase
    database.types.ts
    queries.ts      # Queries prontas
    services.ts     # Dados de serviços (ainda hardcoded)
    content.ts      # Blog/notícias (ainda hardcoded — migrar para Supabase)
supabase/
  schema.sql        # SQL completo para rodar no dashboard
docs/               # Este diretório — documentação do projeto
```

## Estado atual do backend

- Supabase configurado com URL e chave anon
- Schema SQL criado (tabelas: media, cases, blog_posts, news_posts, faq, services, homepage_content)
- Bucket `media` deve ser criado manualmente no Supabase Dashboard
- **Frontend ainda usa dados hardcoded** — próximo passo é migrar para queries Supabase
