# ROUND_DRAW.md — LetzPlay

Spec do fluxo do sorteio da rodada: o que o admin vê antes de sortear, o que acontece quando o sorteio não fecha, o resultado, o que cada jogador recebe e se o sorteio pode ser desfeito.

> Este doc decide **a interação do sorteio**. As regras do sorteio em si (aleatório, sem repetir confronto na temporada, a partida cancelada não conta, cada dupla enfrenta cada outra uma vez quando faltam adversários) estão em `docs/DOMAIN.md` (R7, R30) e **não são reabertas aqui**. O cálculo já existe: `drawRound` (`src/lib/domain/round-draw/`). Onde o botão mora é do `docs/NAVIGATION.md` (N31) e do `docs/RANKING.md` (§7). As regras deste doc são numeradas **SR1, SR2…**, para não colidir com as R do domínio, as M da marcação, as N da navegação, as RG do registro de resultado e as RK do ranking. Rotas são propostas; nomes de componente são para a auditoria do DS.

> **Rascunho em revisão.** As perguntas SQ1 a SQ5 (seção 9) esperam a decisão do Gabriel. As regras abaixo seguem a recomendação de cada uma e mudam junto com a resposta.

---

## Fontes

As siglas de decisão são as do `docs/DOMAIN.md` > "Fontes". As que esta spec usa, mais as próprias:

