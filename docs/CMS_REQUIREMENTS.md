# CMS REQUIREMENTS — Ditames Ambiental

## Objetivo

Permitir que o usuário administrador (não-desenvolvedor) edite o conteúdo do site sem tocar em código.

## O que deve ser editável

| Conteúdo | Tabela Supabase | Prioridade |
|---|---|---|
| Cases: nome, setor, descrição, logo | `cases` + `media` | Alta |
| Blog: artigos completos | `blog_posts` | Alta |
| Notícias: posts institucionais | `news_posts` | Alta |
| FAQ: perguntas e respostas | `faq` | Alta |
| Imagens em geral | `media` (Storage) | Alta |
| Serviços: títulos, descrições | `services` | Média |
| Homepage: textos de números | `homepage_content` | Média |
| Banners e imagens da homepage | `media` + `homepage_content` | Baixa |

## Arquitetura do CMS

O CMS será uma área protegida por autenticação (Supabase Auth) dentro do próprio site, na rota `/admin`.

### Fluxo de upload de imagens

```
Admin faz upload → Supabase Storage (bucket "media")
                 → URL pública gerada automaticamente
                 → URL salva na tabela "media" com metadados
                 → Vinculada ao conteúdo (case, post, etc.)
```

### Estrutura planejada do painel

```
/admin
  /admin/cases          → Gerenciar cases (CRUD + upload de logo)
  /admin/blog           → Gerenciar artigos do blog
  /admin/noticias       → Gerenciar notícias
  /admin/faq            → Gerenciar perguntas frequentes
  /admin/servicos       → Gerenciar serviços
  /admin/media          → Biblioteca de imagens
  /admin/homepage       → Textos editáveis da homepage
```

## Autenticação

- Supabase Auth com email/senha
- Apenas usuários autorizados acessam `/admin`
- Row Level Security (RLS) no banco: SELECT público, INSERT/UPDATE/DELETE apenas autenticados

## Regras de design do CMS

- Pode ser mais simples visualmente (área interna)
- Deve usar a mesma paleta e fontes do site
- Interface clara, sem ambiguidade
- Feedback visual em todas as ações (loading, sucesso, erro)

## Estado atual

- Schema do banco criado (`supabase/schema.sql`)
- Tipos TypeScript gerados (`src/lib/database.types.ts`)
- Cliente Supabase configurado (`src/lib/supabase.ts`)
- Queries prontas (`src/lib/queries.ts`)
- **Próximo passo:** conectar o frontend ao banco (substituir hardcoded)
- **Depois:** criar painel `/admin` com autenticação e CRUD
