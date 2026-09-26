# GIT_WORKFLOW.md — LetzPlay

Guia de workflow Git do projeto. Define estrutura de branches, fluxo de trabalho, versionamento e boas práticas.

> Convenções de commits (prefixos, formato, idioma) estão no `CLAUDE.md`, seção "Commits".

---

## Estrutura de branches

```
master (branch principal, sempre estável)
  ├── branches temporárias por feature/fix/chore/docs
  └── feature/<nome> (integração de uma feature grande, quando preciso)
        └── branches temporárias das issues dessa feature
```

Não utilizamos branches de ambiente (develop, staging, etc). O projeto segue um modelo simples: `master` é a fonte de verdade, e **todo** trabalho acontece em branches temporárias que voltam via PR — inclusive docs e config. A `master` é protegida e não aceita push direto (ver "Proteção de branch").

**Branch de feature (integração):** quando uma feature precisa de vários PRs antes de chegar ao `master` (ex.: `feature/feed-cards`), os PRs das issues dela apontam para a branch de feature. Ela funciona diferente do `master`:

- não tem ruleset: o GitHub não barra merge com CI vermelha nela;
- push nela não roda CI. A CI só roda nos PRs para ela, e só se ela tiver o `master` mergeado (senão falta o `ci.yml`).

O portão completo acontece no PR final da feature para o `master`.

---

## Convenção de nomes de branch

```
<tipo>/<descrição-curta>
```

| Tipo        | Quando usar                            | Exemplo                             |
| ----------- | -------------------------------------- | ----------------------------------- |
| `feature/`  | Nova funcionalidade                    | `feature/auth`                      |
| `fix/`      | Correção de bug                        | `fix/login-validation`              |
| `chore/`    | Config, dependências, CI               | `chore/setup-github-actions`        |
| `refactor/` | Reestruturação sem mudar comportamento | `refactor/extract-button-component` |
| `docs/`     | Documentação significativa             | `docs/api-reference`                |

Regras:

- Sempre kebab-case
- Curto e descritivo (2-4 palavras)
- Quando há issue no Linear, o ID vem logo após o tipo: `<tipo>/<id>-<descrição>`, ex.: `fix/eng-6-placar-wo`. O ID liga a branch e o PR à issue pela integração GitHub ↔ Linear, que move o status sozinha (PR aberto → In Review, merge → Done)
- No PR, incluir `Closes <ID>` na descrição

---

## Fluxo de trabalho

Toda mudança — feature, fix, refactor, docs ou config — segue o mesmo caminho:

```bash
# 1. Garantir que master está atualizada
git checkout master
git pull

# 2. Criar branch
git checkout -b feature/auth

# 3. Trabalhar e commitar
git add <arquivos>
git commit -m "feat: adicionar tela de login"

# 4. Push e abrir PR (o template preenche a descrição)
git push -u origin feature/auth

# 5. CI verde → merge → limpar
git checkout master
git pull
git branch -d feature/auth
```

**Por que até docs passam por PR:** com agentes trabalhando de forma autônoma, o PR é o ponto único onde a CI roda e onde fica o registro rastreável de cada mudança. Um PR de docs custa ~2 minutos de CI — preço baixo por um histórico consistente.

---

## Pull requests

### Formato

- Título curto (< 70 caracteres), seguindo o estilo dos commits
- Descrição com:
  - **O que** foi feito (resumo em 1-3 bullets)
  - **Por que** (contexto, JTBD relacionado)
  - **Como testar** (passos para verificar)
- O template em `.github/pull_request_template.md` já traz essas seções e um checklist — é preenchido automaticamente ao abrir o PR

### CI

GitHub Actions (`.github/workflows/ci.yml`) roda em todo PR e em todo push na `master`, em três jobs paralelos:

- **Lint, testes e build** — `npm run lint`, `npm run typecheck` (tipos do projeto inteiro, testes inclusive), `npm test`, `npm run build` (o build checa os tipos só do código do app)
- **Stories** — `npm run test:stories` no Chromium, incluindo o addon de a11y
- **E2E** — `npm run test:e2e`: fluxos de auth no Chromium (viewport 430px) contra um Supabase local com as migrations aplicadas do zero

Só mergear com a CI verde.

### Merge

