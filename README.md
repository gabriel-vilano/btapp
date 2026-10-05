# BT App

Plataforma de gestão de rankings, torneios e comunidade de esportes de raquete, com foco no jogador competitivo de Beach Tennis. Pensada a partir do que as plataformas existentes fazem, propõe otimizações nos fluxos do jogador, funcionalidades novas e, potencialmente, objetivos de mercado novos.

> Side project com três objetivos simultâneos: portfolio de Design Engineer, produto real para lançamento, aprendizado técnico prático.

## Stack

Next.js 16 (App Router) · TypeScript 5 · React 19 · CSS Modules + Custom Properties · Supabase (Auth, PostgreSQL, Storage, RLS) · Vercel (deploy automático) · Vitest · Storybook 10 · Playwright.

## Setup

```bash
git clone <repo-url>
cd <repo>
npm install
cp .env.example .env.local
# preencher .env.local com as credenciais do Supabase
npm run dev
```

App disponível em [http://localhost:3000](http://localhost:3000). O `dev` roda com host `0.0.0.0` para permitir testes em mobile via IP local da rede.

## Comandos

| Comando                   | O que faz                                          |
| ------------------------- | -------------------------------------------------- |
| `npm run dev`             | Dev server (host `0.0.0.0`)                        |
| `npm run build`           | Build de produção                                  |
| `npm start`               | Roda o build localmente                            |
| `npm run lint`            | ESLint                                             |
| `npm run typecheck`       | Checagem de tipos do projeto inteiro (`tsc`)       |
| `npm test`                | Testes unitários (Vitest)                          |
| `npm run test:stories`    | Stories como testes no Chromium, com checagem a11y |
| `npm run test:all`        | Unitários + stories                                |
| `npm run test:e2e`        | Testes E2E (Playwright + Supabase local)           |
| `npm run storybook`       | Storybook em `http://localhost:6006`               |
| `npm run build-storybook` | Build estática do Storybook em `storybook-static/` |

### Testes E2E

Os testes de `e2e/` rodam contra o build de produção e um Supabase local, com os e-mails capturados pelo Mailpit. Precisam do [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) e do Docker rodando. Na CI, o job E2E faz tudo isso sozinho.

```bash
supabase start                                    # sobe o Supabase local e aplica as migrations
export $(bash scripts/supabase-e2e-env.sh | xargs)  # aponta o app e os testes para o Supabase local
npm run build
npm run test:e2e
```

O build fica apontado para o Supabase local. Para voltar ao `.env.local`, abra outro terminal e rode `npm run build` de novo.

## Variáveis de ambiente

Copiar `.env.example` para `.env.local` e preencher:

| Variável                               | Descrição                                                          |
| -------------------------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL do projeto Supabase                                            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_…`), pública por design — RLS protege os dados |

Nunca coloque a secret key (`sb_secret_…`) nem a `service_role` numa variável `NEXT_PUBLIC_*`: ela iria para o JavaScript do navegador. O build falha de propósito se detectar isso.

## Onde olhar para entender o projeto

| Documento              | Conteúdo                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `CLAUDE.md`            | Modo de trabalho, convenções, guardrails, hurdles que valem sempre e o mapa de docs. Onboarding completo |
| `.claude/rules/`       | Regras por área (Storybook e MDX, componentes, ícones, CSS, Supabase, testes, patch do Next), carregadas pelo agente ao mexer nos arquivos da área |
| `docs/PRODUCT.md`      | Visão do produto, escopo do MVP, princípios de design, métricas de sucesso              |
| `docs/TOKENS.md`       | Design system: tokens primitivos, semânticos, padrões de implementação                  |
| `docs/GIT_WORKFLOW.md` | Estrutura de branches, fluxo de PR, versionamento                                       |
| `docs/AGENT_WORKFLOW.md` | Coordenação de agentes em paralelo: Linear, ciclo de uma issue, merge e orquestração  |
| `src/components/**/*.mdx` | Documentação de cada componente (renderizada no Storybook)                         |
| `supabase/migrations/` | Schema do banco versionado (tabelas, policies, buckets)                                 |

## Planejamento

Tracking de execução fica no **Linear** (workspace privado). Decisões duráveis ficam em markdown no repo (`CLAUDE.md`, `docs/`).

## Hurdles conhecidos

Problemas resolvidos e seus workarounds: os que valem sempre estão no `CLAUDE.md`, seção "Armadilhas que valem sempre"; os de uma área, na regra dela em `.claude/rules/`. Atualizar sempre que resolver algo não-óbvio.
