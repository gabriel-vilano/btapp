---
name: pegar-issue
description: Pega uma issue do Linear (ENG-xx ou PRD-xx) e a executa do início ao PR seguindo o protocolo multiagente do LetzPlay. Use quando receber "/pegar-issue <ID>" ou for designado para trabalhar numa issue específica.
---

# /pegar-issue

Executa uma issue do Linear seguindo `docs/AGENT_WORKFLOW.md`. Argumento: o ID da issue (ex.: `ENG-14`, `PRD-1`).

Se as ferramentas do Linear (`mcp__Linear__*`) não estiverem disponíveis na sessão, **pare** e diga isso. Sem o Linear, o protocolo de coordenação não funciona.

## 1. Ler e validar

1. `get_issue` com `includeRelations: true`. Ler título, descrição, projeto, labels e comentários (`list_comments`): comentários podem ter respostas de decisões anteriores.
2. Verificar se pode pegar:
   - Status precisa ser **Todo** (ou **Needs Decision** já respondida, quando retomando). Se estiver em In Progress / Exploring, outro agente está nela: pare e informe.
   - Nenhuma issue em `blocked by` pode estar aberta. Se estiver, pare e informe qual.
   - **Guarda de uso:** se a ferramenta `get_session` existir na sessão, chamar sem `session_id` e olhar o `rate_limit_info`. Parar sem pegar a issue se aparecer qualquer um destes sinais: `utilization` ≥ 0.8 com `rateLimitType` semanal (`seven_day…`); `status` diferente de `allowed`; `isUsingOverage` verdadeiro. Nesse caso, comentar na issue o motivo, sem mudar o status. Regra em `docs/AGENT_WORKFLOW.md` > "Orquestração".
3. Ler os docs que a issue cita e as seções relevantes do `CLAUDE.md`.

## 2. Reivindicar

1. Definir a branch: `<tipo>/<id-minúsculo>-<descricao-curta>`, com o tipo vindo da label (`Feature` → `feature/`, `Bug` → `fix/`, `Refactor` → `refactor/`, `Chore` → `chore/`, `Docs` → `docs/`). Ex.: `fix/eng-6-placar-wo`. Base: `master`, a não ser que a issue indique outra.
   - **Base numa branch de feature?** Confirmar que ela tem o `master` mergeado: `git merge-base --is-ancestor origin/master origin/<feature>`. Se não tiver, a CI não roda nos PRs para ela: comentar na issue e parar, ou mergear o `master` na feature se a issue autorizar.
2. `save_issue` com `state: "In Progress"` (ENG) ou `state: "Exploring"` (PRD) e `assignee: null` (issue em trabalho de agente fica sem responsável).
3. `save_comment`: `Comecei. Branch: <branch>.` + assinatura.

**Assinatura:** todo comentário no Linear termina com `— 🤖 agente <ID>`. Os agentes usam a conta do Gabriel, então sem ela não dá para saber quem escreveu.

## 3. Executar

- Trabalhar **só no escopo** da issue. Descoberta fora do escopo: comentar na issue afetada ou criar issue nova em Backlog (com label `Tipo` e projeto). O PR não cresce.
- Seguir o `CLAUDE.md`: explicar conceitos nos comentários quando útil, testes para fluxo crítico, stories quando o componente pede.
- **Decisão de produto, UX ou domínio?** Comentar no formato da seção "Needs Decision" do `docs/AGENT_WORKFLOW.md`, mover para **Needs Decision**, atribuir ao Gabriel (`assignee: "me"`) e encerrar com um resumo. Não adivinhar a resposta. Se houver trabalho já feito, fazer push da branch antes de parar e citar isso no comentário.

## 4. Validar antes do push

Rodar localmente e corrigir até passar:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:stories   # quando mexer em componente ou story
```

O E2E (`npm run test:e2e`) precisa de Docker e roda só na CI: acompanhar o job E2E no PR.

Reler o próprio diff procurando o que a CI ou um revisor rejeitaria.

## 5. Entregar

**ENG:**

1. Commits em Conventional Commits (prefixo em inglês, descrição em português).
2. `git push -u origin <branch>`.
3. Abrir o PR seguindo `.github/pull_request_template.md`, com `Closes <ID>` na seção "Por que". Título no estilo dos commits. **O único ID de issue no PR (título, corpo e commits) é o da issue que ele fecha.** Qualquer ID citado fica ligado ao PR, e o merge move aquela issue para Done. Outras issues são referenciadas sem ID.
4. Acompanhar a CI. Se falhar: diagnosticar, corrigir e fazer push de novo até ficar verde. Nunca desativar teste para passar.
5. PR desatualizado com o `master` não é trabalho seu: não atualizar a branch só por isso. Conflito é: resolver mergeando o `master` na própria branch, nunca com rebase nem force push.
6. Não fazer merge nem habilitar auto-merge. Quem mergeia é o Gabriel, ou um agente autorizado por ele para um lote (`docs/AGENT_WORKFLOW.md` > "Merge"). Atribuir a issue ao Gabriel (PR para aprovar).

**PRD:**

1. Decisões estáveis vão para `docs/` num PR (mesmo fluxo acima). Rascunho e análise ficam em comentário na issue.
2. Mover para **Needs Decision** e atribuir ao Gabriel, pedindo aprovação da spec. **Ready** só com o ok do Gabriel. No Product nenhuma automação muda status: mesmo com PR de docs mergeado, quem move é o agente.
3. Quando aprovada, propor no comentário a lista de issues de ENG a criar.

## 6. Fechar o ciclo

`save_comment` final na issue:

- o que foi feito e o link do PR;
- o que ficou de fora e para onde foi (issue nova ou comentário);
- descobertas que afetam outras issues (comentar também nelas).
