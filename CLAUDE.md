# CLAUDE.md — LetzPlay

@AGENTS.md
@docs/PRODUCT.md
@docs/GIT_WORKFLOW.md
@docs/TOKENS.md
@docs/AGENT_WORKFLOW.md

## Sobre o projeto

Redesign focado em Beach Tennis do app LetzPlay, uma plataforma de gestão de rankings, torneios e comunidade de esportes de raquete. O objetivo é reconstruir a experiência do jogador competitivo de Beach Tennis com uma interface mais intuitiva e uma arquitetura moderna.

Este é um side project com três objetivos simultâneos: portfolio de Design Engineer, produto real para lançamento, e aprendizado técnico prático. Portanto, o Claude deve agir de forma colaborativa e explicativa — como um professor ensina um aluno — para que o desenvolvedor possa não só executar, mas entender e absorver todos os conceitos.

## Como trabalhar neste projeto

O desenvolvedor é um designer (~4 anos em branding/marketing/gráfico, ~2 anos em UX/UI) em transição para Design Engineer, com domínio de HTML/CSS e noções de JavaScript.

- **Explique o conceito antes de executar.** O objetivo não é só entregar código ou decisões — é garantir que o desenvolvedor entenda cada passo e o porquê.
- **Nomeie os conceitos.** Quando usar um padrão (middleware, server component, RLS policy, hook, JTBD, etc.), diga o nome e explique brevemente.
- **Justifique as escolhas.** Quando houver alternativas, explique por que uma foi escolhida sobre a outra.
- **Não simplifique demais.** Se algo é complexo, diga que é e quebre em partes menores.
- **Conecte com o que já se sabe.** Use analogias com design, Figma e UX sempre que possível.
- **Pergunte antes de assumir.** Se uma decisão impacta design ou experiência, pergunte antes de implementar.
- **O Gabriel decide; o Claude questiona.** O Gabriel é o decisor de produto, negócio e tecnologia. O papel do Claude é de *sparring*: antes de acatar uma decisão, questionar as premissas, apresentar benefícios e riscos de cada abordagem e embasar a discussão em estudos de mercado, pesquisas e outras fontes confiáveis, sempre citadas. Discordar com argumento é esperado. Decidir no lugar do Gabriel, não.

## Filosofia de documentação

Documentamos o que é estável. Decisões, padrões, princípios, hurdles, convenções — coisas que mudam raramente e que, quando mudarem, merecem PR e `git blame`. **Não documentamos estado.** Status de tarefa, progresso de fase, "o que vem depois" volúvel pertence ao tracker (Linear), não ao repo.

**Teste antes de criar ou manter um doc:** "Se eu não atualizar isso por 3 meses, ele ainda estará correto?" Se a resposta é não, é estado disfarçado de documentação. Vai pro tracker.

**Mapa de docs:**

- `CLAUDE.md` — convenções, padrões, hurdles, filosofia
- `docs/PRODUCT.md` — visão, escopo MVP, princípios de design, métricas
- `docs/DISCOVERY.md` — mercado, oportunidades por JTBD ranqueadas por evidência, modelos de negócio, hipóteses do beta
- `docs/TOKENS.md` — design system
- `docs/GIT_WORKFLOW.md` — workflow de branches, PR, versionamento
- `docs/AGENT_WORKFLOW.md` — estrutura do Linear e coordenação de agentes em paralelo
- `src/components/.../Component.mdx` — **fonte única** de documentação por componente (renderizada no Storybook)
- **Linear** (`linear.app/letzplay`) — tarefas, progresso, próximos passos

## Stack técnica

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript 5
- **UI:** React 19
- **Estilização:** CSS customizado com CSS Modules (escopo de componente) + CSS Custom Properties (design tokens)
- **Ícones:** Phosphor Icons (`@phosphor-icons/react`) — sempre via componente `<Icon />`
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Data API, RLS automático)
  - `@supabase/supabase-js` ^2.101.1
  - `@supabase/ssr` ^0.10.0
