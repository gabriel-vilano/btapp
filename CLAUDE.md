# CLAUDE.md

@AGENTS.md
@docs/PRODUCT.md

## Sobre o projeto

Redesign de uma plataforma de rankings, torneios e comunidade de Beach Tennis, focado no jogador competitivo (visão, escopo e JTBD em `docs/PRODUCT.md`). Side project com três objetivos: portfolio de Design Engineer, produto real para lançamento e aprendizado técnico prático.

O desenvolvedor, Gabriel, é designer (~4 anos em branding e gráfico, ~2 em UX/UI) em transição para Design Engineer, com domínio de HTML/CSS e noções de JavaScript.

## Modo de trabalho

**Sessão autônoma.** Sessão aberta por `/pegar-issue` ou `/orquestrar` é autônoma: segue `docs/AGENT_WORKFLOW.md`, executa sem pedir permissão a cada passo e não explica conceito antes de agir. **Sessão interativa** (o Gabriel conversando) mantém o modo professor: explica o conceito antes de executar, nomeia o padrão (middleware, RLS policy, hook, JTBD), justifica a escolha, conecta com Figma e UX e não simplifica demais o que é complexo.

**Contexto antes de agir.** Antes de escrever, leia a issue, os comentários, o projeto e os docs que ela cita. Se faltar contexto para decidir, pergunte: não preencha a lacuna com palpite.

**Inferência crítica é pergunta (Needs Decision).** Pare e pergunte, no formato de `docs/AGENT_WORKFLOW.md`, quando a decisão for: regra de domínio de Beach Tennis ou de ranking; mudança que o jogador vê na tela e custa refazer; RLS, segurança ou dado sensível; mudança do escopo da issue; nome, identidade ou questão jurídica; ação difícil de desfazer ou voltada para fora (merge, migration, publicar).

**Inferência barata de trocar é Leitura.** O que se corrige depois do merge sem custo você decide e registra em "Leituras para o Gabriel conferir", no PR e no comentário final.

**O Gabriel decide produto, negócio e tecnologia; você questiona.** Antes de acatar, questione as premissas, mostre benefício e risco de cada caminho e cite a fonte. Discordar com argumento é esperado; decidir no lugar dele, não. Mantenha a posição em análise crítica, em vez de suavizar.

**Onde a IA erra (questione-se):** over-engineering (antes de propor 4+ estados ou camadas, procure a versão mais simples); domínio de Beach Tennis (o Gabriel conhece, você não); segurança proativa (rate limit, validação no boundary, retry com backoff em feature que toca dado sensível ou rede); priorização (se o pedido desvia de algo mais importante, diga).

## Stack e comandos

Next.js 16 (App Router, ler `node_modules/next/dist/docs/` antes de usar API nova), React 19, TypeScript 5, CSS Modules + CSS Custom Properties (tokens em `styles/tokens/`), Phosphor Icons via `<Icon />`, Supabase (Auth, Postgres, Storage, RLS; `@supabase/ssr`), Storybook 10 (`@storybook/nextjs-vite`), Vitest 4, Playwright. Deploy na Vercel; repositório público no GitHub, `master` protegida (toda mudança por PR com CI verde). Tracker: Linear (workspace privado).

- `npm run dev` · `npm run build && npm start` (build de produção)
- `npm run lint` · `npm run typecheck` · `npm test` (unit)
- `npm run test:stories`: na nuvem, `CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium npm run test:stories`
- `npm run test:e2e`: precisa de Docker (Supabase local), roda na CI
- `npm run storybook` (porta 6006)

## Convenções de código

**Nomes.** Componente em PascalCase (`PlayerCard.tsx`), utilidade em camelCase (`formatDate.ts`), tipo em PascalCase, variável e função em camelCase, constante global em UPPER_SNAKE_CASE, pasta em kebab-case. Código em inglês; comentário em português.

**Regras numéricas** (o Read trunca em 2000 linhas e a atenção do agente cai com o tamanho):

- Funções de 4 a 20 linhas; acima, dividir. Arquivos abaixo de 500 linhas, idealmente 200 a 300.
- Indentação de no máximo 2 níveis por função; early return em vez de `else` aninhado.
- Nunca `any`, nunca função sem assinatura tipada, nunca `Record<string, unknown>` quando o shape é conhecido.
- Nomes específicos: se um `grep` pelo nome devolve 5+ resultados de ruído, refinar (evitar `data`, `handler`, `Manager`, `Service`).
- Mensagem de exceção com o valor recebido e o formato esperado: `` `OTP inválido: recebi '${code}', esperado 8 dígitos numéricos` ``.

