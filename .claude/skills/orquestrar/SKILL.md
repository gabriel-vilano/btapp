---
name: orquestrar
description: Conduz um lote de agentes do BT App, da proposta ao merge (sessões, relay, validação combinada, prints e merge em série). Use quando for a sessão orquestradora ou receber "/orquestrar".
---

# /orquestrar

Ciclo de um lote de agentes, do jeito que o `docs/AGENT_WORKFLOW.md` define. A orquestradora é o canal do Gabriel com os agentes: leva as perguntas e os prints até ele, devolve as respostas às sessões e mergeia com a autorização permanente dele. Ela não implementa issue nem empurra código na branch de um agente.

O estado da orquestração (lote atual, sessões, decisões, lições) mora no Linear, no documento "Orquestração: estado atual e passagem de bastão". Este arquivo é o procedimento, que muda pouco. O repo é público: nada de segredo, ID de sessão ou material do app atual aqui ou nos commits.

Os scripts ficam em `.claude/skills/orquestrar/scripts/` e rodam do próprio repo:

| Script | Para quê |
| --- | --- |
| `combo-validate.sh` | Simula o `master` com as branches do lote e roda lint, typecheck, testes, build e a varredura de CSS |
| `wait-ci.sh` | Espera os 3 checks obrigatórios de um commit |
| `shot-vp.mjs` | Print de stories no viewport do celular (393×852), depois do `play`, com a medida de overflow |
| `shot-page.mjs` | Print de uma página do app (rotas públicas) |
| `compose-grid.mjs` | Junta os prints de um PR numa grade com legenda |

## 0. Preparar a sessão

```bash
export SP=<scratchpad da sessão>     # o caminho está no prompt de sistema
export S="$(git rev-parse --show-toplevel)/.claude/skills/orquestrar/scripts"   # rodar de dentro do clone
```

O `combo-validate.sh` cria o worktree `$SP/combo` na primeira vez. Ele serve só para simular merges: nunca fazer commit nem push nele. O `git fetch` no repo atualiza os `origin/*` do worktree também, porque os dois compartilham as refs.

## 1. Ler o estado

1. O `docs/AGENT_WORKFLOW.md` inteiro, uma vez por sessão: o `CLAUDE.md` não o importa, e as regras de merge, de relay e da guarda de uso estão nele.
2. O documento de estado no Linear, a começar pela passagem de bastão.
3. O "My issues" do Gabriel: Needs Decision e PRs esperando aprovação.
4. Os PRs abertos, com CI e conflitos. As sessões do lote anterior (`list_sessions` com a tag `lote:<N>`; as sessões até o lote 4 levam a tag antiga, com o nome anterior do produto no prefixo).
5. A guarda de uso (seção 5).

Antes de levar uma pergunta ao Gabriel, ler os comentários recentes da issue: às vezes ele já respondeu direto na sessão do agente.

## 2. Propor o lote

1. Candidatas: issues em **Todo** sem `blocked by` aberto.
2. Mapa de conflitos: um subagente lista os arquivos que cada candidata deve tocar (inclusive linhas vizinhas do mesmo doc) e aponta os pares em conflito. Issues que dividem arquivos entram em lotes diferentes ou com ordem de merge definida. Issue que renomeia mocks entra primeiro.
3. Propor ao Gabriel com `AskUserQuestion`: a recomendação primeiro, o contraponto antes, em texto. No máximo 4 perguntas por rodada e 8 agentes trabalhando ao mesmo tempo (`docs/AGENT_WORKFLOW.md` > "Orquestração"); sessão com PR entregue e parada não conta.
4. Registrar no documento de estado: lote aprovado, horário e ordem de merge.

## 3. Abrir as sessões

Com o ok do Gabriel, abrir na hora as sessões independentes. Investigação de uma issue em aberto não segura as outras.

`create_session` por issue, com:

- `prompt`: `/pegar-issue <ID>` e, abaixo, uma nota curta com o que o agente precisa saber além da issue (decisão recente, ordem de merge). Pedir sempre `git merge` para atualizar a branch, nunca reset. Assinar `— 🤖 agente orquestrador`;
- `title`: `<ID> · <assunto>`;
- `tags`: `["lote:<N>"]`. A tag não leva o nome do produto, para um rename não quebrar o filtro.

Anotar a sessão de cada issue no documento de estado (ele é privado; o repo não).

## 4. Relay para uma sessão

Para levar uma resposta do Gabriel a uma sessão parada:

1. Comentar a resposta na issue primeiro: o relay só transporta, o registro é o Linear.
2. `create_trigger` com `persistent_session_id` = a sessão, `prompt` = a mensagem, `initiation: "human_request"`, **sem** `cron_expression` nem `run_once_at`.
3. `fire_trigger` com o `trigger_id`.
4. `delete_trigger`, para a Routine não ficar esquecida.

Funciona com a sessão parada há horas. Se a sessão travou (classificador do modo automático bloqueando até leitura de arquivo), o relay não destrava: arquivar e abrir uma nova com o contexto no prompt.

## 5. Guarda de uso