- **Workshop de componentes:** Storybook 10 (`@storybook/nextjs-vite`) — rodar com `npm run storybook`
- **Testes:** Vitest 4 — `npm test` (unit) e `npm run test:stories` (browser via Playwright); Playwright — `npm run test:e2e` (E2E contra Supabase local, roda na CI)
- **Deploy:** Vercel (deploy automático via GitHub)
- **Repositório:** GitHub (público, `gabriel-vilano/letzplay`) — `master` protegida por ruleset; toda mudança entra via PR com CI verde
- **Tracker de execução:** Linear (`linear.app/letzplay`)
- **IDE:** VS Code com Claude Code (plano Max)

## Convenções de código

### Commits

- **Conventional Commits:** prefixos em inglês, descrição em português
- Letra minúscula após o prefixo, sem ponto final, máximo ~72 caracteres
- **Nunca** incluir `Co-Authored-By` ou trailers de coautoria nos commits
- Exemplos:
  - `feat: adicionar tela de login com autenticação Supabase`
  - `fix: corrigir validação de email no cadastro`
  - `chore: configurar variáveis de ambiente do Supabase`
  - `style: ajustar espaçamento do card de ranking`
  - `refactor: extrair componente de botão reutilizável`
  - `docs: adicionar README com instruções de setup`

### Nomenclatura

- Componentes React: PascalCase (`PlayerCard.tsx`)
- Utilidades: camelCase (`formatDate.ts`)
- Tipos TypeScript: PascalCase (`PlayerProfile`, `TournamentData`)
- Variáveis e funções: camelCase
- Constantes globais: UPPER_SNAKE_CASE
- Pastas: kebab-case

### Regras numéricas

Restrições mensuráveis, otimizadas para que o agente raciocine sobre o código com atenção plena (Read trunca em 2000 linhas; atenção degrada com tamanho do arquivo).

- **Funções:** 4–20 linhas. Acima disso, dividir.
- **Arquivos:** abaixo de 500 linhas, idealmente 200–300. Acima disso, extrair responsabilidades.
- **Indentação:** máximo 2 níveis por função. Preferir early return sobre `else` aninhado.
- **Tipos:** nunca `any`, nunca função sem assinatura tipada, nunca `Record<string, unknown>` quando o shape é conhecido.
- **Nomes:** específicos e únicos. Evitar genéricos (`data`, `handler`, `Manager`, `Service`). Antes de aceitar um nome novo, mentalmente: `grep` por ele retorna < 5 resultados relevantes? Se retorna muito ruído, refinar.
- **Mensagens de exceção:** incluir o valor que causou o problema e o formato esperado. Ex: `` `OTP inválido: recebi '${code}', esperado 8 dígitos numéricos` `` em vez de `"OTP inválido"`.

### Estilo

- Código (variáveis, funções, tipos): inglês
- Comentários: português quando necessário, preferir código autoexplicativo
- Sempre functional components com hooks
- Imports com alias `@/`
- Estilização via CSS Modules: cada componente tem seu `ComponentName.module.css`
- Nunca CSS inline (atributo `style=`), nunca CSS global para componentes
- Design tokens definidos como CSS Custom Properties em `styles/tokens/`
- Nomenclatura BEM dentro dos arquivos `.module.css`: `.card__header`, `.btn--primary`
- Mobile-first, responsivo depois

### Comentários

- **WHY, não WHAT.** Código bem nomeado já diz o que faz. Comentário existe para justificar decisão não óbvia: workaround para bug upstream, constraint de negócio, ordem específica que importa, alternativa que parecia óbvia mas não funciona.
- **Não apagar comentários em refactor.** Se um comentário existe, presume-se que carrega proveniência ou intenção. Em refactor, preservar — só remover quando se confirma que ficou redundante ou errado. Comentário óbvio (`// increment counter`) é exceção e pode ir.
- **Docstrings em funções públicas:** intenção em uma linha + um exemplo de uso quando o uso não for óbvio.
- **Referenciar issues, PRs ou commits** quando uma linha existe por causa de um bug específico ou constraint de lib externa. Ex: `// workaround: supabase-js@2.101 não trata expired session em verifyOtp (#123)`.
- **Não comentar o óbvio.** `i++ // increment i` desperdiça tokens e atenção do agente.

