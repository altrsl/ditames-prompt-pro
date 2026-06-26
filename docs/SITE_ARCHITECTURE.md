# SITE ARCHITECTURE — Ditames Ambiental

## Rotas existentes

| Rota | Arquivo | Descrição |
|---|---|---|
| `/` | `routes/index.tsx` | Homepage principal |
| `/sobre` | `routes/sobre.tsx` | Quem somos, missão, visão |
| `/servicos` | `routes/servicos.index.tsx` | Lista de todos os serviços |
| `/servicos/$slug` | `routes/servicos.$slug.tsx` | Página individual de serviço |
| `/blog` | `routes/blog.index.tsx` | Listagem do blog |
| `/blog/$slug` | `routes/blog.$slug.tsx` | Artigo individual |
| `/noticias` | `routes/noticias.index.tsx` | Listagem de notícias |
| `/noticias/$slug` | `routes/noticias.$slug.tsx` | Notícia individual |
| `/cases` | `routes/cases.tsx` | Cases de clientes |
| `/ia` | `routes/ia.tsx` | Recepcionista Ambiental (chat IA) |
| `/cultura` | `routes/cultura.tsx` | Cultura organizacional |
| `/contato` | `routes/contato.tsx` | Formulário de contato |
| `/api/chat` | `routes/api/chat.ts` | API SSR para o chat da IA |

## Estrutura da Homepage (ordem das seções)

1. **Hero** — imagem de fundo, headline, CTAs principais
2. **NotificacaoAmbiental** — seção para quem recebeu multa/notificação + 6 cards → Recepcionista
3. **PublicoAlvo** — 4 segmentos: Rural, Loteadores, Indústrias, Construtoras
4. **Numeros** — 4 números animados (anos, clientes, municípios, profissionais)
5. **Crescimento** — trajetória com cards de marcos
6. **QuemSomos** — imagem + texto + diferenciais
7. **Servicos** — grid com todos os serviços (links para páginas individuais)
8. **Metodo** — 6 etapas do método Ditames (timeline)
9. **Diferenciais** — 4 cards de diferenciais
10. **Tecnologia** — stack técnico (drones, GPS RTK, SIG, etc.)
11. **IA** — banner da Recepcionista Ambiental com exemplos
12. **FAQ** — acordeão com 8 perguntas frequentes (SEO)
13. **Cases** — cards de clientes com logo, setor, descrição, CTA
14. **ConteudoAtualizacoes** — últimos posts do blog + notícias
15. **Cultura** — pilares culturais
16. **CTAFinal** — CTA de encerramento verde escuro

## Componentes globais

| Componente | Localização | Função |
|---|---|---|
| `Header` | `components/site/Header.tsx` | Fixo no topo, transparente na homepage, sólido ao rolar. Inclui botão Recepcionista Ambiental |
| `Footer` | `components/site/Footer.tsx` | 4 colunas + CTA Recepcionista + copyright |
| `PageHero` | `components/site/PageHero.tsx` | Hero das páginas internas (eyebrow + título + subtitle) |
| `PostCard` | `components/site/PostCard.tsx` | Card de post reutilizado em blog e notícias |
| `WhatsAppFab` | `components/site/WhatsAppFab.tsx` | Botão flutuante WhatsApp |
| `ServiceTemplate` | `components/site/ServiceTemplate.tsx` | Template das páginas de serviço |

## Navegação principal (Header)

```
Home | Sobre | Serviços | Blog | Notícias | Cases | Tire suas Dúvidas | Contato
+ botão: [✨ Recepcionista Ambiental] [Atendimento →]
```

## SEO por página

Todas as páginas têm `head()` com:
- `title` — título único por página
- `meta description` — descrição otimizada
- `og:title` e `og:description` — Open Graph

Páginas que ainda precisam de schema markup: todas (implementação futura).

## Dados — estado atual

| Dado | Onde está | Destino final |
|---|---|---|
| Serviços | `lib/services.ts` (hardcoded) | Tabela `services` no Supabase |
| Blog posts | `lib/content.ts` (hardcoded) | Tabela `blog_posts` no Supabase |
| Notícias | `lib/content.ts` (hardcoded) | Tabela `news_posts` no Supabase |
| Cases | `routes/cases.tsx` (hardcoded) | Tabela `cases` no Supabase |
| FAQ | `routes/index.tsx` (hardcoded) | Tabela `faq` no Supabase |
| Imagens | Assets locais | Supabase Storage (bucket `media`) |
