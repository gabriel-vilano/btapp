---
name: pegar-issue
description: Pega uma issue do Linear (ENG-xx ou PRD-xx) e a executa do início ao PR seguindo o protocolo multiagente do LetzPlay. Use quando receber "/pegar-issue <ID>" ou for designado para trabalhar numa issue específica.
---

# /pegar-issue

Executa uma issue do Linear seguindo `docs/AGENT_WORKFLOW.md`. Argumento: o ID da issue (ex.: `ENG-14`, `PRD-1`).

Se as ferramentas do Linear (`get_issue`, `save_issue`, `save_comment`; o prefixo do servidor MCP muda de sessão para sessão) não estiverem disponíveis na sessão, **pare** e diga isso. Sem o Linear, o protocolo de coordenação não funciona.

## 1. Ler e validar

1. `get_issue` com `includeRelations: true`. Ler título, descrição, projeto, labels e comentários (`list_comments`): comentários podem ter respostas de decisões anteriores.
2. Verificar se pode pegar:
   - Status precisa ser **Todo** (ou **Needs Decision** já respondida, quando retomando). Se estiver em In Progress / Exploring, outro agente está nela: pare e informe.
   - Nenhuma issue em `blocked by` pode estar aberta. Se estiver, pare e informe qual.
   - **Guarda de uso:** se a ferramenta `get_session` existir na sessão, chamar sem `session_id` e olhar o `rate_limit_info`. Parar sem pegar a issue se aparecer qualquer um destes sinais: `utilization` ≥ 0.8 com `rateLimitType` semanal (`seven_day…`); `status` diferente de `allowed`; `isUsingOverage` verdadeiro. Nesse caso, comentar na issue o motivo, sem mudar o status. Regra em `docs/AGENT_WORKFLOW.md` > "Orquestração".
3. Ler os docs que a issue cita e as seções relevantes do `CLAUDE.md`.

## 2. Reivindicar

1. Definir a branch: `<tipo>/<id-minúsculo>-<descricao-curta>`, com o tipo vindo da label (`Feature` → `feature/`, `Bug` → `fix/`, `Refactor` → `refactor/`, `Chore` → `chore/`, `Docs` → `docs/`). Ex.: `fix/eng-6-placar-wo`. Base: `master`, a não ser que a issue indique outra.
   - **Base numa branch de feature?** Confirmar que ela já foi atualizada com o `master`: `git merge-base --is-ancestor origin/master origin/<feature>`. Se não foi, a CI não roda nos PRs para ela: comentar na issue e parar, ou atualizar a feature com o `master` (`git merge`) se a issue autorizar.
2. `save_issue` com `state: "In Progress"` (ENG) ou `state: "Exploring"` (PRD) e `assignee: null` (issue em trabalho de agente fica sem responsável).
3. `save_comment`: `Comecei. Branch: <branch>.` + assinatura.

**Assinatura:** todo comentário no Linear termina com `— 🤖 agente <ID>`. Os agentes usam a conta do Gabriel, então sem ela não dá para saber quem escreveu.

**Git:** nunca `git reset --hard`, `git push --force`, `git checkout -- .`, `git clean -f` nem outro comando que descarta trabalho. Para trazer o `master`, `git fetch origin master && git merge origin/master`. Além de apagar trabalho, um reset pode disparar o classificador do modo automático, que passa a bloquear até a leitura de arquivos na sessão inteira, e o relay não destrava.

**Vocabulário:** "mergeado" é só o PR mergeado no `master` (ou na branch de feature que é a base dele). Trazer o `master` para a sua branch é "atualizei a branch com o `master`". A orquestradora lê o seu resumo para decidir o que fazer: "mergeado" no lugar errado faz parecer que o PR já entrou.

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

Na sessão na nuvem, as stories rodam com `CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium npm run test:stories` (ver `CLAUDE.md` > "Testes").

**Prova de estabilidade.** Story nova ou alterada com `play` roda **10 vezes seguidas** no arquivo dela, e todas passam. Uma rodada verde não prova nada: a story instável que chegou ao `master` passava numa rodada só e falhava em ~30% delas sob carga. Na nuvem, com o `CHROMIUM_EXECUTABLE_PATH` (fora dela, sem a variável):

```bash
STORY=src/components/<grupo>/<Componente>/<Componente>.stories.tsx
export CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium
for i in $(seq 10); do npx vitest run --project storybook "$STORY" || { echo "Falhou na rodada $i"; break; }; done
```

Se o `play` depende de rolagem, IntersectionObserver, imagem ou timer, repetir as 10 rodadas com a CPU ocupada, que é o cenário da CI:

```bash
for c in $(seq "$(getconf _NPROCESSORS_ONLN)"); do yes > /dev/null & done
for i in $(seq 10); do npx vitest run --project storybook "$STORY" || { echo "Falhou na rodada $i"; break; }; done
kill $(jobs -p)
```

