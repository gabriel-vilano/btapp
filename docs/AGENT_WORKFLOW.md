# AGENT_WORKFLOW.md — LetzPlay

Como vários agentes trabalham ao mesmo tempo em issues diferentes sem se atropelar, e como se comunicam entre si e com o Gabriel.

> Convenções de branch e PR estão no `docs/GIT_WORKFLOW.md`. Aqui ficam só as regras de coordenação.

---

## Princípios

- **1 issue = 1 agente = 1 branch = 1 PR.** Cada agente trabalha isolado, na própria sessão na nuvem, com o próprio clone do repo.
- **O Linear é o quadro compartilhado.** Agentes não conversam direto entre si. Tudo que outro agente ou o Gabriel precisa saber vira status, relação ou comentário no Linear. Isso é o padrão *blackboard*: todos leem e escrevem no mesmo quadro. Resultado: o estado de todo o trabalho é auditável num lugar só.
- **A sessão orquestradora é o canal com o Gabriel.** As perguntas e os prints dos agentes chegam a ele por ela, e as respostas voltam às sessões pelo relay (ver "Orquestração"). O canal não substitui o quadro: a pergunta nasce como Needs Decision, e a resposta vira comentário na issue antes de voltar para a sessão.
- **O Gabriel decide produto e domínio.** Pesquisa, implementação e testes são autônomos. Quando a decisão é de produto, de UX ou de Beach Tennis, o agente para e pergunta.
- **A CI é o portão.** Nenhum agente mexe no `master` direto. Quem mergeia é a orquestradora, com autorização permanente do Gabriel, ou o próprio Gabriel (ver "Merge").

---

## Estrutura do Linear

Dois times, divididos por **etapa do fluxo**, não por disciplina:

| Time | Chave | Workflow | O que entra |
| --- | --- | --- | --- |
| Product | `PRD` | Backlog → Todo → Exploring → **Needs Decision** → Ready | Specs, pesquisa, design, recuperação de contexto |
| Engineering | `ENG` | Backlog → Todo → In Progress → **Needs Decision** → In Review → Done | Código, testes, docs técnicos |

- **Projetos** atravessam os dois times (ex.: Feed tem issues de PRD e de ENG). **Initiative** `MVP` agrupa os projetos.
- **Labels:** grupo `Tipo`, uma por issue: Feature, Bug, Refactor, Chore, Docs, Design.
- **Specs geram as issues de ENG.** Uma issue de PRD em Ready é o gatilho para criar as issues de ENG correspondentes, ligadas ao mesmo projeto e com `relatedTo` apontando para a spec. Não se criam issues de ENG especulativas antes disso.
- **Dependências** usam a relação `blocked by`. Issue com bloqueio aberto não pode ser pega.
- **Responsável = a bola está com o Gabriel.** Agentes trabalham com a issue **sem responsável** e atribuem ao Gabriel só quando param e precisam dele: Needs Decision, PR para aprovar, ação manual. A fila do Gabriel é o **My issues** do Linear.

### Automações da integração GitHub

| Evento de PR | Engineering | Product |
| --- | --- | --- |
| PR aberto | → In Review | nada |
| PR mergeado | → Done | nada |
| Draft, review, activity, ready for merge | nada | nada |

- **Qualquer ID de issue citado num PR fica ligado a ele**, e o merge move essa issue para Done. Por isso, no PR, **só se cita o ID da issue que ele fecha** (`Closes <ID>`). Outras issues são referenciadas sem o ID (ex.: "as 4 issues listadas no comentário final da issue").
- **Merge numa branch de feature também move para Done.** É o esperado: a issue está concluída quando entra na branch de feature, e a chegada ao `master` é acompanhada pela issue do PR da própria feature.
- **Nenhuma automação move para Needs Decision.** Só o agente, sempre junto do comentário com a pergunta.
- **No Product, nenhuma automação muda status**, mesmo quando há PR de docs. O agente move o status manualmente, e Ready só com a aprovação do Gabriel.
- Auto-close de issues paradas fica **desligado** nos dois times: backlog parado é intenção, não lixo.

---

## Ciclo de vida de uma issue

O passo a passo executável está na skill `/pegar-issue` (`.claude/skills/pegar-issue/SKILL.md`). Resumo:

1. **Pegar.** Só issues em **Todo** e sem `blocked by` aberto. O agente move a issue para **In Progress** (ENG) ou **Exploring** (PRD), **remove o responsável** e comenta que começou, com o nome da branch. Se a issue já estiver em andamento, não pega: outro agente está nela.
2. **Branch.** `<tipo>/<id>-<descricao-curta>`, ex.: `fix/eng-6-placar-wo`. O ID na branch liga o PR à issue pela integração GitHub ↔ Linear. Base: `master`, salvo quando a issue diz outra base. **Se a base for uma branch de feature**, confirmar antes que ela tem o `master` mergeado (`git merge-base --is-ancestor origin/master origin/<feature>`). Sem isso ela pode não ter o `.github/workflows/ci.yml`, e o PR fica sem CI.
3. **Trabalhar só no escopo.** O que aparecer fora do escopo vira comentário na issue afetada ou issue nova em Backlog. O PR não cresce.
4. **Parar para decidir.** Ver "Needs Decision" abaixo.
5. **Entregar.** PR seguindo o template, com `Closes ENG-6` na descrição. Diff com migration, RLS, policy ou dado sensível passa antes por uma revisão leve (`/security-review` e `/code-review`), registrada no corpo do PR. Em piloto até 5 PRs, diff que cria ou altera componente em `src/components/ui/`, formulário ou campo, ou cria tela nova em `app/`, passa antes pela revisão de interface (skill `revisar-interface`, e o modo revisar da `movimento` se houver animação), também registrada no corpo do PR; no fim do piloto o Gabriel decide se o gatilho fica, cresce ou vira sob demanda. A integração move a issue para In Review ao abrir o PR e para Done no merge. O agente acompanha a CI até ficar verde.
6. **Fechar o ciclo.** Último comentário na issue: o que foi feito, link do PR, qualquer descoberta que afete outra issue (também comentada lá) e as **Leituras para o Gabriel conferir**: as interpretações que o agente escolheu sem perguntar, numeradas, também no corpo do PR.

Issue de PRD com tela abre as perguntas de UX pela skill `decisoes-mobile`, depois de conferir o que as specs já decidem: cada opção vem com a fonte que a sustenta.

Issues de PRD terminam de outro jeito: o resultado é um diagnóstico ou uma spec. Decisões estáveis vão para `docs/` via PR (o repo é a fonte da verdade do que é durável). A issue vai para **Ready** só com aprovação do Gabriel.

---

## Needs Decision

O ponto onde o agente para e chama o Gabriel. Usar quando a decisão:

- afeta produto, UX ou regra de domínio (Beach Tennis);
- tem alternativas com trade-off real e nenhuma é claramente melhor;
- muda o escopo da issue.

**Formato do comentário:**

```
**Decisão necessária:** <pergunta em uma linha>

**Contexto:** <o que motivou a pergunta>

**Opções:**
1. <opção> — <trade-off>
2. <opção> — <trade-off>

**Recomendação:** <opção e por quê>
```

Depois de comentar, mover a issue para **Needs Decision**, **atribuir ao Gabriel** e encerrar a sessão com um resumo. O agente não fica esperando. A orquestradora leva a pergunta ao Gabriel, registra a resposta como comentário na issue e a repassa à mesma sessão pelo relay. Se a sessão não existir mais, a issue volta para Todo e uma sessão nova a retoma.

Não usar Needs Decision para dúvida técnica que o próprio agente consegue resolver lendo o código, a doc ou testando.

---

## Comunicação

| Situação | Onde registrar |
| --- | --- |
| Peguei a issue | status In Progress / Exploring + comentário com a branch |
| Estou bloqueado por outra issue | relação `blocked by` + comentário explicando |
| Preciso de decisão do Gabriel | status Needs Decision + responsável Gabriel + comentário no formato acima |
| Descobri algo que afeta outra issue | comentário **na outra issue** |
| Achei trabalho novo fora do escopo | issue nova em Backlog, com label `Tipo` e projeto |
| Terminei | PR aberto com `Closes <ID>` + comentário final com as Leituras para o Gabriel conferir + responsável Gabriel (PR para aprovar) |

**Regras:**

- Nunca fazer push em branch de outro agente.
- Antes de mexer num arquivo que outra issue em andamento também toca, comentar na outra issue.
- Comentário começa pelo contexto e termina pelo que se pede. Quem lê pode ser um agente sem nenhuma memória da conversa.
- **PR verde entregue, sessão parada.** O agente não agenda check-ins recorrentes (`send_later`, Routine) esperando o merge: a orquestradora acompanha o PR e faz o merge (passo 7 da skill `/pegar-issue`). Cada check-in relê o contexto inteiro da sessão e gasta a cota do plano sem mudar nada.
- **Todo comentário de agente termina com a assinatura** `— 🤖 agente <ID>` (ou `— 🤖 agente orquestrador`). Os agentes usam a conta do Gabriel, então sem assinatura não dá para distinguir o que foi ele do que foi um agente.

---

## Merge

O ruleset do `master` exige PR atualizado com a base e CI verde antes do merge (ver `docs/GIT_WORKFLOW.md` > "Proteção de branch"). Para os agentes, isso vira quatro regras:

- **PR desatualizado não é trabalho do agente.** Não atualizar a branch só porque o `master` andou. Quem atualiza é quem vai mergear, na hora do merge (just-in-time).
- **Conflito é do dono da branch.** Resolver atualizando a própria branch com o `master` (`git merge`). Nunca rebase, force push nem `git reset --hard`, e nunca atualizar a branch de outro agente, nem pelo botão nem pela API.
- **Auto-merge, nunca.** Habilitar auto-merge é mergear por procuração, e a opção fica desligada no repositório de propósito.
- **Quem mergeia é a orquestradora, com autorização permanente do Gabriel.** Os agentes de issue nunca mergeiam. A orquestradora mergeia um PR quando:
  - a CI está verde no PR atualizado com a base;
  - a combinação com o `master` e com os outros PRs do lote foi simulada num worktree local (`combo-validate.sh` da skill `/orquestrar`): lint, typecheck, testes, build e a varredura de variáveis CSS sem definição no resultado combinado;
  - o Gabriel viu os prints, se o PR muda algo na tela. PR com zero mudança visual, comprovada por comparação de pixels, dispensa print;
  - o Gabriel viu as Leituras para o Gabriel conferir do agente, se houver;
  - o PR tem a seção "Revisão de interface (piloto)", se o diff cai no gatilho do piloto;
  - o Gabriel aprovou a spec, se o PR é de spec.

  O merge usa `expectedHeadSha`, para não levar um push feito depois da validação.

---

## Orquestração

O Gabriel escolhe o lote; uma sessão orquestradora abre uma sessão na nuvem por issue, com o prompt `/pegar-issue <ID>`. O Gabriel conversa com a orquestradora pelo celular ou pelo computador: ela leva até ele as perguntas e os prints dos agentes e devolve as respostas às sessões.

O passo a passo executável, com os scripts de validação combinada, espera da CI e prints, está na skill `/orquestrar` (`.claude/skills/orquestrar/SKILL.md`). O estado de cada lote fica no Linear.

- **Máximo de 8 agentes simultâneos**, em issues sem arquivos em comum. Sessão com PR entregue e parada não conta. O gargalo é a revisão de PRs e as respostas a Needs Decision, não a quantidade de agentes.
- **Relay para uma sessão na nuvem.** A orquestradora retoma uma sessão com uma Routine sem agenda, criada só para isso:
  1. `create_trigger` com o `persistent_session_id` da sessão e a mensagem no `prompt`, sem `cron_expression` nem `run_once_at`;
  2. `fire_trigger`;
  3. `delete_trigger`, para a Routine não ficar esquecida.

  A mensagem repete o que já foi registrado na issue: o relay só transporta, o registro continua no Linear. Funciona com a sessão parada há horas.
- **Só issues independentes no mesmo lote:** sem `blocked by` entre si e, de preferência, sem arquivos em comum.
- **Issues que compartilham uma branch de feature** (ex.: correções de uma branch ainda não mergeada) vão para **um agente só**, em sequência. Coordenar vários agentes na mesma branch custa mais do que o ganho de paralelismo.
- **Guarda de uso:** o Gabriel reserva parte do limite semanal do plano Max para uso próprio. A cada check-in, a orquestradora lê o `rate_limit_info` das sessões na nuvem em execução (`get_session`). Ela para tudo se aparecer qualquer um destes sinais:
  - uso semanal em 80% ou mais (`utilization` ≥ 0.8 na janela `seven_day…`);
  - `status` diferente de `allowed`;
  - uso excedente (`isUsingOverage`).

  Parar é interromper todas as sessões, não disparar nenhuma nova e registrar o motivo. O estado fica no documento de orquestração do Linear; o procedimento, na skill `/orquestrar`.
- **Ferramentas cobradas à parte ficam fora** (ex.: Firecrawl no modo Alexandria).

---

## Acesso ao LetzPlay atual

**Nenhum agente acessa `letzplay.me` nem seus subdomínios:** páginas públicas, área logada ou API, com qualquer ferramenta (WebFetch, Firecrawl, Playwright, curl). Os Termos de Uso do LetzPlay ([letzplay.me/about/tos](https://letzplay.me/about/tos), seção "Restrição de Acesso Automatizado") proíbem agentes automatizados, scrapers, IA extrativa e navegadores headless para acessar, mapear ou copiar a interface, as APIs ou os dados da plataforma, salvo autorização por escrito da LPTENNIS. Os mesmos Termos proíbem usar os dados da plataforma em aplicativos concorrentes.

- Material do app atual entra só por prints ou gravações feitos pelo Gabriel, guardados em lugar privado (Linear, Figma ou Dropbox), nunca no repositório, que é público.
- Precisa de algo do app atual? Peça os prints ao Gabriel, com a lista de telas, em vez de buscar.
