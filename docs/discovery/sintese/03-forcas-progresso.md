# 03 — Forças do progresso

O que faz o jogador e o organizador **trocarem** a solução atual (WhatsApp, planilha, o concorrente principal, a plataforma da federação) por outra, e o que os segura onde estão.

Técnica: *forces of progress* do Jobs to be Done, de Bob Moesta (*Demand-Side Sales 101*, 2020; *switch interview* com Chris Spiek). Códigos de fonte no [`README.md`](README.md).

> **Sem decisões de produto.** As forças descrevem o que a evidência mostra sobre a troca. Não dizem se o produto deve disputar essa troca, nem como.

---

## Como a técnica funciona

Moesta diz que ninguém "adota" um produto: a pessoa **troca** uma solução por outra quando está tentando fazer progresso numa situação. Quatro forças agem sobre essa troca:

| Força | Direção | Pergunta |
| --- | --- | --- |
| **Empurrão** (*push*) da situação atual | A favor da troca | O que na forma atual está incomodando a ponto de a pessoa procurar outra? |
| **Atração** (*pull*) da nova solução | A favor da troca | O que a pessoa imagina que a vida vai ser com a nova solução? |
| **Ansiedade** (*anxiety*) com a nova | Contra a troca | O que pode dar errado se ela trocar? |
| **Hábito** (*habit*) da atual | Contra a troca | O que a prende ao jeito atual, mesmo incomodada? |

A troca só acontece quando **empurrão + atração > ansiedade + hábito**. O erro comum é investir só na atração (mais features) e ignorar as forças contra.

**Analogia com design:** é o motivo pelo qual uma pessoa continua no Sketch mesmo reclamando dele. O empurrão existe, o Figma atrai, mas os arquivos antigos, os plugins e o time que ainda usa o Sketch seguram. Quem desenha o Figma precisa pensar no import, não só no editor.

**"Solução atual" aqui é um conjunto.** O jogador de BT não usa um app: usa o grupo de WhatsApp da arena, o app que a federação ou o circuito escolheu (muitas vezes o concorrente principal), o Instagram e a memória. O organizador soma a isso a planilha, a súmula em papel e o PIX na chave dele. As forças abaixo são sobre sair desse conjunto.

---

## Jogador competitivo

```mermaid
flowchart LR
  subgraph afavor["A favor da troca"]
    direction TB
    EJ["EMPURRÃO<br/>resultado pendente há meses<br/>horário que não chega, W.O.<br/>app lento e que desloga"]
    AJ["ATRAÇÃO<br/>próximo jogo e posição num lugar<br/>adversário com nível confiável<br/>simplicidade (barragens que fluem)"]
  end
  subgraph contra["Contra a troca"]
    direction TB
    NJ["ANSIEDADE<br/>meu histórico fica para trás<br/>mais uma conta, mais um cadastro<br/>o adversário vai recusar o placar"]
    HJ["HÁBITO<br/>o grupo da arena já avisa tudo<br/>a federação e a arena escolhem o app<br/>ranking oficial está no app atual"]
  end
  T(("Trocar a<br/>solução atual"))
  EJ --> T
  AJ --> T
  NJ -. freia .-> T
  HJ -. freia .-> T

  classDef pro fill:#e0fae0,stroke:#288034,color:#0c310d
  classDef con fill:#ffdede,stroke:#d50b0b,color:#2a0303
  class EJ,AJ pro
  class NJ,HJ con
```

### Empurrão: o que incomoda na forma atual

| Força | Evidência | Força da evidência |
| --- | --- | --- |
| **Resultado que não entra.** Jogo pendente por meses; 3º lugar sem lançar | Jogos pendentes há meses no concorrente principal; colocação de torneio que não foi lançada, em reclamação pública (`MER O1`) | Forte |
| **Horário e mudança que não chegam.** Perda de jogo por W.O. | W.O. em quartas de Brasileiro; jogadores relatam torneios perdidos; app que avisa só por e-mail, sem push (`MER O3`) | Forte |
| **App que atrapalha.** Lentidão, logout, informação escondida | Navegação: 15 menções em 5 apps. Lentidão: 13. Relatos de logout depois de poucos minutos de uso (`MER O6`, `O7`) | Forte |
| **Adversário fora da categoria.** *Sandbagging* e perfil duplicado | 6 menções em 4 apps; jogadores dizem que isso desequilibra os torneios (`MER O2`, `DOR D1`) | Forte |
| **Aviso espalhado.** Um grupo por torneio, por ranking, por arena | Grupo de WhatsApp é canal de programação, denúncia e cobrança (`DOR D4`) | Forte (lado do organizador); a voz do jogador sobre o excesso de grupos é inferência |
| **Não entender a conta** | Voz vem de apps de rating; no BT, a conta está espalhada em abas (`MER O4`, `APR`) | Média |

### Atração: o que a nova solução promete