| Sigla | Conteúdo usado aqui |
| --- | --- |
| **DOMAIN** | R7 (temporada → rodadas → sorteio → partidas), R15 e R39 (admin, inclusive na própria competição), R17 e R45 (inscrição encerrada não joga), R24 (evento "Confronto definido"), R30 (regras do sorteio), R40 e R46 (prazo e fechamento da rodada) |
| **DEC-SORT-BORDA** | Decisões do Gabriel de 27/09 sobre os casos de borda do sorteio: a partida cancelada não conta; com menos adversários que jogos, cada dupla enfrenta cada outra uma vez. O total ímpar de vagas ficou para uma decisão própria, ainda aberta |
| **NAV** | `docs/NAVIGATION.md`: área "Administrar" (N31), decisões do admin em tela cheia (N4), agenda e "Sua vez" (§5), vazio "a próxima rodada começa quando o admin sortear" (N22) |
| **RANK** | `docs/RANKING.md` §7: "Lançar sorteio da rodada N", disponível só quando a rodada anterior fechou; o sorteio não mexe na base do delta (RK12) |
| **SCHED** | `docs/SCHEDULING.md`: notificação "Confronto sorteado sem data" (§5), sem janela para marcar (M19), opções antes do prazo da rodada (M6) |
| **RES** | `docs/RESULTS.md`: atos do admin visíveis aos jogadores (RG11), tabela de notificações (§7) |
| **CODE** | `src/lib/domain/round-draw/`: `drawRound` sorteia uma categoria e recusa três casos (`category_mismatch`, `already_drawn`, `not_enough_units`); `drawPairings` documenta os limites da conta (menos adversários que jogos, vagas ímpares) |
| **NNG** | Nielsen Norman Group, [Confirmation Dialogs Can Prevent User Errors](https://www.nngroup.com/articles/confirmation-dialog/): confirmação só antes de ação séria e difícil de desfazer, e o desfazer como parte do controle e da liberdade do usuário |
| **FIDE** | FIDE Handbook, [C.04.2 General handling rules for Swiss Tournaments](https://handbook.fide.com/chapter/GeneralHandlingRulesForSwissTournaments202602): o emparceiramento publicado não muda, salvo erro ou caso previsto no regulamento, e nunca a favor de um jogador |
| **LEIT** | Leitura do agente desta spec, a confirmar pelo Gabriel. A lista está na seção 9 |

---

## 1. Princípio

**O sorteio é um ato do admin, mas o resultado é dos jogadores.** Quem sorteia costuma jogar no mesmo ranking (R39 permite), e a confiança no ranking depende de ninguém poder escolher o próprio adversário. Daí as três escolhas da spec:

1. **Confirmar o que vai acontecer, não o que vai sair.** A tela antes de sortear mostra categorias, duplas, jogos e prazo, e avisa os casos que não fecham. Não mostra confrontos, porque uma prévia com "sortear de novo" deixaria o admin girar a roleta até gostar (FIDE: o emparceiramento não pode ser alterado a favor de ninguém).
2. **Publicar na hora.** O jogador recebe os confrontos assim que o admin sorteia. A rodada já começa com o prazo correndo, e a M19 não dá janela extra.
3. **Desfazer com rastro.** Erro de cadastro acontece (dupla que desistiu e continua ativa), então o desfazer existe (NNG), mas só enquanto nenhum jogador agiu, e sempre avisa os jogadores (SR12).

---

## 2. Onde o fluxo mora

- **SR1. O sorteio parte da seção "Sorteio da rodada" da área "Administrar"** (N31), visível só para o admin da competição. Não existe outro ponto de entrada. A notificação ao admin de que a rodada fechou (§6) leva a essa seção. [NAV N31]
- **SR2. Confirmar e ver o resultado é um fluxo modal em tela cheia**, com "Fechar", como as outras decisões do admin (N4). Fechar na confirmação não sorteia nada; fechar no resultado volta à área "Administrar", que já mostra a rodada sorteada. [NAV N4]

---

## 3. Antes de sortear

### 3.1 Quando o botão aparece

- **SR3. "Sortear a rodada N" fica disponível quando a rodada anterior fechou** (o prazo dela passou) ou quando a temporada ainda não teve sorteio. Pendências da rodada anterior na fila do admin não bloqueiam: a rodada fecha no prazo dela, e o que o admin decidir depois entra na seguinte (R46). [RANK §7, R46]
- **SR4. Um sorteio cobre todas as categorias da temporada de uma vez**, porque a rodada é da temporada e o prazo é um só para todas (SQ1). Cada categoria é sorteada pelo `drawRound` em separado, com o mesmo prazo. [R7, CODE; SQ1]

| Situação da seção "Sorteio da rodada" | O que o admin vê | Ação |
| --- | --- | --- |
| Rodada em andamento | "Rodada 3 · fecha em 5 dias" e "24 partidas sorteadas" | "Ver confrontos" (abre o resultado, §5) |
| Rodada anterior fechou, ou temporada sem sorteio | "Rodada 2 fechou em 12/10" ou "A temporada começa no primeiro sorteio" | **"Sortear a rodada N"** (Button primary) |
| Todas as rodadas sorteadas (ranking com total fixo) | "As 4 rodadas da temporada foram sorteadas" | Nenhuma |
| Temporada encerrada | "Temporada encerrada" | Nenhuma |

O stub atual (`RoundDrawStub`, Button secondary sempre visível) dá lugar a esses estados. O botão vira primary quando está disponível, porque é a única ação daquele momento na área.

### 3.2 A tela de confirmação

- **SR5. A confirmação mostra o que vai acontecer, por categoria, e não os confrontos** (SQ3). Para cada categoria: quantas duplas ativas entram, quantos jogos cada uma faz e quantas partidas saem. Só entram as inscrições ativas da categoria na temporada (R17, R45). [CODE; SQ3]
- **SR6. O prazo da rodada é informado aqui** (SQ2), já preenchido: a mesma duração da rodada anterior, contada a partir de hoje, terminando às 23h59 de Brasília. Na primeira rodada, o campo vem vazio e é obrigatório. O prazo precisa estar no futuro e dentro da temporada. Se cair depois da data de corte da final (R28), a tela avisa: "Depois do corte de 30/11: os jogos desta rodada não contam para a vaga na final." [R27, R28, R40; SQ2]
- **SR7. Os casos que não fecham aparecem como aviso na própria categoria, antes de sortear** (seção 4). Nenhum deles bloqueia o sorteio das outras categorias.

```
Fechar                                        Sortear a rodada 3

Ranking Bacuri · Temporada 2026/2

Prazo da rodada
[ dom, 26/10, 23h59 ]           mesma duração da rodada 2 (14 dias)

Categorias
Masculino B         6 duplas · 4 jogos cada · 12 partidas
Feminino C          5 duplas · 3 jogos cada · 7 partidas
  ⓘ Uma dupla fica com 2 jogos nesta rodada (5 × 3 é ímpar)
Mista C 40+         3 duplas · 2 jogos cada · 3 partidas
  ⓘ Cada dupla joga 2 jogos, não 4: só há 2 adversários
Masculino A         Não entra: 1 dupla ativa

Os jogadores recebem os confrontos na hora, na agenda e por
notificação. O prazo começa a contar agora.

[ Sortear ]
```

- **SR8. O botão diz o que faz: "Sortear".** Sem "Tem certeza?" depois dele: a tela inteira já é a confirmação, e o desfazer cobre o erro (NNG). O botão fica desabilitado sem prazo válido ou sem nenhuma categoria que entre. [NNG]

---

## 4. Quando o sorteio não fecha

Os casos vêm dos limites do `drawRound` e das decisões da DEC-SORT-BORDA. A tela fala do efeito para as duplas, não da conta.

| Caso | Onde aparece | Texto de referência | Efeito |
| --- | --- | --- | --- |
| **Menos de 2 duplas ativas** (`not_enough_units`) | Confirmação, na categoria | "Não entra: 1 dupla ativa" | A categoria fica fora deste sorteio. Não volta a ser sorteada nesta rodada (SR14) |
| **Menos adversários que jogos** (R30) | Confirmação, na categoria | "Cada dupla joga 2 jogos, não 4: só há 2 adversários" | Cada dupla enfrenta cada outra uma vez |
| **Total ímpar de vagas** | Confirmação e resultado | Confirmação: "Uma dupla fica com 2 jogos nesta rodada (5 × 3 é ímpar)". Resultado: a dupla aparece marcada, "2 jogos nesta rodada" | Hoje, a dupla sai ao acaso. A regra para igualar os jogos na temporada está em decisão separada; quando sair, muda o texto, não a tela |
| **Repetição inevitável** (R30) | Resultado, no confronto | Selo "Já se enfrentaram nesta temporada" | O confronto repete porque não sobrou combinação nova. Só dá para saber depois do sorteio |
| **Rodada já sorteada** (`already_drawn`), ex.: dois admins ao mesmo tempo | Ao tocar em "Sortear" | "A rodada 3 já foi sorteada por Ana às 10h12." | Nada é criado; a tela abre o resultado existente |
| **Falha de rede ou de servidor** | Ao tocar em "Sortear" | Alert: "Não deu para sortear. Nada foi publicado. Tentar de novo" | Nada é criado (SR9) |

- **SR9. O sorteio é tudo ou nada.** Ou todas as categorias que entram ganham as partidas, ou nenhuma. Tocar duas vezes em "Sortear" não cria duas rodadas: a segunda tentativa recebe `already_drawn`. [CODE; LEIT SL1]
- **SR10. A dupla com jogo a menos e o confronto repetido ficam visíveis também para os jogadores:** a dupla vê "2 jogos nesta rodada" na notificação (§6), e o confronto repetido mostra o mesmo selo na tela do confronto. Quem fica com menos jogos precisa saber que foi o sorteio, não um erro. [LEIT SL2]

---

## 5. O resultado

- **SR11. Depois de sortear, a tela mostra os confrontos, agrupados por categoria**, cada um com as duas duplas e, quando é o caso, o selo de repetição. No topo, o resumo: "Rodada 3 sorteada · 22 partidas · fecha em dom, 26/10". A ação principal é "Concluir", que volta à área "Administrar". [NAV N31]

```
Fechar

Rodada 3 sorteada
22 partidas · fecha em dom, 26/10, 23h59

Masculino B · 12 partidas                                     ⋯
  Lucas e Rafael   ×   Pedro e João
  Lucas e Rafael   ×   Davi e Caio      Já se enfrentaram nesta temporada
  …
Feminino C · 7 partidas                                       ⋯
  Ana e Bia — 2 jogos nesta rodada
  …

[ Concluir ]
```

- O mesmo resultado reabre pela seção "Sorteio da rodada" ("Ver confrontos") enquanto a rodada estiver em andamento. Cada confronto leva à tela da partida (`/jogos/[partida]`), como na lista de partidas da área (N31).
- A ordem dentro da categoria é a da lista de duplas por nome, para o admin achar uma dupla rápido. A ordem do sorteio não tem significado.

### 5.1 Desfazer

- **SR12. O admin desfaz o sorteio de uma categoria enquanto nenhum jogador agiu em nenhuma partida dela** (SQ4). Agir é propor horário, informar data ou lançar resultado. A ação fica no menu "⋯" da categoria, nunca como botão principal, e pede confirmação: "Desfazer o sorteio do Masculino B? As 12 partidas somem da agenda dos jogadores, e eles são avisados." [NNG, FIDE; SQ4]
- **Desfazer apaga as partidas da categoria**, tira os cards "Confronto definido" do feed e **avisa todos os jogadores da categoria** que estavam no sorteio (§6). A categoria volta a "Sortear" na área "Administrar", com o mesmo prazo da rodada.
- **O desfazer fica registrado**, com quem e quando, e aparece para os jogadores no novo sorteio: "Sorteio refeito por Ana · 01/10, 10h40". Assim desfazer para sortear de novo não passa despercebido. [RES RG11; LEIT SL3]
- Depois da primeira ação de um jogador, o menu mostra o item desabilitado com o motivo: "Não dá para desfazer: Pedro já propôs horários." Corrigir um confronto específico depois disso fica fora desta spec (seção 10).

- **SR13. A tela do confronto mostra de onde ele veio:** "Sorteio da rodada 3 · por Ana, 01/10, 10h12", no histórico da partida. Vale também quando o admin joga a categoria. [R39, RES RG11]
- **SR14. Categoria que não entrou num sorteio** (menos de 2 duplas) pode ser sorteada depois, na mesma rodada, se ganhar duplas: a seção "Sorteio da rodada" mostra "Masculino A não entrou no sorteio" com "Sortear o Masculino A", e o prazo é o da rodada. [LEIT SL4]

---

## 6. O que cada um recebe

| Quem | Onde | O que vê |
| --- | --- | --- |
| **Jogadores sorteados** | Agenda (aba Jogos) | Cada confronto em "Sua vez" como "Marcar jogo · rodada fecha em 14 dias" (NAV 5.2). O badge da aba sobe |
| **Jogadores sorteados** | Notificação (SR15) | Uma por jogador e categoria, não uma por confronto |
| **Todos** | Feed | Um card "Confronto definido" por partida, público (R24, `FEED_CARDS.md` §5), no feed dos amigos dos jogadores |
| **Todos** | Página da competição e classificação | O bloco Temporada passa a mostrar "Rodada 3 · fecha em 14 dias" (RK4). A tabela não muda: o sorteio não mexe em posição nem na base do delta (RK12) |
| **Admins da competição** | Notificação | Quando a rodada fecha: "A rodada 2 do Ranking Bacuri fechou. Sorteie a rodada 3." Leva à seção "Sorteio da rodada" (SR1) |

- **SR15. O jogador recebe uma notificação por categoria sorteada**, com o número de jogos e o prazo: "Rodada 3 do Ranking Bacuri sorteada: 4 jogos até dom, 26/10. Marque seus jogos." A notificação abre a aba Jogos. Ela substitui, no momento do sorteio, a "Confronto sorteado sem data" de cada confronto (SCHED §5), que daria 4 avisos iguais de uma vez (SQ5). [SCHED §5; SQ5]

Entradas novas para a spec de notificações básicas, no formato da `RESULTS.md` §7:

| Gatilho | Quem recebe | Texto de referência |
| --- | --- | --- |
| Rodada sorteada | Os jogadores sorteados, um aviso por categoria | "Rodada 3 do Ranking Bacuri sorteada: 4 jogos até dom, 26/10. Marque seus jogos." Com jogo a menos: "…: 2 jogos nesta rodada até dom, 26/10…" |
| Sorteio desfeito | Os jogadores da categoria | "Ana (admin) desfez o sorteio da rodada 3 do Masculino B. Os confrontos vão ser sorteados de novo." |
| Rodada fechou e a próxima pode ser sorteada | Os admins da competição | "A rodada 2 do Ranking Bacuri fechou. Sorteie a rodada 3." |

**Não notificam:** a categoria que não entrou no sorteio (seus jogadores continuam no vazio "a próxima rodada começa quando o admin sortear", N22).

---

## 7. Estados da seção e do fluxo

| Estado | O que o admin vê |
| --- | --- |
| **Carregando a confirmação** | Skeleton das linhas de categoria. O botão "Sortear" só habilita com tudo carregado |
| **Sorteando** | O botão em loading ("Sorteando…"), sem permitir segundo toque. Sem barra de progresso: o sorteio leva menos de um segundo nas categorias do beta |
| **Erro ao carregar** | Alert com "Tentar de novo", sem apagar o prazo já digitado |
| **Erro ao sortear** | Seção 4, linha "Falha de rede ou de servidor" |
| **Desfazendo** | Item do menu em loading; ao terminar, Toast "Sorteio do Masculino B desfeito" e a categoria volta a "Sortear" |

---

## 8. Componentes

| Componente | Tier | Uso | Situação |
| --- | --- | --- | --- |
| **Button, Alert, Toast, Badge** | 1 | Ações, erros, desfazer, selo de repetição | No `master` |
| **DateTimeField** (ou o campo de data da proposta de horário) | 2 | Prazo da rodada (SR6) | Reusar o da marcação, se já existir; senão, nasce aqui |
| **RoundDrawSection** | 3 | Os estados da seção "Sorteio da rodada" (§3.1), no lugar do `RoundDrawStub` | Novo, em `admin/` |
| **DrawSummaryRow** | 3 | Linha da categoria na confirmação, com o aviso (SR5, SR7) | Novo, em `admin/` |
| **DrawnPairingRow** | 3 | Confronto no resultado, com o selo (SR11) | Novo, em `admin/` |

As telas de confirmação e de resultado são Tier 4 (composições). Os estados com aviso (vaga ímpar, poucos adversários, categoria fora) valem uma story-galeria da `DrawSummaryRow`.

---

## 9. Decisões e leituras

### Perguntas para o Gabriel

Cada pergunta tem a recomendação do agente, que é o que as regras acima seguem.

- **SQ1. Um sorteio para todas as categorias, ou um por categoria?**
  1. **Todas de uma vez** — um prazo, um aviso por jogador, um toque do admin. Uma categoria com erro de cadastro atrasa a decisão do admin sobre as outras, mas o desfazer é por categoria (SR12).
  2. **Um por categoria** — mais controle, mas o admin repete o fluxo 4 ou 5 vezes, e as categorias podem ficar com prazos diferentes numa rodada que é da temporada.

  **Recomendação:** 1. A rodada é da temporada (o `Round` não tem categoria), e o Vila e o Rankin sorteiam a rodada inteira.
- **SQ2. Quem define o prazo da rodada?**
  1. **O admin, no sorteio**, com a duração da rodada anterior já preenchida — o prazo nasce quando a rodada começa, e o admin ajusta para feriado ou evento.
  2. **A carga do time**, com todas as rodadas da temporada criadas antes — sem campo no sorteio, mas cada atraso de sorteio come o prazo da rodada, e mudar exige o time.

  **Recomendação:** 1. Combina com a SR3: a rodada começa quando o admin sorteia, não numa data fixa.
- **SQ3. Prévia dos confrontos antes de publicar?**
  1. **Sem prévia** — a confirmação mostra o resumo e os avisos (SR5), e o resultado já é público. Ninguém escolhe adversário.
  2. **Prévia com "Sortear de novo"** — o admin vê os confrontos antes de publicar. Como o admin costuma jogar no ranking, ele poderia sortear até cair um adversário fácil (FIDE proíbe alterar o emparceiramento a favor de alguém).
  3. **Prévia com edição manual** — resolve casos que o sorteio não prevê (dupla que só joga sábado), ao custo da confiança e de uma tela de edição.

  **Recomendação:** 1. Se o beta mostrar casos que pedem edição, a correção vem por confronto, com rastro (seção 10).
- **SQ4. Desfazer: existe e até quando?**
  1. **Por categoria, até a primeira ação de um jogador, com aviso e registro** (SR12) — corrige erro de cadastro descoberto logo depois, e o rastro inibe o "sortear até gostar".
  2. **Janela de 10 minutos antes de publicar** (como o "desfazer envio" do e-mail) — o desfazer não deixa rastro para os jogadores, mas atrasa a rodada de todos, e erro de cadastro costuma aparecer quando um jogador reclama, depois da janela.
  3. **Sem desfazer** — o mais simples e o mais rígido; um erro de cadastro só se corrige confronto a confronto, e isso ainda não existe.

  **Recomendação:** 1.
- **SQ5. Uma notificação por categoria sorteada, em vez de uma por confronto?**
  1. **Uma por categoria** (SR15) — "4 jogos até 26/10", e a agenda lista os confrontos. Muda a linha "Confronto sorteado sem data" da `SCHEDULING.md` §5, que passa a valer só para confronto criado fora do sorteio.
  2. **Uma por confronto**, como a SCHED já diz — 4 avisos iguais de uma vez no Rankin, que tem 4 jogos por rodada.

  **Recomendação:** 1.

### Leituras do agente

A confirmar pelo Gabriel junto com as perguntas:

- **SL1.** O sorteio é tudo ou nada entre as categorias, e o segundo toque não cria uma segunda rodada (SR9).
- **SL2.** A dupla com jogo a menos e o confronto repetido são mostrados aos jogadores, não só ao admin (SR10).
- **SL3.** O desfazer aparece no histórico das partidas do novo sorteio (SR12).
- **SL4.** Categoria que não entrou no sorteio pode ser sorteada depois, na mesma rodada e com o mesmo prazo (SR14).
- **SL5.** O feed mantém um card "Confronto definido" por partida (R24). Como o card chega aos amigos dos jogadores, o volume por pessoa é pequeno; se o beta mostrar o contrário, o agrupamento é da spec do feed.

---

## 10. Fora desta spec

| Item | Para onde vai |
| --- | --- |
| Regra para igualar os jogos quando o total de vagas é ímpar | Decisão separada, já aberta. Muda a R30 e o texto do aviso, não esta tela |
| Editar o prazo da rodada depois do sorteio | Issue própria, se o beta pedir. Mexe na M6 (opções de horário antes do prazo) e nas partidas já marcadas |
| Corrigir um confronto específico depois do sorteio (trocar adversário, incluir dupla atrasada) | Issue própria, se o beta pedir. Segue a FIDE: só por erro ou caso previsto, com rastro |
| Agrupar os cards "Confronto definido" de uma rodada no feed | Spec do feed (SL5) |
| Canal e política das notificações | Spec de notificações básicas (§6 é a entrada) |
| Criar temporada, categorias e inscrições pela interface | Fora do MVP (`DOMAIN.md` §5; R32) |

---

## 11. Métricas de sucesso

| Métrica | Como medir | Por quê |
| --- | --- | --- |
| **Tempo até o sorteio** | Mediana entre o fechamento de uma rodada e o sorteio da seguinte | Se o admin demora, os jogadores ficam parados (N22). Mede se a notificação ao admin basta |
| **Sorteios desfeitos** | % de categorias sorteadas que foram desfeitas, por rodada | Muito desfazer aponta para erro de cadastro (R32) ou para uso do desfazer como "sortear de novo" (SQ4) |
| **Repetição por rodada** | Confrontos repetidos sobre o total sorteado, por categoria | O risco da R30 em categorias pequenas (`DOMAIN.md` §7) |

---

## 12. Riscos para acompanhar no beta

- **Desfazer como roleta.** Mesmo com rastro, o admin pode desfazer até gostar, enquanto ninguém age. A métrica "Sorteios desfeitos" mostra; se acontecer, o desfazer passa a exigir motivo ou perde a categoria do próprio admin.
- **Prazo errado sem volta.** Sem editar o prazo depois do sorteio (seção 10), um prazo digitado errado só se corrige desfazendo, e só enquanto ninguém agiu.
- **Rodada que começa tarde.** Com o prazo contado a partir do sorteio (SQ2), um admin que demora a sortear encurta a temporada, não a rodada. Se a temporada tiver data de corte, as últimas rodadas podem cair depois dela (o aviso da SR6 cobre o caso, mas não o evita).