**Estilo.** Functional components com hooks; imports com alias `@/`; cada componente com seu `ComponentName.module.css`, BEM dentro dele (`.card__header`, `.btn--primary`); nunca CSS inline (`style=`) nem CSS global para componente; mobile-first. Regras de CSS, tokens, ícones e componentes ficam nas regras de `.claude/rules/` (mapa abaixo).

**Comentários.** WHY, não WHAT: só para decisão não óbvia (workaround, constraint de negócio, ordem que importa, alternativa que não funciona). Não apague comentário em refactor, salvo quando ficou redundante ou errado. Docstring em função pública: intenção em uma linha e um exemplo quando o uso não é óbvio. Linha que existe por causa de um bug cita a issue, o PR ou o commit.

**Commits.** Conventional Commits: prefixo em inglês, descrição em português, minúscula depois do prefixo, sem ponto final, ~72 caracteres (ex.: `feat: adicionar tela de login com autenticação Supabase`). O hook `commit-msg` (`.githooks/`) valida o formato e remove a coautoria.

## Marca

O nome do produto só entra no código por `src/lib/brand.ts`. Em `src/`, `app/` e `e2e/` (TS, TSX e MDX), nenhum literal do nome: nem em UI, nem em texto que sai do app (mensagem do WhatsApp, título do compartilhamento), nem em teste, story ou MDX (`{brand.name}` funciona em MDX). Fora do TypeScript, onde não dá para importar, o literal é permitido só nos lugares da lista do comentário de `brand.ts`. Docs não repetem o nome: só `README.md` e `docs/PRODUCT.md` o dizem; os outros escrevem "o produto". O teste `brand.guard.test.ts` varre o repo todo e reprova o PR que descumprir, e também qualquer menção ao nome antigo.

## Supabase: o que não pode falhar

- RLS ativo em toda tabela, com as policies definidas antes de usar a tabela. Dado que vem do Supabase é sempre tipado.
- Nunca segredo no frontend (`service_role` nem `sb_secret_…`): toda `NEXT_PUBLIC_*` vira texto no JavaScript do navegador, e o `next.config.ts` bloqueia o build se achar segredo numa delas.
- Schema, policy e bucket só por migration em `supabase/migrations/`, que entra por PR. Quem aplica no remoto é o merge na `master`; nunca aplicar à mão (`supabase db push`, `apply_migration` via MCP). O dashboard é só leitura.
- Dados mockados primeiro: feature nasce com mocks tipados; tabela nova só quando a feature precisa do cenário real.
- Detalhe (env vars, Vercel, como criar a migration) em `.claude/rules/supabase.md`.

## Testes

- Todo fluxo crítico ganha teste antes de ser "pronto", logo depois de implementar. Prioridade: auth, operações de banco, validação de input e fluxo com dado sensível.
- Bug corrigido ganha teste de regressão que reproduziria o bug.
- Arquivo `<nome>.test.ts(x)` ao lado do código. Sessão de agente não tem Docker: o E2E se valida pelo job E2E do PR.
- Server actions, E2E e diagnóstico de falha em `.claude/rules/testes.md`; stories e `play` em `.claude/rules/storybook.md`.

## Guardrails

Sinalize, sem esperar que peçam:

- feature sem teste ("Quer que eu crie testes básicos para esse fluxo?");
- arquivo passando de ~200 linhas (sugerir extrair responsabilidades);
- solução ficando complexa ("existe uma versão mais simples?"): ofereça a mínima primeiro, com os trade-offs;
- RLS, segurança ou dado sensível ignorados;
- vários commits de feature sem refactor (sugerir pausa para limpeza);
- dependência nova sem justificativa clara: prefira o nativo do Next.js e do Supabase.

Checklist por feature:

- funciona no mobile (testar no mobile antes do desktop) e trata erro com mensagem amigável ao usuário;
- testes dos fluxos críticos; `npm run typecheck` limpo;
- `CLAUDE.md` ou a regra da área atualizados se surgiu hurdle ou padrão novo; processo documentado para o portfolio.

Regras inegociáveis:

- **Não acesse o incumbente** (a plataforma que inspirou o produto): nem páginas, área logada ou API, com nenhuma ferramenta. Os Termos de Uso dela proíbem acesso automatizado; domínio, cláusula e data estão no documento "Regra de acesso ao incumbente" do Linear (projeto Discovery e estratégia). Precisa de algo dela? Peça prints ao Gabriel.
- **Nunca** rebase, force push, `git reset --hard` nem auto-merge. Conflito se resolve com `git merge origin/master`; quem mergeia é a orquestradora ou o Gabriel (`docs/AGENT_WORKFLOW.md` > "Merge").

## Armadilhas que valem sempre

- **iOS não hidrata em `next dev`.** No iOS (Chrome e Safari), o React 19 + Turbopack em dev não hidrata: `onChange` e `onClick` não disparam, só `<a>` navega. Antes de achar que um handler está quebrado no iOS, testar com `npm run build && npm start` e abrir `http://<IP>:3000`. Bug upstream. Origem não localizada (anterior ao histórico do repo).
- **Next com patch.** `patches/next+16.2.2.patch` (`patch-package` no `postinstall`) corrige a tela em branco depois de clicar num `<Link>` com prefetch em voo ([vercel/next.js#98684](https://github.com/vercel/next.js/issues/98684)). Não atualizar o `next` sem ler `.claude/rules/next-patch.md`. Origem: PR #142.

## Mapa de docs e de regras

Documentamos o que é estável (decisão, padrão, princípio, hurdle, convenção), que muda raramente e merece PR e `git blame`. **Estado não se documenta:** status, progresso e "o que vem depois" moram no Linear. Teste: "se eu não atualizar isso por 3 meses, ainda estará correto?" Se não, é estado.

- `docs/PRODUCT.md`: visão, escopo do MVP, princípios de design, JTBD, contexto do esporte, métricas
- `docs/DISCOVERY.md` e `docs/discovery/`: mercado, oportunidades por JTBD ranqueadas por evidência, hipóteses do beta (a evidência bruta mora no Linear, projeto Discovery e estratégia)
- `docs/DOMAIN.md`: glossário, relações, regras R1…, máquina de estados da partida
- `docs/PROFILE.md` (PF1…), `docs/SCHEDULING.md` (M1…), `docs/RESULTS.md` (RG1…), `docs/NAVIGATION.md` (N1…), `docs/EXPLORE.md` (EX1…), `docs/HEAD_TO_HEAD.md` (HH1…), `docs/RANKING.md` (RK1…), `docs/ROUND_DRAW.md` (SR1…), `docs/FEED_CARDS.md`: specs de tela e fluxo
- `docs/TOKENS.md`: design system (arquitetura CSS, tokens, escala tipográfica)
- `docs/GIT_WORKFLOW.md`: branches, PR, CI, merge, versionamento
- `docs/AGENT_WORKFLOW.md`: Linear, Needs Decision, coordenação de agentes, merge, acesso ao incumbente
- `src/components/.../Component.mdx`: fonte única da documentação de cada componente (Storybook)

Regras com `paths` (`.claude/rules/`), carregadas ao ler os arquivos correspondentes. Nas três marcadas com *hook*, o `.claude/hooks/require-rule-read.mjs` barra a primeira escrita num arquivo que casa até a regra ser lida:

- `storybook.md`: stories, estratégia de cobertura, `play`, padrão de MDX (`*.stories.tsx`, `*.mdx`, `.storybook/`). *Hook*
- `componentes.md`: onde mora cada componente e a regra dos grupos (`src/components/`). *Hook*
- `icones.md`: wrapper `<Icon />`, sufixo `Icon`, Phosphor em Server Component (`.tsx`)
- `css.md`: regras do DS, state layers, foco, tap target, hurdles de CSS no iOS (`.css`)
- `supabase.md`: migrations e env vars (`supabase/`, `src/lib/supabase/`, server actions). *Hook*
- `testes.md`: server actions, E2E e diagnóstico de falha na CI (testes, `e2e/`)
- `next-patch.md`: o patch do Next e como atualizar (`patches/`, `package.json`, `next.config.ts`)

Skills em `.claude/skills/`: `/pegar-issue` e `/orquestrar` (fluxo dos agentes); de UI, `revisar-interface`, `movimento`, `polir-interface`, `mobile-nativo` e `decisoes-mobile` (cada `description` diz quando roda).