| Força | Evidência | Força da evidência |
| --- | --- | --- |
| **Tudo do meu dia competitivo num lugar** | Elogio mais recorrente da amostra: achar jogo, torneio e gente do mesmo nível (6 em 3 apps, fora do BT) (`MER O8`) | Média |
| **Simplicidade** | Meu Ranking, o app de BT mais bem avaliado da amostra, com reviews que elogiam a fluidez das barragens (`MER O6`; evidência: documento D2 ("Evidência: concorrentes (preços, números, ids de loja)"), projeto Discovery e estratégia no Linear) | Média |
| **Nível em que dá para confiar** | Sistemas maduros mostram número + confiança; é o tema mais discutido fora das lojas (`MER O2`, `RAT`) | Média (fora do BT) |
| **Ver a evolução** | Os concorrentes cobram por isso; reviews contam a saída de um rating estagnado (`MER O9`, `MAT L9`) | Fraca no BT |

### Ansiedade: o que pode dar errado se trocar

| Força | Evidência | Força da evidência |
| --- | --- | --- |
| **Perder o histórico.** Os resultados antigos ficam no app antigo | Jogador diz que os resultados na plataforma importam para o histórico e para a classificação em outros torneios (`DOR`, RA1) | Média (o valor do histórico é dito; o medo de perdê-lo é inferência) |
| **Mais uma conta.** O jogador já tem uma conta por arena e por federação | "O jogador tem uma conta por arena" (`DSC` 2.2); CPF preso numa conta cancelada (Tênis Integrado, `MER O7`) | Média |
| **Placar recusado.** Confirmar pelo adversário abre espaço para o perdedor vetar | 8 threads em 2 apps (`VZA`, seção 1) | Forte (fora do BT) |
| **Cobrança.** O app novo pode cobrar | MATCHi: metade das reviews visíveis reclama da taxa ao jogador, com a sensação de estar preso (`VZA`) | Média (fora do BT) |
| **O número me expor ou mentir** | Jogadores dizem que o rating não os representa; queda por causa do parceiro, em duplas (`RAT`, `APR`) | Média (fora do BT) |

### Hábito: o que prende ao jeito atual

| Força | Evidência | Força da evidência |
| --- | --- | --- |
| **O grupo de WhatsApp já resolve** o dia do torneio e a marcação | O Meu Ranking passou a apontar para o grupo; o regulamento de arena usa o grupo como canal oficial (`MER RS5`, `JOR` 2) | Média a Forte |
| **Quem escolhe o app é a federação, a arena ou o circuito** | 4 reviews em 3 apps; white-label por arena (`MER RS4`) | Forte |
| **O ranking oficial está no app atual.** Sem ele, os pontos não contam | CBT: sem anuidade, pontos não contam; o ranking da CBBT roda no concorrente principal, com uma base grande de jogadores (`RAT` 6.2, 6.3; evidência: documento D4 ("Evidência: mercado e contadores do concorrente principal"), projeto Discovery e estratégia no Linear) | Forte |
| **A conversa social mora no grupo** | Prefere jogar com amigos; BT como "grupo de pertencimento" (`PUB` 1.2, 2.3) | Fraca |

### Leitura para o jogador

- **O empurrão é forte e bem documentado; a atração, nem tanto.** A evidência diz com clareza o que incomoda e bem menos o que o jogador imagina de melhor. É o padrão de quem ainda não viu a alternativa.
- **O hábito mais forte não é do jogador: é de quem escolhe por ele.** Para o jogador federado, "trocar" pode nem ser uma opção. Isso liga as forças à suposição `S13` (o jogador escolhe o app), que tem evidência **contra**.
- **A ansiedade mais específica do BT é o histórico.** É o que um jogador perde ao trocar e o que o organizador guarda.

---

## Organizador

```mermaid
flowchart LR
  subgraph afavor["A favor da troca"]
    direction TB
    EO["EMPURRÃO<br/>dia de 12 a 15 horas<br/>pagamento por dupla à mão<br/>categoria contestada, até na Justiça"]
    AO["ATRAÇÃO<br/>'simples' e 'fácil'<br/>ranking que se atualiza<br/>regras bem explicadas"]
  end
  subgraph contra["Contra a troca"]
    direction TB
    NO["ANSIEDADE<br/>perder a chancela da federação<br/>custo e taxa numa conta apertada<br/>atletas que não migram"]
    HO["HÁBITO<br/>todo atleta está no WhatsApp<br/>planilha e súmula que já funcionam<br/>repasse amarrado ao sistema da federação"]
  end
  T(("Trocar a<br/>solução atual"))
  EO --> T
  AO --> T
  NO -. freia .-> T
  HO -. freia .-> T

  classDef pro fill:#e0fae0,stroke:#288034,color:#0c310d
  classDef con fill:#ffdede,stroke:#d50b0b,color:#2a0303
  class EO,AO pro
  class NO,HO con
```

### Empurrão

| Força | Evidência | Força da evidência |
| --- | --- | --- |
| **O dia do torneio é longo e físico** | Chegar 8h30, sair perto das 23h; rádio comunicador entre quadras (`DOR D5`, `JOR` 1.2) | Forte |
| **Categoria certa e decisão contestada** | Diretor de federação aponta a categoria como grande fonte de stress; impugnação levada à Justiça (`DOR D1`) | Forte |
| **Pagamento por dupla** | Dois pagamentos por inscrição; o inadimplente sai à mão, não automaticamente (`DOR D2`) | Forte |
| **Mudança de última hora pelo WhatsApp** | Pedido de troca de parceiro sem resposta por duas semanas (`DOR D3`, `D4`) | Forte |
| **A ferramenta não cobre o formato** | Planilha encomendada por R$ 30+; construtor que escreveu o próprio sistema (`DOR D9`) | Média |