A cada check-in, `get_session` nas sessões em execução e ler o `rate_limit_info`. Parar tudo se aparecer:

- `utilization` ≥ 0.8 numa janela `seven_day…`;
- `status` diferente de `allowed`;
- `isUsingOverage` verdadeiro.

Parar é interromper as sessões (`interrupt_session`), não abrir nenhuma nova e registrar o motivo no documento de estado.

## 6. Check-in

Agendar o próximo check-in (`send_later`) antes de qualquer espera: depois de cada rodada de merge ou de pergunta. Sem isso, um reinício do container deixa a orquestração parada por horas. Guardar o `trigger_id` que ele devolve: é com ele que o `delete_trigger` cancela o check-in.

Em cada check-in:

1. Guarda de uso.
2. `list_sessions` com a tag do lote: `status_bucket` BLOCKED com `needs_action` é um pedido de permissão parado. Avisar o Gabriel na hora; nunca rodar a mesma ação pela orquestradora.
3. Issues do lote: status e último comentário. Needs Decision vai ao Gabriel.
4. PRs: CI, conflito, se o agente entregou.

O prompt de um check-in envelhece: conferir o estado antes de agir, e nunca deixar o texto agendado ampliar um ok do Gabriel. Quando o lote fecha, não deixar check-in agendado.

Se a rodada anunciou ou deve uma pergunta, o `AskUserQuestion` sai na mesma rodada, antes de encerrar ou de disparar uma espera em segundo plano. Qualquer mensagem do Gabriel, inclusive "continue", pede a entrega pendente na hora.

## 7. Antes do merge

Para cada PR entregue, nesta ordem:

1. **Estado real.** O resumo da sessão pode errar ("merged" pode ser o agente trazendo o `master` para a branch). Conferir no GitHub.
2. **O agente parou mesmo?** `needs_action` da sessão e o último comentário do agente na issue.
3. **Leituras do agente.** A seção "Leituras para o Gabriel conferir", no corpo do PR e no comentário final. Elas vão ao Gabriel antes do merge, junto com os prints quando houver. Achado grave de agente: verificar antes de repassar.
4. **Prints**, se o PR muda algo na tela (seção 8). PR com zero mudança visual, comprovada por comparação de pixels, dispensa.
5. **Migration ou dado sensível.** O corpo do PR precisa ter a seção "Revisão leve" (`/security-review` e `/code-review`, pela `/pegar-issue`); sem ela, pedir ao agente pelo relay. Ler o SQL no diff do PR e revisar as policies de RLS como código de produção: RLS ligada na tabela nova, quem lê e quem escreve cada linha, dado sensível fora de tabela com SELECT aberto. Comparar o timestamp com o `list_migrations` do remoto: a integração do Supabase recusa migration mais antiga que a última aplicada, então PRs com migration mergeiam na ordem do timestamp.
6. **Diff de UI de risco (piloto).** Se o diff cria ou altera componente em `src/components/ui/`, formulário ou campo de entrada, ou cria uma tela nova em `app/`, o corpo do PR precisa ter a seção "Revisão de interface (piloto)" (gatilho e formato na `/pegar-issue`, passo 4); sem ela, pedir ao agente pelo relay. Os achados reais vão ao Gabriel junto com as leituras. Contar o PR no documento de estado (link, achados reais, rejeitados, custo). No quinto PR com a seção, o piloto fecha: juntar os 5 registros num comentário para o Gabriel, que decide entre manter o gatilho estreito como regra, ampliar para todo diff de UI ou deixar a revisão só sob demanda, e registrar a decisão no documento de estado. Até a decisão, o gatilho continua valendo.
7. **Validação combinada** de todos os PRs prontos do lote, de uma vez, na ordem de merge:

   ```bash
   bash "$S/combo-validate.sh" combo-lote<N> feature/eng-1-a fix/eng-2-b   # em segundo plano, uns 4 minutos
   tail -25 "$SP/combo-lote<N>.log"
   ```

   O script termina em `RESULTADO: verde` ou diz em que etapa falhou (saída de cada etapa em `$SP/combo-lote<N>-<etapa>.out`). Sobram três variáveis CSS sem definição esperadas, escritas em runtime ou pelo `next/font`: `--dialog-drag-offset`, `--dialog-keyboard-inset` e `--font-arimo`. Qualquer outra é contrato quebrado entre PRs.

   O script não pega duas coisas; conferir à mão no `$SP/combo`: link com `#` para a rota de outra área, e tela de detalhe com `backHref` fixo em vez do `DetailHeader`:

   ```bash
   grep -rn "backHref" --include=*.tsx "$SP/combo/src" "$SP/combo/app" | grep -v "stories\|\.test\.\|ui/AppHeader/\|shell/"
   ```

   PR com conflito no combo: validar sem ele, mergear os outros pela ordem e pedir ao dono que atualize a branch com o `master` (relay).

   O combo roda uma vez por lote. Repetir só se um PR do lote recebeu push depois dele: a atualização just-in-time de cada merge é provada pela CI do próprio PR (seção 9).

## 8. Prints