### Ícones

- Lib: `@phosphor-icons/react`
- Sempre via wrapper: `<Icon icon={TrophyIcon} size="md" weight="regular" />`
- **Sempre importar com sufixo `Icon`:** `import { TrophyIcon } from '@phosphor-icons/react'`. Os nomes legados (`Trophy`, `Heart`) ainda funcionam por compatibilidade, mas o padrão moderno da lib é com sufixo — use sempre o novo.
- Cor sempre via `currentColor` — nunca definir cor dentro do componente `Icon`
- Ícones decorativos: `aria-hidden={true}` (default — não precisa declarar)
- Ícones com significado semântico: `aria-label="descrição"` + `aria-hidden={false}`
- Botão com ícone sem texto: `aria-label` vai no `<button>`, não no `<Icon>`
- Ícones customizados de marca: `src/components/icons/` (SVG próprio, fora do Phosphor)
- Referência completa: ver `Icon.mdx` no Storybook (`UI/Icon > Docs`)

## Documentação de componentes

**Fonte única: arquivos `Component.mdx` ao lado de cada componente, renderizados no Storybook.** Não usamos `docs/components/` — foi deprecado e removido em favor de MDX como source of truth.

```
src/components/ui/Button/
  Button.tsx             ← código
  Button.module.css      ← estilo
  Button.stories.tsx     ← stories interativas
  Button.mdx             ← documentação (fonte canônica)
  index.ts
```

Convenção completa de MDX (estrutura de seções, ordem de conteúdo, blocos do Storybook): ver "Storybook > Padrão de documentação MDX" abaixo.

## Storybook

Workshop pra desenvolver e testar componentes em isolamento. Cada componente do DS deve ter sua story conforme evolui.

### Comandos

- `npm run storybook` — sobe dev server em `http://localhost:6006` (o script já usa `--host 0.0.0.0`, então abre pela rede local)
- `npm run build-storybook` — build estática em `storybook-static/`
- `npm run test:stories` — roda cada story como teste no Chromium (Playwright + Vitest browser mode)
- `npm run test:all` — unit + storybook

### Onde ficam as stories

Ao lado do componente, sufixo `.stories.tsx`:

```
src/components/ui/Icon/
  Icon.tsx
  Icon.module.css
  Icon.stories.tsx   ← aqui
  index.ts
```

### Estratégia de cobertura

Adotamos a estratégia **DS + componentes críticos** — não documentamos tudo, documentamos o que tem ROI real.

**Tier 1 — DS primitivos (sempre).** Átomos reutilizáveis. Ex: Button, Icon, FormInput, Alert, Toast, Avatar, TextLink. Storybook é o catálogo do design system.

**Tier 2 — Compostos com estados ocultos (sim).** Moléculas que têm múltiplos estados difíceis de reproduzir em produção (loading, empty, error, edge cases). Ex: PasswordChecklist, OtpInput, ResendTimer, AvatarUpload.

**Tier 3 — Blocos reutilizáveis de feature (sim).** LEGO pieces recombinados em vários contextos. Ex: blocos do feed (CardShell, CardHeader, ScoreBlock).

**Tier 4 — Composições finais (geralmente não).** Cards completos / telas. Quando vale, criar **uma story-galeria** mostrando todas as variantes lado a lado, em vez de uma story por composição.

**Não documentar:** páginas (`app/**/page.tsx`), server components com data fetching, layouts puros sem variantes, componentes one-shot usados em um único lugar sem estados ocultos.

**Heurísticas pra decidir caso a caso:**

1. **Heurística do designer:** "Um designer entregaria um Figma frame só desse componente, com todas as variantes lado a lado, fora de qualquer tela?" Se sim → story.
2. **Heurística dos estados invisíveis:** "Esse componente tem estados que produção raramente exibe — loading, empty, error, texto longo, dado faltando?" Se sim → Storybook é o melhor lugar pra surfar.