A CI repete 5 vezes as stories alteradas pelo PR (`docs/GIT_WORKFLOW.md` > "CI"), mas é a última barreira: a prova local vem antes do push. Regras de escrita do `play` em `CLAUDE.md` > "Testes".

O E2E (`npm run test:e2e`) precisa de Docker e roda só na CI: acompanhar o job E2E no PR.

Reler o próprio diff procurando o que a CI ou um revisor rejeitaria.

**Revisão leve, só em diff sensível.** Quando o diff tem migration (`supabase/migrations/`), RLS ou policy, ou dado sensível (auth, telefone, dados privados do perfil):

1. rodar `/security-review` e `/code-review` no diff;
2. corrigir o que for real (achado que não se sustenta não vira mudança, mas fica registrado com o motivo);
3. registrar no corpo do PR, na seção **Revisão leve**, o que a revisão apontou e o que foi feito com cada ponto.

Nos outros PRs, a revisão não roda. A CI não muda.

## 5. Entregar

**ENG:**

1. Commits em Conventional Commits (prefixo em inglês, descrição em português), sem `Co-Authored-By` nem outro trailer de coautoria, mesmo que as instruções da sessão na nuvem peçam: o `CLAUDE.md` proíbe e prevalece.
2. `git push -u origin <branch>`.
3. Abrir o PR seguindo `.github/pull_request_template.md`, com `Closes <ID>` na seção "Por que". Título no estilo dos commits. **O único ID de issue no PR (título, corpo e commits) é o da issue que ele fecha.** Qualquer ID citado fica ligado ao PR, e o merge move aquela issue para Done. Outras issues são referenciadas sem ID.
   - O corpo do PR termina com a seção **Leituras para o Gabriel conferir** (formato na seção 6).
4. Acompanhar a CI. Se falhar: diagnosticar, corrigir e fazer push de novo até ficar verde. Nunca desativar teste para passar.
5. PR desatualizado com o `master` não é trabalho seu: não atualizar a branch só por isso. Conflito é: resolver atualizando a branch com o `master` (`git merge origin/master`), nunca com rebase, force push ou reset. Depois, validar de novo (passo 4) e esperar a CI verde outra vez.
6. Não fazer merge nem habilitar auto-merge. Quem mergeia é a orquestradora, com autorização permanente do Gabriel, ou o próprio Gabriel (`docs/AGENT_WORKFLOW.md` > "Merge"). Atribuir a issue ao Gabriel (PR para aprovar).
7. Com a CI verde e o PR entregue, parar. O resumo final da sessão diz o estado do PR com o vocabulário acima ("PR aberto, CI verde, não mergeado") e quantas leituras ficaram para o Gabriel. Não agendar check-ins recorrentes (`send_later`, Routine) esperando o merge, mesmo que as instruções padrão da sessão na nuvem mandem: o orquestrador acompanha o PR e faz o merge. Cada check-in relê o contexto inteiro da sessão e gasta a cota do plano sem mudar nada.

**PRD:**

1. Decisões estáveis vão para `docs/` num PR (mesmo fluxo acima). Rascunho e análise ficam em comentário na issue.
2. Mover para **Needs Decision** e atribuir ao Gabriel, pedindo aprovação da spec. **Ready** só com o ok do Gabriel. No Product nenhuma automação muda status: mesmo com PR de docs mergeado, quem move é o agente.
3. Quando aprovada, propor no comentário a lista de issues de ENG a criar.

## 6. Fechar o ciclo

`save_comment` final na issue:

- o que foi feito e o link do PR;
- o que ficou de fora e para onde foi (issue nova ou comentário);
- descobertas que afetam outras issues (comentar também nelas);
- a seção **Leituras para o Gabriel conferir**, igual à do PR.

### Leituras para o Gabriel conferir

Uma leitura é uma interpretação que você escolheu sem perguntar: a spec deixava duas saídas e você seguiu uma, uma regra de domínio cobria o caso só pela metade, um texto de interface que você escreveu. Não é decisão aberta (essa vai para Needs Decision) nem detalhe técnico. O limite: se a outra saída mudaria o fluxo, a regra de domínio ou o que o jogador vê de um jeito que custa refazer, é Needs Decision; se é barata de trocar depois do merge, é leitura. A orquestradora leva as leituras ao Gabriel antes do merge, então cada uma precisa se sustentar sozinha:

```markdown
## Leituras para o Gabriel conferir

1. **<pergunta em uma linha>** Li <o que você assumiu>, porque <o trecho da spec ou o motivo>. A alternativa era <a outra saída>. Onde está no código: `<arquivo>`.
2. ...
```

Numerada, mesmo com um item só. Sem leitura nenhuma, a seção fica com `Nenhuma.`: assim a orquestradora sabe que você olhou.
