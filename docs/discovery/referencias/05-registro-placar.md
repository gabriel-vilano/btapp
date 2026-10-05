# 05 — Registro de partida e placar

Como o jogador lança o resultado (sets, tiebreak, super tiebreak, W.O., desistência) e como o adversário confirma ou contesta.

**JTBDs:** 2 (saber onde estou no ranking): sem resultado confirmado, o ranking não anda. Indiretamente 3 e 5, que dependem do histórico.
**Oportunidades relacionadas (`DISCOVERY.md`):** 2.1 registro com confirmação e prazo (a dor com mais evidência do mapa). Risco H1 (cold start de dados) e hipótese H2 (o jogador aceita registrar no app o que combina no WhatsApp).

---

## Resumo

- **O Mobbin não tem nenhum fluxo de entrada de placar de esporte de raquete.** Em 4 buscas (fluxo de placar, steppers, cartão de golfe, aprovação) apareceram só análogos: registro manual de treino (Strava, Peloton, Centr, Ladder), steppers de quantidade e cartões de aprovação. A referência de domínio vem da **documentação do Playtomic**, lida na íntegra.
- **O Playtomic resolve a confirmação com a regra "valida sozinho em 24h, ou na hora se um adversário aceitar"** (**documentado**). É a mesma regra dos rankings no incumbente registrada no `DISCOVERY.md` (lança → adversário aprova → auto em 24h).
- **O Playtomic valida o set pelo placar** e classifica cada set como inválido, completo ou incompleto (**documentado**). É um modelo pronto de regra de validação inline.
- **Cartões de aprovação com prazo explícito** são um padrão maduro fora do esporte (Instacart, Fiverr, Retro, Revolut Business): ação dupla (aprovar/recusar), **o que acontece se ninguém responder** escrito no card, e linha do tempo do pedido.

---

## Padrões recorrentes

### 1. O fluxo de registro (Playtomic, documentado)

Da central de ajuda do Playtomic (acesso em 25/09/2026):

1. Entrada: "Your Activity > Matches > **Upload a score**".
2. Tela "Share your match": esporte, **jogadores e formato** (simples ou duplas), data e hora, local, **tipo** (casual ou competitivo).
3. **Confirmar a posição dos jogadores**, com opção de trocar jogadores entre os times.
4. Placar por set.
5. Visibilidade do post, foto, vídeo e comentário opcionais.
6. "Post results". A partida só mexe no nível quando os outros jogadores **aceitam**.

Regras que afetam a UI:

- Partidas de até **30 dias** atrás.
- Se algum jogador não tem conta ou nível, a partida **não pode ser competitiva**: o app avisa e rebaixa para casual.
- Para anular um resultado, a instrução é **lançar 0 em todos os sets**. Funciona, mas é uma affordance escondida (**inferência**).

### 2. Validação de set e de partida (Playtomic Manager, documentado)

| Classificação | Regra do Playtomic (padel, sets até 6) |
| --- | --- |
| Set **completo** | 6 × 0 a 6 × 4, ou 7 × 5 / 7 × 6 |
| Set **inválido** | 7 × 7; 7 × menos de 5; um lado vazio |
| Set **incompleto** | Os dois lados abaixo de 6 |
| Partida **inválida** | Algum set inválido; set incompleto no meio; mais de um incompleto |
| Partida **incompleta** | 1 × 1 em sets; terceiro set incompleto; etc. |

O Playtomic também define **ausência** (o ausente perde 1 ponto e o presente ganha como "vitória em 2 sets") e **dupla ausência**. É o equivalente ao W.O. e ao W.O. duplo do BT. No BT as regras mudam (super tiebreak de 10 pontos no lugar do 3º set, sets curtos em alguns rankings), mas o **modelo de classificação** (completo × incompleto × inválido) transfere direto.

### 3. Entrada numérica

Nenhuma tela de placar de esporte na amostra. Análogos observados:

| Padrão | Quem usa | Relevância para placar |
| --- | --- | --- |
| **Grade com células numéricas** + teclado numérico | Ladder (linhas de série × colunas tempo/esforço/reps) | É o formato "tabela de sets": uma linha por lado, uma coluna por set |
| **Stepper − / +** grande, valor em display | Apple Fitness, BlaBlaCar, Commons, Fitbit, Klima | Bom para um número; lento para 4 a 6 números |
| **Stepper compacto** em linha, com atalhos "−4 −2 +2 +4" | timespent | Acelera saltos grandes. Placar de games raramente precisa |
| **Grade de opções** (chips com todos os valores possíveis) | Amazon (tamanhos 3 a 16) | Games de um set vão de 0 a 7: cabe em uma linha de 8 chips grandes |
| **Teclado numérico nativo** com valor em display | Nike Run Club, Shell, Cash App | Menos toques quando o valor é conhecido |