### Atração

| Força | Evidência | Força da evidência |
| --- | --- | --- |
| **Simples e fácil** | A maioria das reviews do Meu Ranking Organizador, app bem avaliado, elogia isso (`APR`, O6; `VZA`; evidência: documento D2 ("Evidência: concorrentes (preços, números, ids de loja)"), projeto Discovery e estratégia no Linear) | Média |
| **Ranking que se mantém** | Organizador de arena conta que os clientes do ranking elogiam a praticidade (`DOR D7`, AS1) | Média (uma fala) |
| **Regras explicadas** | Organizadores elogiam o app que explica bem as regras (`ORG`, O5) | Fraca (uma fala) |
| **Integridade como argumento** | *Sandbagging* custa a credibilidade do torneio (`DSC` 4.2) | Média |

### Ansiedade

| Força | Evidência | Força da evidência |
| --- | --- | --- |
| **Perder a chancela ou virar "paralelo"** | A CBT exige homologação de todo torneio de BT e veta "organizações paralelas" (`APR`, achado 2) | Forte (regra lida) |
| **Custo numa conta que fecha no limite** | A inscrição cobre só parte do custo operacional, e até o básico é pago (outro esporte) (`DOR D8`) | Média |
| **Os atletas não migrarem** | Inferência: o organizador depende de todos os atletas estarem no mesmo canal (GH #72 precisou tornar o WhatsApp obrigatório) | Fraca (inferência) |
| **Perder o ranking em curso** | Inferência a partir do ciclo de semestre (`JOR` 2) | Fraca (inferência) |

### Hábito

| Força | Evidência | Força da evidência |
| --- | --- | --- |
| **Todo atleta já está no WhatsApp** | Canal de programação, desafio, resultado, cobrança e suporte (`DOR D4`; `ORG RO3`) | Forte |
| **O que já funciona à mão** | Súmula em papel, planilha, PIX com comprovante, formulário no site (`DOR`, gambiarras) | Forte |
| **O sistema da federação amarra o dinheiro** | Repasse de 80% só depois de finalizar no sistema e enviar nota fiscal (`JOR` 1.3) | Forte (regra lida) |
| **A federação escolhe a ferramenta** | Federação usa Tênis Integrado; CBBT usa o concorrente principal; circuitos usam app próprio (`ORG RO2`) | Forte |

### Leitura para o organizador

- **É o ator com as forças mais fortes dos dois lados.** O empurrão é forte (dor documentada em primeira pessoa), e o hábito também (o dinheiro e a chancela passam pelo sistema atual).
- **A ansiedade dele é institucional, não de interface.** Perder a chancela, o repasse e o ranking pesa mais do que aprender uma tela nova.
- **O organizador pequeno de arena e o de etapa federada têm forças diferentes.** O primeiro não depende de repasse de federação e usa o torneio como marketing (`ARE`). A evidência é mais fraca para ele (`DOR`, ressalva).

---

## As duas trocas juntas

O que a evidência sugere quando se olha os dois atores lado a lado. Descritivo.

| Ponto | Jogador | Organizador |
| --- | --- | --- |
| Quem decide a troca | Muitas vezes não é ele | A federação, quando há chancela; ele mesmo, no ranking de arena |
| Força mais forte a favor | Resultado e horário (dependem do organizador) | O dia do torneio e o pagamento por dupla |
| Força mais forte contra | O ranking oficial está no app atual | A chancela e o repasse |
| O WhatsApp | Hábito do grupo; resolve o aviso | Hábito de todos; resolve comunicação e cobrança |
| Onde os empurrões coincidem | Categoria justa, menos pendência, um canal só (`DOR`, "onde querem a mesma coisa") | idem |

**O que isso diz sobre as suposições:** as forças contra a troca são a razão de `S13` (o jogador escolhe o app) e `S22` (o WhatsApp é substituível) terem evidência contrária. E a troca do jogador depender do organizador é o mesmo risco de `S3` (alguém lança o resultado a tempo).

---

## Limites

- **Moesta tira as forças de entrevistas de troca**, com pessoas que acabaram de trocar de solução. Aqui não houve nenhuma. As forças vêm de reviews, regulamentos e vídeos, e a **atração e a ansiedade são as mais frágeis**, porque quase ninguém escreve publicamente o que imaginava ou temia antes de trocar.
- **O concorrente principal aparece dos dois lados.** Para muitos jogadores ele é a solução atual, e o produto nasce no mesmo mercado dele. A relação entre os dois é pergunta aberta das pesquisas de origem (`MER`, pergunta 1).
- O roteiro de entrevista de troca para confirmar estas forças está no [`08-plano-validacao.md`](08-plano-validacao.md).