- Merge via GitHub (botão "Merge pull request")
- Preferir **merge commit** (não squash) para manter o histórico de commits da branch
- **PR desatualizado** (o `master` andou depois da última CI do PR): o ruleset exige atualizar antes do merge. Clicar em **Update branch → Update with merge commit**, esperar a CI e mergear. Nunca usar "Update with rebase", que reescreve os commits da branch e quebra o checkout do agente dono dela
- **Atualização just-in-time:** só se atualiza o PR que vai ser mergeado agora. Atualizar todos a cada merge gasta CI em PRs que vão ficar desatualizados de novo no merge seguinte
- **Conflito:** o GitHub não oferece o "Update branch". Quem resolve é o dono da branch, mergeando o `master` nela (nunca rebase nem force push)
- **Auto-merge desligado de propósito** (Settings → General → "Allow auto-merge"): ele mergeia a versão que estiver no PR quando a CI ficar verde, inclusive um push de agente feito depois da revisão. Com a opção desligada, nenhum agente consegue habilitá-lo
- Deletar a branch após merge

### Deploy

O merge na `master` publica sozinho:

- **Vercel** faz o build de produção do app (cada branch também ganha um deploy de preview)
- **Supabase** aplica as migrations novas de `supabase/migrations/` (integração GitHub, *Deploy to production*)

Por isso o PR é o único caminho de uma migration até o banco — revisar o SQL no PR como código de produção.

---

## Versionamento

Semver simplificado com tags Git. Prefixo `v`, começando em pré-release (`0.x.x`).

```
v0.MINOR.PATCH

MINOR → nova feature ou marco do roadmap
PATCH → fix ou ajuste dentro de uma feature
```

### Como criar uma tag

```bash
git checkout master
git tag -a v0.1.0 -m "Fundação: setup inicial e design system"
git push origin v0.1.0
```

---

## Proteção de branch

O repositório é **público** — requisito para que rulesets sejam aplicados sem plano pago do GitHub, e coerente com o objetivo de portfolio. Por ser público, **nunca commitar segredos**: `.env*` fica no `.gitignore`, só o `.env.example` (vazio) é versionado.

Ruleset `master` (Settings → Rules → Rulesets), aplicado à branch padrão:

- **Require a pull request before merging** — sem push direto na `master`
- **Require status checks to pass** — `Lint, testes e build`, `Stories (Storybook + a11y)` e `E2E (Playwright + Supabase local)`
- **Block force pushes** e **Restrict deletions** — protegem o histórico
- **Require branches to be up to date:** ativado. Com vários agentes em paralelo, cada PR passa na CI completa (E2E incluído) sobre o `master` atual antes do merge: o que foi testado é exatamente o que entra, e migrations de PRs diferentes são testadas juntas antes de chegar ao Supabase. O custo é que os merges viram fila: cada PR depois do primeiro espera uma rodada de CI (~3 min). O fluxo está em "Pull requests" > "Merge"
- **Require reviews:** desativado (projeto solo — a CI é o portão de qualidade)
- **Bypass list:** só o admin do repositório, para emergências

Se um check novo for adicionado à CI, incluí-lo também na lista de checks obrigatórios do ruleset.

A CI de um PR roda sobre o merge da branch com a base, não sobre a branch sozinha: um job novo no `master` aparece em qualquer PR no próximo push, mesmo que a branch ainda tenha o `ci.yml` antigo. PR sem push desde que o job entrou fica sem o check: um push novo (ou mergear o `master` na branch) resolve.

---

## Worktrees

Git worktrees permitem ter múltiplas branches checadas simultaneamente em diretórios separados. Útil para paralelismo com Claude Code.

### Quando usar

- Claude trabalhando em uma feature enquanto você trabalha em outra
- Testar uma ideia experimental sem afetar a branch atual
- Dois agentes Claude em paralelo em features independentes

### Quando NÃO usar

- Trabalho sequencial (uma coisa de cada vez) → branch normal
- Features que dependem uma da outra → fazer em sequência
- Aprendizado hands-on → fazer na branch, sem delegação

### Como usar com Claude Code

```bash
# Claude trabalha em ranking enquanto você trabalha em auth
claude --worktree feature-ranking

# Worktrees ficam em .claude/worktrees/
# Cleanup automático quando não há mudanças
```

### Cuidados

- Cada worktree precisa do próprio `npm install`
- Arquivos `.env` não são copiados automaticamente
- Uma branch só pode estar em uma worktree por vez
