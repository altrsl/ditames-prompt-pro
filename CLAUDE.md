# CLAUDE.md — Instruções permanentes para o agente

Leia este arquivo inteiro antes de qualquer ação no projeto.

## Identidade do projeto

Este é o site institucional da **Ditames Ambiental**, empresa de engenharia ambiental, geotecnologia e licenciamento de Rio do Sul, SC.

O projeto está em produção via **Lovable**, sincronizado com GitHub. Qualquer push para `main` é refletido no site ao vivo.

## Documentos obrigatórios

Antes de qualquer tarefa, leia:
- `/docs/PROJECT_CONTEXT.md` — contexto geral, stack, estado atual
- `/docs/BRAND_GUIDE.md` — identidade visual, paleta, tipografia, tom
- `/docs/SITE_ARCHITECTURE.md` — rotas, componentes, estrutura de dados
- `/docs/RECEPTIONIST_AI.md` — sobre a IA de triagem
- `/docs/CMS_REQUIREMENTS.md` — requisitos do painel administrativo

## Regras absolutas

### NUNCA faça sem solicitação explícita:
- Alterar identidade visual (cores, fontes, espaçamentos)
- Redesenhar seções existentes
- Substituir textos institucionais por versões genéricas
- Remover ou reordenar seções da homepage
- Alterar o tom de comunicação
- Trocar componentes por preferência técnica

### SEMPRE faça:
- Ler os docs antes de qualquer tarefa
- Preservar a estrutura visual existente ao adicionar funcionalidades
- Fazer push para `main` após cada conjunto de alterações
- Usar o cliente Supabase de `src/lib/supabase.ts`
- Usar os tipos de `src/lib/database.types.ts`
- Usar as queries de `src/lib/queries.ts` (ou criar novas no mesmo arquivo)

## Stack e convenções

- **React 19 + TypeScript + TanStack Start (SSR)**
- **Tailwind CSS v4** — use tokens CSS (`--primary`, `--ink`, etc.), não valores hardcoded
- **shadcn/ui** — componentes em `src/components/ui/`
- **Lucide React** — ícones
- **Supabase** — banco e storage
- **Roteamento file-based** — novas páginas em `src/routes/`

## Fluxo de trabalho

1. Leia os docs
2. Entenda o impacto da mudança
3. Implemente preservando identidade visual
4. Faça commit semântico (`feat:`, `fix:`, `refactor:`)
5. Faça push para `main`
6. Informe o que foi feito e o próximo passo recomendado

## Próximos passos do projeto (em ordem)

1. **Rodar `supabase/schema.sql`** no Supabase Dashboard (SQL Editor)
2. **Criar bucket `media`** no Supabase Storage (público, 10MB)
3. **Conectar frontend ao Supabase** — substituir `content.ts` e dados hardcoded pelas queries
4. **Criar painel `/admin`** com autenticação Supabase Auth
5. **Implementar upload de imagens** no painel admin
6. **CRUD de cases, blog, notícias, FAQ** no painel
7. **Schema markup** nas páginas de serviço (SEO)
