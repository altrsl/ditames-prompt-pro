# BRAND GUIDE — Ditames Ambiental

## Identidade visual

### Paleta de cores (oklch)

| Token CSS | Valor | Uso |
|---|---|---|
| `--primary` | `oklch(0.58 0.14 138)` | Verde principal (#609430) — CTAs, destaques, ícones ativos |
| `--primary-dark` | `oklch(0.42 0.11 138)` | Verde escuro — hover states |
| `--secondary` | `oklch(0.92 0.04 138)` | Verde claro (#DBE7D3) — backgrounds de cards, badges |
| `--background` | `oklch(1 0 0)` | Branco puro — fundo principal |
| `--surface` | `oklch(0.978 0.012 130)` | Off-white levemente verde (#F6F8F4) — seções alternadas |
| `--ink` | `oklch(0.22 0.03 140)` | Verde-escuro quase preto (#1F2A1A) — textos principais |
| `--muted-foreground` | `oklch(0.50 0.01 130)` | Cinza médio — textos secundários |
| `--border` | `oklch(0.90 0.015 130)` | Bordas sutis |

### Tipografia

| Variável | Fonte | Uso |
|---|---|---|
| `--font-display` | Anton, Impact, sans-serif | Títulos H1/H2/H3, `.font-display`, todas as seções uppercase |
| `--font-sans` | Montserrat, system-ui | Corpo de texto, labels, botões |

**Regras tipográficas:**
- Títulos principais: UPPERCASE com `font-display`
- Letter-spacing em títulos: `tracking-widest` ou `tracking-[0.02em]`
- Eyebrows (labels acima de títulos): `text-xs uppercase tracking-[0.2em]` com classe `.eyebrow`
- Corpo: Montserrat regular/medium, `leading-relaxed`

### Sombras

| Token | Uso |
|---|---|
| `shadow-card` | Cards com hover, elementos flutuantes |
| `shadow-glow` | Elementos de destaque com brilho verde |

### Botões

| Classe | Estilo | Uso |
|---|---|---|
| `.btn-primary` | Verde sólido | CTA principal |
| `.btn-outline` | Borda verde, fundo transparente | CTA secundário |
| `.btn-on-dark` | Branco semitransparente | CTAs sobre fundos escuros |

## Tom de comunicação

- **Direto e técnico**, mas acessível
- **Sem juridiquês** — linguagem que leigos entendem
- **Acolhedor** para quem está em situação de pressão (multa, notificação)
- **Autoridade sem arrogância** — empresa que sabe o que faz e transmite segurança
- Verbos de ação: "conduzimos", "resolvemos", "identificamos", "regularizamos"
- Nunca transmitir imagem de escritório de advocacia

## Elementos visuais recorrentes

- **Padrão topo (topo-bg):** linhas diagonais em verde sutil — identidade nas seções destacadas
- **Grid overlay em imagens:** grade verde 1px semitransparente
- **Eyebrow:** label pequena uppercase acima do título principal de cada seção
- **Counters animados:** números que contam ao entrar na viewport (seção Números)
- **Reveal animation:** elementos que aparecem com fade ao entrar na viewport (classe `.reveal`)

## O que NÃO alterar

- Paleta de cores
- Fontes (Anton + Montserrat)
- Padrão eyebrow + título uppercase
- Estrutura visual das seções (proporções, espaçamentos)
- Tom de voz institucional
- Identidade como empresa de soluções, não escritório jurídico