O agente não consegue mandar print ao Gabriel, e o `uploads.linear.app` é bloqueado pelo proxy. Por isso a orquestradora tira os próprios prints, a partir do combo:

```bash
cd "$SP/combo" && npx storybook build --quiet -o "$SP/sb"      # em segundo plano, uns 2 minutos
python3 -m http.server 6123 --directory "$SP/sb" >/dev/null 2>&1 &
echo $! > "$SP/sb.pid"
python3 -c "import json;[print(k) for k,v in json.load(open('$SP/sb/index.json'))['entries'].items() if v.get('type')=='story']" | grep agenda-
mkdir -p "$SP/prints"
node "$S/shot-vp.mjs" http://localhost:6123 "$SP/prints" agenda-matchscreen--no-date ui-button--primary@430
node "$S/compose-grid.mjs" "$SP/prints/pr114.png" "#114 · Confronto" 4 "Sem data" "$SP/prints/agenda-matchscreen--no-date-393.png"
kill "$(cat "$SP/sb.pid")"
```

- `shot-vp.mjs` espera o `play` terminar e imprime `play ok` ou o erro, e o overflow horizontal. Overflow maior que 0 é conteúdo mais largo que a tela: olhar antes de levar ao Gabriel. Com a moldura `.sb-screen-frame`, a medida é dentro dela (medir o documento dá um falso 409px).
- Página do app em vez de story: `next dev` no combo, numa porta livre, com env pública fictícia (URL local e uma `sb_publishable_…` qualquer), e `node "$S/shot-page.mjs" <url> <saida.png>`. Só as rotas públicas abrem sem Supabase local.
- `compose-grid.mjs` avisa quando a imagem passa de 3.400px de altura: acima de ~8.500px o `SendUserFile` recusa. Usar mais colunas ou dividir.
- Matar servidor pelo PID, nunca com `pkill -f`: o padrão casa com a própria linha de comando e mata o shell que o chamou.

**`SendUserFile` e `AskUserQuestion` vão na mesma rodada**, um logo depois do outro, com as leituras do agente na mesma pergunta. Quando a rodada termina nos prints, a pergunta só sai no check-in seguinte.

## 9. Merge em série

Para cada PR, na ordem do lote. Um PR sem pendência com o Gabriel (sem leitura, sem print, sem spec) não espera a resposta dele sobre outro PR: a autorização de merge é permanente (`docs/AGENT_WORKFLOW.md` > "Merge"). Sem ordem registrada para o lote, a regra é: quem renomeia mocks primeiro, migrations na ordem do timestamp, o resto pela ordem de entrega.

1. `pull_request_read` para pegar o SHA atual do head (completo, 40 caracteres).
2. Se o PR está atrás do `master`: `update_pull_request_branch` com `expectedHeadSha` = esse SHA. Isso cria um merge commit; buscar o SHA novo do head de novo.
3. Esperar os checks, em segundo plano, e usar a espera para uma pergunta curta ao Gabriel:

   ```bash
   bash "$S/wait-ci.sh" <sha-completo>      # 0 verde, 1 falhou, 3 tempo esgotado
   ```

   O script lê o repositório de `REPO_SLUG` (`owner/repo`) ou, sem ele, do `git remote get-url origin`; fora de um clone, defina `REPO_SLUG`.

4. `merge_pull_request` com `merge_method: "merge"` e `expectedHeadSha` = o SHA completo validado. Nunca completar um SHA curto de cabeça: pegar do `git rev-parse` ou do `pull_request_read`.
5. Conferir no GitHub que o PR está mergeado.

Falha de infraestrutura na CI (job que morre antes dos testes): a orquestradora não consegue rodar o job de novo (403). Pedir ao Gabriel o "Re-run failed jobs". Teste instável que não tem relação com o diff não é do PR: registrar numa issue. Log de job da CI: delegar a leitura a um subagente, que filtra as linhas `FAIL`, `×` e `Tests` e devolve só a story, o erro e o placar; o dump de DOM do fim do log enche o contexto. Não rodar a suíte de stories no container da orquestradora: é ~10 vezes mais lenta que na CI.

## 10. Fechar o PR e o lote

1. Arquivar a sessão do agente logo depois do merge do PR dela (`archive_session`). Sessão sem PR mergeado (spec parada, Needs Decision) só com o ok do Gabriel.
2. Comentar na issue: PR, horário do merge (conferido no `git log` ou com `date -u`) e o que ficou para outras issues. Assinar `— 🤖 agente orquestrador`.
3. Atualizar o documento de estado: resultado do lote, lições e a passagem para o próximo.
4. Lote fechado: cancelar os check-ins pendentes (`delete_trigger` com o `trigger_id` guardado) e apagar os gatilhos de relay que sobraram (`list_triggers`).

## Vocabulário e git

- "Mergeado" é só o PR mergeado no `master`. Trazer o `master` para uma branch é "atualizar a branch com o `master`".
- Nunca `git reset --hard`, `push --force` nem outro comando que descarta trabalho, nem no worktree de combinação. Um reset pode disparar o classificador do modo automático, que passa a bloquear até a leitura de arquivos na sessão inteira. Para atualizar, `git merge`.