**Regra do PR:** ao adicionar/evoluir um componente, perguntar antes do merge: *"Esse componente tem 3 ou mais variantes/estados que valem mostrar lado a lado?"* Se sim, story junto no mesmo PR. Se não, segue sem.

### Padrão de documentação MDX

Cada componente do Tier 1 e Tier 2 ganha um arquivo `Component.mdx` ao lado, **complementando** o `.stories.tsx`:

```
src/components/ui/Button/
  Button.tsx
  Button.module.css
  Button.stories.tsx   ← stories interativas, controls, args
  Button.mdx           ← documentação rica em prose
  index.ts
```

**Por que MDX se já temos auto-docs:** o auto-docs (aba "Docs" gerada do meta) é raso — só descrição + tabela de props + stories embutidas. MDX permite explicar **decisões de design**, **componentes relacionados**, **acessibilidade**, **anti-padrões** — coisas que não cabem em uma description de story.

**Idioma:** títulos de seções e prose em português. Termos técnicos sem tradução natural permanecem em inglês (ex: `Provider`, `hook`, `props`, nomes de tokens CSS, identificadores de código). Sigla `API` mantém. Convenções específicas de DS (`Don'ts`) traduzimos quando há equivalente claro em PT (`Evitar`).

**Inspiração de estrutura:** [Carbon Design System](https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/components/Button/Button.mdx) — adotamos a estrutura por seções (cada variante e cada estado com H2/H3 próprio), `<ArgTypes>` no fim como API, `## References` linkando padrões externos. Diferença: Carbon é DS multi-tenant, então é deliberadamente neutro; o nosso é DS de um produto único, então mantemos **opinião forte** ("uma primary por tela", Don'ts explícitos).

**Imports padrão:**

```mdx
import { Meta, Subtitle, Canvas, ArgTypes } from "@storybook/addon-docs/blocks";
import * as ButtonStories from "./Button.stories";

<Meta of={ButtonStories} />
<Subtitle>Uma linha sobre o propósito do componente.</Subtitle>

**Código-fonte:** [`src/components/ui/Button/Button.tsx`](https://github.com/gabriel-vilano/letzplay/blob/master/src/components/ui/Button/Button.tsx)
```

Sempre incluir o link pro código-fonte no topo, logo após o Subtitle.

**Tabelas em MDX:** usar HTML (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`). Sintaxe markdown de pipes não funciona no Storybook 10 + nextjs-vite atual — `remark-gfm` foi tentado mas o `mdxLoaderOptions` hook não propaga remarkPlugins até o compile final do `@mdx-js/mdx` interno do addon-docs. Inline code em cells via `<code>...</code>`. Reavaliar quando upstream resolver.

**Seções recomendadas (na ordem):**

1. **Visão geral** — parágrafo curto descrevendo propósito + `<Canvas>` da story default. Mostra o componente funcionando antes de explicar.
2. **Variantes** — parágrafo intro + `<Canvas of={Stories.AllVariants} />`, depois um **H3 por variante** com prose + Canvas próprio
3. **Estados** — parágrafo intro + H3 por estado (Loading, Disabled, FullWidth, etc), cada um com prose + Canvas
4. **Anatomia** *(opcional)* — partes visuais nomeadas. Só se o componente não for óbvio (FormInput sim, Button não)
5. **Com ícone** *(quando aplicável)* — H3 separados pra leading e trailing
6. **Quando usar** — bullets com casos de uso centrais
7. **Componentes relacionados** — outros componentes próximos e quando preferir cada um (ex: Button vs ButtonLink vs TextLink), com link via `?path=/docs/ui-componente--docs`
8. **Acessibilidade** — semântica HTML, ARIA, foco, tap target. Citar critérios WCAG quando aplicável
9. **Evitar** — anti-padrões comuns com `❌`. Única seção negativa do MDX; é onde mora a opinião do nosso DS
10. **API** — `<ArgTypes of={Stories} />` (não `<Controls>`; Controls é interativo, ArgTypes é documentação read-only)
11. **Decisões de design** *(opcional)* — formato Q&A: por que essa abordagem em vez de alternativas? (ex: "Por que Phosphor em vez de Lucide?", "Por que wrapper em vez de import direto?"). **Critério estrito: só incluir quando há decisão não-óbvia que justificaria questionamento futuro.** Em componentes onde tudo é convencional, não criar a seção — boilerplate vazio polui mais do que ajuda
12. **Referências** — links pra MDN, WAI-ARIA, WCAG, e referência cruzada com `docs/TOKENS.md`

**Ordem de conteúdo dentro de qualquer seção/subseção: sempre Heading → Prose → Canvas.** O leitor precisa de contexto antes de processar o exemplo visual; mostrar o componente primeiro força o leitor a inferir o que está vendo. A regra vale tanto pro H2 quanto pro H3. **Nunca Canvas → Prose** — sem exceção.

**Toda H2 que tem H3 abaixo deve ter prose intro de 1-2 linhas antes do primeiro H3** — orienta o leitor sobre o que vai encontrar. Se a H2 só tem prose+Canvas (sem H3), aplica direto a regra Heading → Prose → Canvas.

**Não fazer:**

- ❌ Duplicar prose do `parameters.docs.description` da story dentro do MDX — descrições curtas de story são legendas, MDX é a doc principal. Quando MDX existe, mantenha as descriptions curtas e factuais; o "porquê" mora no MDX.
- ❌ Documentar implementação interna (estrutura de CSS, lógica de hook). Foco no consumidor: como usar, quando usar, quando não usar.
- ❌ Criar MDX antes de ter stories — MDX referencia stories via `<Canvas of={...} />`. Stories primeiro, MDX depois.
- ❌ TOC manual — Storybook 10 auto-gera TOC do lado direito a partir dos H2/H3 do MDX.

**`docs/components/` foi deprecado.** MDX é a fonte única de documentação por componente. Decisões de design (rationale, alternativas consideradas) que antes ficavam em `docs/components/<nome>.md` agora vão na seção **Decisões de design** do próprio MDX (item 11 da lista acima), logo antes de Referências.

### Padrão de story

- **Nunca nomear `export const X` igual ao componente importado.** `import { Button } from "./Button"` + `export const Button: Story = ...` quebra com "duplicate declaration". Use nomes das *variantes* — `Primary`, `Secondary`, `WithIcon`, `Loading`. (Boilerplate do Storybook 10.3.6 erra isso — não copiar.)
- Use `satisfies Meta<typeof Component>` no meta pra inferência de tipos das stories
- `args` no meta = defaults; cada story sobrescreve apenas o que precisa
- `argTypes.icon: { control: false }` desabilita o control quando o tipo não é serializável (`React.ElementType`)
- Para showcase de variantes lado a lado, use as utilities `.sb-row`, `.sb-stack`, `.sb-pad` do `.storybook/storybook.css` — não use `style=` inline

### Addons ativos

- **a11y** — cada story passa por axe-core; violações aparecem no painel "Accessibility"
- **vitest** — stories viram testes via `npm run test:stories`
- **docs** — auto-doc com MDX e descriptions de stories
- **chromatic** — preparado pra visual regression (não conectado ainda)

### Decisão de adapter

Usamos `@storybook/nextjs-vite` (não `nextjs` webpack). Vite roda mais rápido, alinha com o pipeline do Vitest e é a direção declarada do time do Storybook. Trade aceito: regras webpack do `next.config.ts` não se aplicam — hoje irrelevante porque o `next.config.ts` não tem regras de webpack (só a guarda de segredos e o `allowedDevOrigins`).

### Sobre RSC e `"use client"`

Storybook + Vite não tem RSC. Stories rodam tudo client-side por default. A regra sobre Phosphor em Server Components (ver "Common hurdles" > "Phosphor em Server Components") vale para o app real, não para as stories — ali nada quebra.

## Supabase

- Row Level Security (RLS) ativo em todas as tabelas
- Sempre definir policies antes de usar uma tabela
- Nunca expor chave secreta no frontend — nem a `service_role` legada nem a secret key (`sb_secret_…`). Toda variável `NEXT_PUBLIC_*` vira texto no JavaScript enviado ao navegador; o `next.config.ts` bloqueia o build se detectar segredo numa delas
- Variáveis de ambiente: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`), lidas só via `getSupabasePublicEnv()` (`src/lib/supabase/env.ts`). A anon key legada (JWT) não é usada
- **Env vars na Vercel:** a integração Supabase ↔ Vercel sincroniza só o ambiente Production, com os segredos marcados como *sensitive*. Preview e Development recebem apenas as variáveis públicas, cadastradas à mão — build de branch (o repo é público) nunca recebe segredo
- **Schema versionado em `supabase/migrations/`.** Toda mudança de schema, policy ou bucket entra como migration — nunca editar direto pelo dashboard. O repo é a fonte de verdade do banco; o dashboard é só leitura
- Migration nasce com `supabase migration new <descricao_em_snake_case>` (gera `<timestamp>_<descricao>.sql`) e entra por PR. **Quem aplica no remoto é o merge na `master`**, via integração GitHub do Supabase (*Deploy to production*). Nunca aplicar à mão (`supabase db push`, `apply_migration` via MCP): o `apply_migration` grava a hora da chamada como versão, diferente do timestamp do arquivo — no merge a integração roda o mesmo SQL de novo e o histórico do banco diverge do repo. Para testar antes do merge: `supabase db reset` local (Docker)
- **Dados mockados primeiro.** O Supabase é ambiente de testes para ver o produto num cenário real, não banco de produção. Features nascem com mocks tipados; tabela nova só entra quando a feature precisa do cenário real

## Insights estratégicos

### Sobre o ecossistema de Beach Tennis

- Rankings são contínuos (semestre), culminando em "Finals" para as 8 melhores duplas
- Torneios são eventos discretos (1-2 dias de fim de semana)
- Marcação de jogos de ranking acontece no WhatsApp, não no app
- O LetzPlay é um app de competição — quem não compete não tem motivo para usá-lo

### Sobre o feed

- Activity Stream (modelo Strava), não rede social
- Conteúdo automático (resultados, inscrições, amizades) é o que engaja
- UGC (publicações próprias) é depreciado no uso
- Cards de resultado são o formato principal

### Sobre o jogador competitivo

- Ranking é o coração emocional do produto — subir motiva, descer frustra
- Dois tipos de consulta a perfil: social (acompanhar amigos) e competitivo (avaliar adversário)
- Frequência de uso alta durante competições, cai entre elas

## Jobs-to-be-done (hipóteses)

Foco: jogador competitivo de Beach Tennis.

1. **Encontrar competição** — "Quando estou sem torneio ou ranking no horizonte, quero encontrar competições compatíveis com meu nível e região, para manter uma agenda ativa."
2. **Saber onde estou no ranking** — "Quando um resultado é registrado, quero ver imediatamente como minha posição foi afetada, para decidir como agir."
3. **Preparar-me para um confronto** — "Quando descubro quem vou enfrentar, quero avaliar o nível e histórico desse jogador, para me preparar."
4. **Acompanhar amigos no BT** — "Quando abro o app no dia a dia, quero ver o que meus amigos estão fazendo, para me manter conectado e descobrir oportunidades."
5. **Sentir que estou evoluindo** — "Quando estou entre competições, quero ver evidências da minha evolução, para me manter motivado."

## Problemas do app atual (audit heurístico)

1. **Consistência visual/semântica** — cores sem lógica, tipografia irregular, componentes sem padrão
2. **Arquitetura de informação** — menu com 19+ itens, busca duplicada, perfil sobrecarregado
3. **Feedback e estados** — login mostra "sessão encerrada", criação de conta sem feedback
4. **Componentes e interações** — filtros sem labels, seletores quebrados, modais sem fechar

## Qualidade e disciplina

### Calibração — onde IA tende a errar

Áreas onde o Claude deve se questionar ativamente, em vez de seguir o impulso natural do modelo:

- **Decisões de arquitetura.** Tendência ao over-engineering — mais camadas, mais abstrações, mais estados do que o problema pede. Antes de propor 4+ estados/camadas, perguntar: "existe versão mais simples?".
- **Conhecimento de domínio.** Beach Tennis, ranking competitivo, JTBDs do jogador — são contextos que o Gabriel conhece e o Claude não. Em decisões com peso de domínio, perguntar antes de assumir.
- **Manter opinião forte em texto.** Tendência a suavizar tudo, "balancear" demais. Quando o Gabriel pede análise crítica, manter a posição.
- **Segurança proativa.** O Claude implementa o caminho feliz quando pedem. Raramente sugere proteções extras (rate limit, validação no boundary, retry com backoff). Se a feature toca dado sensível ou rede, sinalizar explicitamente quais proteções fazem sentido.
- **Priorização.** O Claude executa qualquer pedido com igual entusiasmo, mesmo quando o pedido é secundário. Se o trabalho parece desviar de algo mais importante, perguntar.

### Guardrails (intervenções proativas)

O Claude deve sinalizar proativamente quando:

- Uma feature está sendo implementada sem nenhum teste — perguntar: "Quer que eu crie testes básicos para esse fluxo?"
- Um arquivo passa de ~200 linhas — sugerir extração de responsabilidades
- Uma solução está ficando complexa demais — perguntar: "Existe uma versão mais simples?"
- Houve vários commits de feature sem nenhum refactoring — sugerir pausa para limpeza
- Uma decisão de segurança foi ignorada (ex: dados sensíveis, RLS policy faltando)

### Testes

- **Framework:** Vitest 4. `npm test` roda só o project `unit` (testes node). `npm run test:stories` roda as stories no Chromium. Arquivos `<nome>.test.ts(x)` ao lado do código testado
- **Abordagem equilibrada:** não exige TDD rigoroso, mas todo fluxo crítico ganha teste antes de ser considerado "pronto". Testar imediatamente após implementar — não deixar acumular dívida de teste
- **Prioridade de cobertura:** auth (login, signup, validações), operações de banco (criar perfil, registrar partida), validações de input, e qualquer fluxo que envolva dados sensíveis
- **Server actions:** testar com `vi.mock` em `@/src/lib/supabase/server` (fake de `app/(auth)/actions.test-utils.ts`) e em `next/navigation`, com `redirect` lançando `NEXT_REDIRECT:<url>` como o real. Asserção de redirect: `rejects.toThrow(redirectSignal(url))`
- **E2E:** Playwright em `e2e/`, contra o build de produção e um Supabase local (`supabase start`) com as migrations aplicadas do zero; o código de verificação dos e-mails vem do Mailpit. Roda no job E2E da CI. Sessões de agente não têm Docker: validam pelo resultado desse job no PR, não localmente. Cada teste cria usuário com e-mail único (`uniqueEmail`), e os helpers recusam qualquer Supabase que não seja local
- **Seletores E2E:** preferir `getByLabel`/`getByRole` com `exact: true`. Alerta sempre filtrado pelo texto (`getByRole("alert").filter({ hasText })`): o anunciador de rota do Next também tem `role="alert"`
- **Bug fix → teste de regressão.** Todo bug corrigido ganha um teste que reproduziria o bug, para evitar regressão futura

### Oferecer a versão simples primeiro

Quando propor uma solução, apresentar a versão mínima viável primeiro. Só adicionar complexidade se confirmado que é necessário. Sempre explicar os tradeoffs.

### Checklist pós-implementação (por feature)

- [ ] Feature funcionando em mobile
- [ ] Testes dos fluxos críticos
- [ ] Sem erros de TypeScript (`npm run typecheck`)
- [ ] CLAUDE.md atualizado (se houve novo hurdle ou padrão)
- [ ] Commit seguindo conventional commits

## Common hurdles

Problemas encontrados e suas soluções. Atualizar sempre que resolver algo não-óbvio.

### iOS Chrome/Safari: React não hidrata em `next dev` (Turbopack)

**Sintoma:** Em `npm run dev` acessado do iOS (Chrome/Safari), handlers React não disparam. `onChange` dos inputs não atualiza state (nada de validação inline, nada de `PasswordChecklist`), `onClick` dos botões nativos (`<button>`) não faz nada. `<a>` via `next/link` funciona porque é navegação do browser. Desktop dev funciona normal.

**Causa:** Bug de hidratação do React 19 + Turbopack em dev, específico do WebKit do iOS. Upstream.

**Workaround:** Testar qualquer fluxo sensível a interação no iOS via prod build:

```bash
npm run build && npm start
```

Daí acessar `http://<IP-do-dev>:3000` do celular. Em prod tudo funciona.

**Quando aparecer novamente:** Antes de acreditar que um botão/handler novo está quebrado no iOS, rodar o build prod. Se funcionar lá, é o mesmo hurdle.

### iOS: auto-zoom ao focar inputs

**Sintoma:** iOS Safari/Chrome zoomava ao focar qualquer input porque o `font-size` efetivo era 14px (< 16px).

**Solução:** `export const viewport` em `app/layout.tsx` com `maximumScale: 1, userScalable: false`. iOS 10+ ignora `user-scalable: no` para gestos manuais de pinch, então zoom manual continua funcionando — só o auto-zoom no foco é bloqueado.

### Phosphor Icons: `createContext` em Server Components

**Sintoma:** `createContext only works in Client Components` ao usar um ícone Phosphor em um Server Component.

**Causa:** `@phosphor-icons/react` usa `createContext` internamente. Qualquer import de valor (ex: `import { Handshake } from "@phosphor-icons/react"`) num Server Component dispara o erro.

**Solução:** Adicionar `"use client"` no componente que importa o ícone como valor. O wrapper `<Icon />` é seguro em Server Components porque recebe o ícone como prop (`React.ElementType`) — nunca importa valores do Phosphor diretamente.

**Regra:** todo componente de feed que importa ícones Phosphor precisa de `"use client"`.

### iOS: "sticky hover" em botões com `:hover`

**Sintoma:** Primeiro tap em um elemento com regra `:hover` não dispara `click` no iOS — aplica o estado hover e espera o segundo tap.

**Solução:** Envolver todas as regras `:hover` em `@media (hover: hover)` para que só apliquem em dispositivos com cursor real. Padrão seguido em todos os `.module.css` do DS.

### Phosphor em Server Components

**Sintoma:** ícone do `@phosphor-icons/react` falha quando renderizado num Server Component.

**Causa:** o import padrão do Phosphor usa React Context, que não existe em Server Components (README do pacote, seção "React Server Components and SSR").

**Solução:** o componente que importa o ícone roda no cliente. Ou ele tem `"use client"` (`Toast`, `FormInput`, `AvatarUpload`), ou só é usado dentro de componentes client (`Alert` e `PasswordChecklist`, usados só em páginas de auth com `"use client"`). Num Server Component, importar de `@phosphor-icons/react/ssr`.

### Stack de avatares em duplas no CardHeader

**Sintoma:** CardHeader renderiza só player_a.avatar_url em cards de enrollment duplas.

**Solução pendente:** estender CardHeader para receber player_b quando enrollment_format === 'doubles' e renderizar stack com offset 8px.

**Quando resolver:** ao evoluir o CardHeader para o feed real.

### Componentes com stubs sem comportamento

ProfileMiniCard, H2HButton, botões Torcer e "+ Adicionar" foram implementados como <button> sem onClick.
Quando resolver: plugar handlers e <Link> ao integrar esses componentes com o feed real.

## Regras gerais

- Não instalar dependências sem justificativa clara
- Preferir soluções nativas do Next.js e Supabase
- Sempre tipar dados que vêm do Supabase
- Tratar erros de forma amigável para o usuário
- Testar fluxos em mobile antes de desktop
- Documentar processo para portfolio