### 4. Confirmação pelo outro lado

**Observado em 8 apps** (fora do esporte):

- **Prazo e consequência no próprio card:** Instacart ("Você tem 6h 14min para aprovar, senão o pedido será cancelado"), Fiverr ("Responda até 10/06/2026, ou a resolução será retirada automaticamente"), Retro ("O pedido expira em 13 dias").
- **Ação dupla com peso visual diferente:** Aprovar em botão cheio, Recusar em contorno ou neutro (Instacart, Fiverr, Retro, Tripsy). Remote HR usa as duas ações lado a lado dentro do item da lista.
- **Linha do tempo do pedido:** Revolut Business ("Submitted for review → Owner · Awaiting approval from 1 team member").
- **Status como tag:** Airbnb ("Pending" sobre a imagem), Airwallex ("Pending card creation").
- **Resposta com comentário opcional** antes de aceitar ou recusar (Fiverr). No BT, a contestação precisa de um motivo.

---

## Exemplos

| Fonte | O que observar | Link |
| --- | --- | --- |
| Playtomic Help | Fluxo de upload de resultado, regra de competitivo × casual, aceite pelo adversário | [artigo](https://playerhelp.playtomic.com/hc/en-gb/articles/19831532392081-How-to-upload-a-result-you-have-played-outside-of-Playtomic) |
| Playtomic Manager | Validação de set e partida, ausência e dupla ausência | [artigo](https://helpmanager.playtomic.com/hc/en-gb/articles/20535702278289-Scoring-system-and-set-validation-in-Leagues) |
| Strava | Registro manual: formulário em campos com dropdown, CTA fixo "Save activity" desabilitado até preencher | [fluxo](https://mobbin.com/flows/a5ac4455-5b84-443a-b0e3-4273865a507e) |
| Ladder | Grade de células numéricas com teclado e célula ativa destacada | [tela](https://mobbin.com/screens/a3401dbd-c5d8-47a1-80c3-a61d6ee1df0e) |
| Peloton Strength+ | Entrada de reps em bottom sheet com teclado próprio e valor grande | [fluxo](https://mobbin.com/flows/e53c2fea-d116-40f6-b472-ed22b7aa7a48) |
| timespent | Stepper com atalhos de salto (−4, −2, +2, +4) | [tela](https://mobbin.com/screens/c27d31e5-5074-4951-ab4d-3982f59c0464) |
| Klima | Vários steppers empilhados, cada um em card próprio | [tela](https://mobbin.com/screens/8b7f28a6-022c-42cb-8557-f946a18f1af3) |
| Amazon | Grade de chips com todos os valores possíveis | [tela](https://mobbin.com/screens/659265fe-60d3-470f-9cbf-590c6463dcdd) |
| Instacart | Aprovação com prazo e consequência escrita | [tela](https://mobbin.com/screens/d4e4f075-e8d2-4292-be15-b0bf2031b0db) |
| Fiverr | Pedido com comentário opcional, prazo e Aceitar / Recusar | [tela](https://mobbin.com/screens/ded9cbee-b405-42dc-a7dc-bf61fa428971) |
| Revolut Business | Linha do tempo "enviado → aguardando aprovação de X" | [tela](https://mobbin.com/screens/9a34e3c2-65fa-49e0-9a6f-5833c749d333) |
| Remote Global HR | Pendências em lista com Aprovar / Recusar inline | [tela](https://mobbin.com/screens/6f7ddbc3-3a49-492b-8de8-5f7c791cdf28) |
| Retro | Pedido pendente com contexto e validade | [tela](https://mobbin.com/screens/0f4cb2dc-61c6-487f-9f1b-b882af58fc9d) |

Amostra: 5 fluxos e 26 telas em 4 buscas, 15 usados. Descartadas: telas de metas (Apple Fitness), onboarding (LARQ, Cherrypick), pagamentos (Cash App) usadas só como análogo de entrada numérica. **Lacuna registrada:** nenhum app de raquete no Mobbin; o fluxo real do Playtomic não foi visto em tela, só na documentação.

---

## Caminhos possíveis

### A. Grade de sets

Uma tabela: linhas = lados (jogador ou dupla), colunas = sets. Cada célula é um campo numérico. Validação inline por set (completo, incompleto, inválido).

- **A favor:** mostra a partida inteira de uma vez; espelha o `ScoreBlock` do feed, então o jogador vê o placar "como vai ficar". O Playtomic descreve o formulário assim.
- **Contra:** células pequenas a 393px com 3 sets (6 campos + rótulos). Tap target de 48px aperta. Teclado cobre metade da tela.
- **Referências:** Ladder, Playtomic (documentado).

### B. Um set por vez com seleção rápida

Passo a passo: "Set 1" com dois grupos de chips (0 a 7) ou dois steppers grandes; avança sozinho quando o set fica completo. Super tiebreak como passo próprio.

- **A favor:** alvos grandes, zero teclado, validação natural (não deixa escolher 7 × 7). Bom para quem registra saindo da quadra, com pressa.
- **Contra:** mais telas (ou mais rolagem) para uma partida de 3 sets. Corrigir o set 1 depois de chegar ao 3 precisa de navegação.
- **Referências:** Amazon (grade de valores), Apple Fitness e BlaBlaCar (stepper grande).

### C. Resultado primeiro, placar depois

Primeira pergunta: **como terminou?** "Vitória · Derrota · W.O. · Desistência". Só depois, e só se o jogo aconteceu, o placar por set (com A ou B).

- **A favor:** W.O. e desistência deixam de ser exceção escondida. Se a pontuação do ranking depender só do resultado (como em várias tabelas do `DISCOVERY.md`), o placar pode até ser opcional, o que reduz atrito (H2).
- **Contra:** um passo a mais para o caso comum (jogo normal). Se o placar for opcional, o H2H e as estatísticas perdem dado.

### Para a confirmação

1. **Card de pendência** no topo do feed ou da home, com placar, prazo ("confirma sozinho em 18h") e Confirmar / Contestar.
2. **Notificação + tela dedicada** com o placar grande, linha do tempo (lançado por X às 20h → aguardando você) e contestação com motivo.
3. **Inline no card de resultado** do feed, com estado "Aguardando confirmação" antes de virar resultado confirmado.

---

## O que funciona e o que evitar

- ✅ **Escrever o que acontece sem resposta** ("confirma automaticamente em 24h"). Tira a ansiedade dos dois lados.
- ✅ **Validar o set enquanto digita** com as regras do formato (7 × 7 impossível). Erro com o valor e o formato esperado, como o `CLAUDE.md` pede para mensagens de exceção.
- ✅ **Confirmar os lados antes do placar** (Playtomic): em duplas, trocar dois jogadores de time estraga o ranking de quatro pessoas.
- ❌ **Anular resultado lançando zeros** (Playtomic). Ação destrutiva sem affordance própria.
- ❌ **Botões Aprovar e Recusar com o mesmo peso** num resultado que muda o ranking. A ação comum (confirmar) deve ser a primária; contestar deve pedir motivo.

## Acessibilidade

- Stepper: padrão **Spinbutton** do APG (`role="spinbutton"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, setas ↑ ↓ alteram o valor) (**documentado**). Alternativa mais simples: `<input type="number" inputmode="numeric">` com botões −/+ externos, cada um com `aria-label` ("Diminuir games de Lucas no set 1").
- Chips de valor (caminho B): **radio group** (um valor por lado por set).
- WCAG 3.3.1 (identificação de erro) e 3.3.3 (sugestão de erro): dizer qual set está errado e por quê. WCAG 3.3.4 (prevenção de erro, AA) pede revisão ou confirmação antes de enviar dados que o usuário não pode desfazer facilmente; um resultado que muda o ranking de outras pessoas entra nesse espírito (**inferência** sobre a aplicação do critério).
- Mensagem de validação ligada ao campo com `aria-describedby` e `aria-invalid`, como o `FormInput` já faz.

## Relação com o que já existe

`FormInput`, `Button`, `Alert` e `Toast` cobrem parte do formulário e do feedback. `ScoreBlock` (branch do feed) serve de pré-visualização. Faltam: campo de placar por set (ScoreInput), Stepper, grupo de chips selecionáveis, seletor de jogadores/duplas, card de pendência com prazo, linha do tempo de status. Ver o inventário.

## Perguntas para o Gabriel

1. **Quem lança** no MVP: qualquer jogador da partida, só o vencedor, ou só o organizador (torneio)?
2. A pontuação do ranking depende **só do resultado** ou do **placar** (games, sets)? Isso decide se o placar pode ser opcional (caminho C).
3. Qual formato de set o MVP suporta: set único até 6, melhor de 3 com super tiebreak, pro set até 9? Um por ranking?
4. Contestação no MVP: só "recusar" (volta para quem lançou) ou disputa com motivo e mediação do organizador?
5. Prazo de auto-confirmação: 24h fixo (como o Playtomic e o incumbente) ou definido pelo organizador?
