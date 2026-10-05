# 02 — Piloto do Tally com personas sintéticas

As 6 personas de jogador "responderam" o formulário **"Beach Tennis competitivo: como você joga e acompanha"** (`q46Jk8`) em duas versões: a **atual** (o rascunho no Tally) e a **proposta** da síntese (`docs/discovery/sintese/09-proposta-tally.md`, PR #31). O objetivo é achar problema de redação, de opção e de lógica antes do pré-teste com gente real.

> **[sintético]** As respostas das personas são interpretação do modelo. Não dizem nada sobre o público. **[revisão]** marca o que saiu da leitura direta do formulário e pode ser conferido no próprio Tally.

> **Sem editar o formulário e sem decisões de produto.** O form foi lido por `load_form` e nada foi salvo. As sugestões no fim são propostas para o Gabriel aprovar.

---

## Resumo

- **A palavra "ranking" tem duas leituras, e a lógica do formulário depende dela.** Para quem joga circuito federado, o torneio **é** o ranking. Quem marca "Só torneios" deixa de ver a pergunta sobre com que frequência confere a posição, justamente a que mede `S1` e `S5` na persona P1. **[revisão]** a regra; **[sintético]** a hesitação.
- **O horário do jogo, a dor com mais evidência no discovery (`S8`), não tem opção em duas perguntas.** Nem em "Da última vez que você abriu um app…", nem em "Qual é a parte mais chata…". "Combinar horários" é a linguagem do ranking de arena, não do torneio. **[revisão]**
- **Na versão proposta, duas das seis personas desistem nos blocos novos:** a recém-chegada no Kano e quem cumpre tabela na matriz. São exatamente as personas que a síntese já diz estarem sub-representadas. Os blocos novos tendem a **aumentar** o viés a favor de P1 e P2. **[sintético]**
- **A matriz "como está hoje" precisa de "nunca aconteceu comigo".** Sem ela, quem nunca teve placar contestado marca o meio da escala, e isso entra na conta como satisfação média. **[revisão]** a falta; **[sintético]** o comportamento.
- **As respostas do Kano ficam ancoradas no presente.** Na pergunta disfuncional, "Já espero isso" foi lido como "já sei que não tem mesmo" por três personas. **[sintético]**
- **Tempo:** a versão atual cabe nos ~6 minutos anunciados para quem compete. A proposta fica em **~10 a 11 minutos** para quem completa, um pouco acima dos 9 a 10 da síntese, por causa da releitura no Kano. **[sintético]**, estimativa.

---

## O formulário lido

O Tally numera as páginas a partir da abertura. A síntese numera a partir de "Perfil". Aqui vale a numeração do Tally.

| Página no Tally | Título | Perguntas | Quem vê |
| --- | --- | --- | --- |
| 1 | Abertura | Texto: "Leva uns 6 minutos… As respostas são anônimas" | Todos |
| 2 | Seu jogo | Tempo de jogo; vezes por semana; categoria; modalidades; cidade; ranking ou torneio nos últimos 12 meses (filtro) | Todos |
| 3 | Competição | Rankings por semestre; torneios em 12 meses; mesma dupla; como marca o jogo de ranking; quem registra o resultado; W.O. em 6 meses | Quem compete, com perguntas escondidas por ramo |
| 4 | Apps e hábitos | O que usa; última vez que abriu um app; frequência de conferir a posição | Quem compete |
| 5 | Adversários | Procura informação?; o quê; onde | Quem compete; "o quê" e "onde" só para "Sempre" e "Às vezes" |
| 6 | Dores e valor | Parte mais chata (até 2); gasto com inscrição por mês; uma coisa a melhorar (aberta) | Quem compete |
| 7 | Fora das competições | O que te afasta | Só "Nenhum dos dois" |
| 8 | Conversa (opcional) | Topa conversa de 20 min?; contato | Todos; contato só para "Topo" |
| 9 | Obrigado | — | Todos |

**Configuração:** barra de progresso ligada; todas as perguntas de escolha são obrigatórias; os dois campos de texto são opcionais; opções embaralhadas em "Quais destes você usa", "Da última vez", "O que você procura", "Parte mais chata" e "O que te afasta".

### A lógica condicional, ramo a ramo **[revisão]**

A pergunta de filtro é "Nos últimos 12 meses, você jogou algum ranking ou torneio?". As 7 regras do formulário resultam neste quadro:

| Pergunta | Rankings e torneios | Só rankings | Só torneios | Nenhum dos dois |
| --- | --- | --- | --- | --- |
| De quantos rankings você participa por semestre? | ✓ | ✓ | — | — |
| Quantos torneios você jogou em 12 meses? | ✓ | — | ✓ | — |
| Mesma dupla? · W.O. em 6 meses | ✓ | ✓ | ✓ | — |
| Como os jogos de ranking são marcados? · Quem registra o resultado? | ✓ | ✓ | — | — |
| Apps e hábitos (página 4), menos a próxima linha | ✓ | ✓ | ✓ | — |
| Com que frequência você confere sua posição no ranking? | ✓ | ✓ | **—** | — |
| Adversários e Dores (páginas 5 e 6) | ✓ | ✓ | ✓ | — |
| O que te afasta (página 7) | — | — | — | ✓ |
| Conversa (página 8) | ✓ | ✓ | ✓ | ✓ |

A lógica funciona como desenhada: nenhum ramo cai numa página vazia, e o ramo "Nenhum dos dois" pula direto para a página 7 e depois para a 8. O problema é de **desenho**, não de regra: o ramo "Só torneios" perde a pergunta de frequência de consulta da posição, e é nele que o jogador federado (P1) pode cair.

---

## As rodadas: versão atual

Cada tabela mostra só as perguntas em que algo aconteceu. As outras a persona respondeu sem hesitar.

### J1 · Escalador federado (Fortaleza, FCTBT, C) — completou, ~6 min

| Pergunta | O que a persona disse **[sintético]** | Tipo |
| --- | --- | --- |
| Categoria | "Jogo C na dupla e C na mista. Se eu jogasse B numa e C na outra, qual eu marco?" | Ambiguidade |
| Filtro (ranking ou torneio) | "O circuito da federação **é** um ranking. Eu jogo torneio que conta ponto no ranking. Marco os dois? Ou só torneio?" Marcou "Rankings e torneios" depois de reler. | Ambiguidade que muda a lógica |
| Rankings por semestre | "Um, o estadual. Mas ele é anual, não por semestre." | Opção não cabe |
| Quem registra o resultado | "No torneio é a arbitragem. Não tem essa opção." Marcou "O organizador ou a arena". | Opção faltando |
| W.O. em 6 meses | "A favor ou contra? Ganhei um por W.O." Marcou "1 ou 2". | Ambiguidade |
| Última vez que abriu um app | "Fui ver a chave e o meu horário. Não tem." Marcou "Ver o resultado de um jogo". | Opção faltando |
| Parte mais chata | "Combinar horário? No torneio ninguém combina, a chave sai e muda. O que me irrita é o horário mudar." Marcou "Acompanhar resultados e ranking" e "Me inscrever e pagar". | Opção faltando |
| Gasto por mês | "Eu gasto por etapa, não por mês. E a viagem conta?" Marcou "Mais de R$ 300" num mês e diria "De R$ 100 a R$ 300" em outro. | Unidade errada |

**Se tivesse marcado "Só torneios"**, a leitura mais literal para quem não joga ranking de arena, não teria visto "Com que frequência você confere sua posição?", e a persona que mais confere a posição ficaria sem essa resposta.

### J2 · Fiel do ranking da arena (BH, C) — completou, ~5 min

| Pergunta | O que a persona disse **[sintético]** | Tipo |
| --- | --- | --- |
| Filtro | "Joguei o torneio da arena, mas isso não é torneio de verdade." Marcou "Só rankings". | Ambiguidade |
| Rankings por semestre | "O nosso não tem semestre, é o ano todo." Marcou "1". | Opção não cabe |
| Como os jogos são marcados | "Desafio no formulário do site e depois combino no WhatsApp." Marcou "Combino direto" e usou "Outro: formulário da arena". | Opção faltando (menor) |
| Quem registra o resultado | "Quem ganha manda o placar no grupo, e a comissão lança. São duas coisas." Marcou "O organizador ou a arena". | Duas perguntas em uma |
| Procura informação do adversário | "No ranking eu conheço todo mundo." Marcou "Nunca", e o formulário pulou "o que você procura". | Pergunta filtra quem não devia |
| Parte mais chata | Marcou "Combinar horários dos jogos". "O resto está bom." | — |
| Gasto por mês | "A taxa do ranking é por semestre." Marcou "Até R$ 100". | Unidade errada |

O "Nunca" do adversário é o problema mais sério desta rodada: o formulário lê "não procura informação", e a persona quis dizer "já conhece".

### J3 · Recém-chegada (Criciúma, D, 3 meses) — completou, ~4,5 min

| Pergunta | O que a persona disse **[sintético]** | Tipo |
| --- | --- | --- |
| Filtro | "Joguei dois torneios da arena." Marcou "Só torneios". | — |
| W.O. em 6 meses | "O que é W.O.?" Marcou "Não lembro". | Jargão |
| Última vez que abriu um app | "Me inscrevi por um link que o professor mandou. Isso é app?" Marcou "Não uso app de Beach Tennis". | Ambiguidade |
| Procura informação do adversário | "Às vezes olho o Instagram da pessoa." | — |
| Uma coisa a melhorar | "Mais torneio para iniciante." | — |
| Topa conversa | "Sou nova, não sei se tenho o que falar." Marcou "Prefiro não". | Viés de recrutamento |

### J4 · Cumpre tabela (São José dos Campos, B mista) — completou com pressa, ~3,5 min

| Pergunta | O que a persona disse **[sintético]** | Tipo |
| --- | --- | --- |
| Abertura | "Pesquisa de quem? De qual app? Diz que é anônima e depois pede contato." Seguiu, desconfiada. | Confiança |
| Rankings por semestre | "Dois: o do circuito e o da arena." | — |
| Quem registra o resultado | "Depende do ranking. No circuito é a organização, na arena sou eu." Marcou o primeiro que viu. | Resposta única para dois casos |
| Última vez que abriu um app | "Me inscrever. E o app me deslogou de novo." | — |
| Parte mais chata | "Não devolvem o dinheiro quando cancela." Usou "Outro". | Opção faltando |
| Gasto por mês | Marcou "Prefiro não dizer". | — |
| Uma coisa a melhorar | "Que o app funcionasse." | — |
| Topa conversa | Marcou "Prefiro não". | Viés de recrutamento |

Leu só o enunciado das perguntas, não as opções inteiras. Nas perguntas com opções embaralhadas, marcou a primeira plausível.

### J5 · Professor-organizador (SP, A) — completou, ~7 min

| Pergunta | O que a persona disse **[sintético]** | Tipo |
| --- | --- | --- |
| Vezes por semana | "Estou na quadra todo dia, dando aula. Jogar mesmo, 2 ou 3." | Ambiguidade (aula conta?) |
| Filtro | "O ranking que eu organizo conta? Eu não jogo nele." Marcou "Rankings e torneios". | Papel duplo |
| Como os jogos são marcados · Quem registra | Respondeu como organizador: "O organizador define", "O organizador ou a arena", ou seja, ele mesmo. | Resposta contaminada |
| Parte mais chata | "Combinar horário dos meus alunos." | Resposta contaminada |
| Uma coisa a melhorar | Um parágrafo sobre um sistema em que "o aluno lança o placar e eu só aprovo". | Fora do tema, mas rico |
| Topa conversa | "Topo." | — |

Nada no formulário atual separa quem responde como jogador de quem responde como organizador. As respostas de marcação e registro desta persona entrariam na análise como se fossem de jogador.

### J6 · Joga por diversão (Porto Alegre) — completou, ~1,5 min

| Pergunta | O que a persona disse **[sintético]** | Tipo |
| --- | --- | --- |
| Categoria | "O professor diz que sou intermediário." Marcou "Não sei ou não jogo por categoria". | Nomenclatura |
| Filtro | "O rei da quadra de sexta tem placar e tabela na lousa. É ranking? Acho que não." Marcou "Nenhum dos dois". | Fronteira de "competir" |
| O que te afasta | "Jogo só por diversão" e "Falta de tempo". | — |
| Topa conversa | "Prefiro não." | — |

O caminho curto funciona. A dúvida é de fronteira: um formato competitivo informal da arena ficou fora de "ranking ou torneio". Se isso for comum, parte do público de P2 cai no ramo de quem não compete.

---

## As rodadas: versão proposta

Mudanças da proposta (`09-proposta-tally.md`): "Além de jogar, você…" na página 2; "O app foi escolha sua?" na página 4; matriz de importância × "como está hoje" com 8 linhas; Kano com 5 pares; saem modalidades, parte mais chata, gasto e "onde busca" do adversário. As perguntas que não mudaram tiveram as mesmas respostas.

### Perguntas de perfil novas

| Persona | "Além de jogar, você…" | "O app foi escolha sua?" | O que aconteceu **[sintético]** |
| --- | --- | --- | --- |
| J1 | Nenhuma dessas | Não, a federação exige | Sem problema |
| J2 | Nenhuma dessas | Não uso app para isso | "O site da arena conta como app?" |
| J3 | Nenhuma dessas | Não uso app para isso | — |
| J4 | Nenhuma dessas | Não, o circuito exige | "E o da arena também. São dois." |
| J5 | Dou aula · Organizo torneio ou ranking | **Sim, eu escolhi** | Respondeu sobre o sistema que **ele** escolheu como organizador |
| J6 | Nenhuma dessas | (não vê) | — |

"Além de jogar" identifica J5, como a proposta pretende. Mas a pergunta vem **depois** que J5 já começou a responder como organizador, e não pede que ele troque de chapéu. **[revisão]** "Nenhuma dessas" não exclui as outras opções.

### Matriz de importância × "como está hoje"

| Persona | Resultado | O que aconteceu **[sintético]** |
| --- | --- | --- |
| J1 | Completou | Linha 6 ("placar contestado"): "Nunca contestei. Como vou dizer como está hoje?" Marcou 3 em "hoje". Linha 3 ("quem está **mesmo** na minha categoria"): "Importa 5, óbvio". Todas as importâncias entre 4 e 5 |
| J2 | Completou | Linha 4 ("horário muda"): "No ranking a gente marca, não muda." Linha 1 ("encontrar competições"): "Não procuro." Marcou 1 e 1. "Repetitivo, mas ok" |
| J3 | Completou, devagar | "Hoje como? Eu nunca tive isso" em 4 das 8 linhas. Marcou 3 em todas elas |
| J4 | **Desistiu** | "Dezesseis bolinhas? Isso é prova." Fechou a aba na primeira matriz |
| J5 | Completou | Linha 6: "Sou eu que resolvo." Deu nota como organizador |

**[revisão]** A escala de "como está hoje" não tem "não se aplica" nem "nunca aconteceu comigo". Pela conta da proposta, a nota 3 de quem nunca viveu a situação entra como satisfação média e **reduz** a pontuação de oportunidade da linha. Nas rodadas, esse caso apareceu em 3 das 5 personas que viram a matriz.

**[revisão]** Linha 3 traz "mesmo" ("quem está **mesmo** na minha categoria"), que sugere que hoje não está. Linha 6 pressupõe que o placar é contestado. As duas tendem a puxar a importância para cima.

**Tela de 393px:** o piloto não vê a tela. O risco da matriz de 8 × 5 no celular continua em aberto e só se confere no *preview* do Tally.

### Kano

| Persona | Resultado | O que aconteceu **[sintético]** |
| --- | --- | --- |
| J1 | Completou, ~3,5 min | K4: "No federado quem lança é a arbitragem. Essa não é para mim." Na disfuncional de K4 ("se o resultado entrasse **sem** o adversário confirmar"), releu duas vezes. Nas disfuncionais de K1 e K3, marcou "Já espero isso": "já sei que não tem, é assim hoje" |
| J2 | Completou | K4: "Eu gostaria… mas se o adversário nunca confirmar, aí não." A resposta dele depende de um "se" que o Kano não captura. K5 (feed): "A gente já vê tudo no grupo." Tanto faz nas duas |
| J3 | **Desistiu** em K2 | K1 disfuncional: "Que posição? Eu não tenho ranking." K2: "Finals?" Fechou o formulário |
| J4 | (já tinha saído) | — |
| J5 | Completou | K4 respondeu como organizador: "Eu não gostaria. Dá trabalho de cobrar." |

**Leitura [sintético]:** três personas (J1, J2, J3) ancoraram a resposta disfuncional no presente: se o app de hoje não tem, "Já espero isso" ou "Dá para conviver" parecem a resposta honesta. Na tabela de avaliação de Kano, isso empurra features de encantamento para **indiferente**.

**[revisão]** K2 (Finals) e K4 (confirmação do adversário) não se aplicam a quem não joga ranking com Finals ou joga só federado, e não há "não se aplica". K4 disfuncional é uma dupla negação implícita ("**sem** o adversário confirmar", depois de uma pergunta sobre "só entrasse depois que confirmasse").

---

## Tempo estimado **[sintético]**

Método: ~8 s por escolha única, ~12 s por caixa de seleção, ~5 s por nota de matriz, ~15 a 20 s por par de Kano (mais releitura quando a persona travou), 30 a 90 s por texto aberto, 2 s por troca de página. É estimativa de leitura, não medição.

| Persona | Caminho | Atual | Proposta |
| --- | --- | --- | --- |
| J1 | Rankings e torneios | ~6 min | ~11 min |
| J2 | Só rankings | ~5 min | ~9,5 min |
| J3 | Só torneios | ~4,5 min | desistiu aos ~7 min |
| J4 | Rankings e torneios | ~3,5 min | desistiu aos ~3 min |
| J5 | Rankings e torneios | ~7 min | ~11,5 min |
| J6 | Nenhum dos dois | ~1,5 min | ~1,5 min |

A versão atual cumpre os "uns 6 minutos" da abertura para quem compete. A proposta passa dos 10 minutos para quem completa: a matriz custa ~2 minutos e o Kano ~3, com as releituras.

---

## Problemas encontrados

Gravidade: **Alta** compromete a leitura de uma suposição de risco ou tira uma persona inteira da análise. **Média** gera ruído que a análise não separa depois. **Baixa** é atrito.

### Versão atual

| ID | Pergunta | Problema | Origem | Gravidade | Sugestão |
| --- | --- | --- | --- | --- | --- |
| T1 | Filtro: ranking ou torneio | "Ranking" tem duas leituras (circuito federado × ranking de arena), e a lógica depende dela | [revisão] + J1, J2, J5 | **Alta** | Explicar no enunciado: *"Ranking aqui é o de arena ou clube (desafio, liga, rodadas). Torneio é o evento de fim de semana, federado ou não."* |
| T2 | Frequência de conferir a posição | Escondida para "Só torneios", onde cai o jogador federado | [revisão] + J1 | **Alta** | Mostrar a todos que competem, com a opção "Não jogo nada que tenha ranking" |
| T3 | Última vez que abriu um app | Falta "Ver a chave ou o horário do meu jogo" (`S8`) | [revisão] + J1 | **Alta** | Acrescentar a opção |
| T4 | Procura informação do adversário | "Alguém que você não conhece" exclui o ranking de arena; "Nunca" vira "não procura" | J2 | **Alta** | Passado e caso único: *"Antes do seu último jogo de competição, você procurou alguma informação sobre os adversários?"* com "Não, já conhecia" como opção |
| T5 | Quem registra o resultado | Junta "quem informa" e "quem lança"; falta "a arbitragem"; uma resposta para quem joga dois rankings | J1, J2, J4 | Média | Perguntar sobre o **último** jogo: *"No seu último jogo de ranking, quem passou o placar?"* e acrescentar "A arbitragem" |
| T6 | Rankings por semestre | Ranking de desafio é contínuo; o federado é anual | J1, J2 | Média | *"Hoje, de quantos rankings você participa?"* |
| T7 | W.O. em 6 meses | Jargão para iniciante; não diz se a favor ou contra | J1, J3 | Média | *"…algum jogo seu não aconteceu por W.O. (uma das duplas não compareceu ou desistiu)?"* com "Sim, a meu favor", "Sim, contra mim", "Os dois", "Nenhum" |
| T8 | Parte mais chata | "Combinar horários" só serve ao ranking de arena; falta "saber o horário no dia do torneio" e "cancelamento e reembolso"; "resultados e ranking" junta duas coisas | [revisão] + J1, J4 | Média | Se a pergunta ficar (a proposta tira), trocar as opções. Se sair, nada a fazer |
| T9 | Gasto por mês | O gasto do federado é por etapa e inclui viagem | J1, J2 | Média | Se ficar (a proposta tira): *"No último torneio ou etapa, quanto você gastou com inscrição?"* |
| T10 | Papel duplo | Professor e organizador respondem como organizador sem que a análise saiba | J5 | Média | Ver V2 abaixo |
| T11 | Vezes por semana | Não diz se aula conta | J5 | Baixa | *"…joga, contando aulas?"* ou separar |
| T12 | Categoria | Quem joga duas categorias não sabe qual marcar; nomenclatura varia ("intermediário") | J1, J6 | Baixa | *"Em qual categoria você joga hoje? Se joga mais de uma, marque a mais alta."* |
| T13 | Filtro, lado de quem não compete | Formatos informais com placar (rei da quadra) ficam fora | J6 | Baixa | Coberto em parte por T1. Vale perguntar nas entrevistas se isso é comum |
| T14 | "Nenhum" em "Quais destes você usa" | Caixa de seleção não exclusiva e embaralhada | [revisão] | Baixa | Conferir no *preview* se o Tally fixa "Nenhum" e "Outro" no fim |
| T15 | Abertura | Não diz quem faz a pesquisa; diz "anônimas" e pede contato | J4 | Baixa | Ver "Decisões para o Gabriel" |
| T16 | Convite para conversa | As personas menos engajadas (J3, J4, J6) recusam | J3, J4, J6 | Média | Não é defeito do form: é o viés de recrutamento que a síntese já cita. Recrutar P3 e P4 também fora do Tally |

### Versão proposta

| ID | Onde | Problema | Origem | Gravidade | Sugestão |
| --- | --- | --- | --- | --- | --- |
| V1 | Matriz "como está hoje" | Sem "nunca aconteceu comigo", a nota 3 de quem não viveu a situação vira satisfação média | [revisão] + J1, J2, J3 | **Alta** | Acrescentar a coluna "Nunca aconteceu comigo" só na matriz de "hoje", e tirar essas respostas da conta |
| V2 | "Além de jogar, você…" | Identifica o professor, mas depois de ele já ter respondido como organizador | J5 | Média | Mover para logo depois do filtro e, para quem marcar "Dou aula" ou "Organizo", mostrar um texto: *"Daqui para frente, responda como jogador."* |
| V3 | Matriz e Kano (tempo) | Duas desistências, das personas já sub-representadas (P3, P4) | J3, J4 | **Alta** | Ver "Decisões para o Gabriel" |
| V4 | Kano, rótulos | "Já espero isso" e "Dá para conviver" ancorados no app de hoje | J1, J2, J3 | **Alta** | Um exemplo antes do bloco, com uma feature neutra respondida. Rótulos mais usados em português: *"Eu gosto", "É o mínimo que espero", "Tanto faz", "Consigo tolerar", "Eu não gosto"* |
| V5 | Kano K2 e K4 | Não se aplicam a parte do público; K4 disfuncional confunde | [revisão] + J1, J3 | Média | Acrescentar "Não se aplica a mim". Reescrever a disfuncional de K4: *"Se o resultado entrasse no ranking na hora, sem esperar o adversário, como você se sentiria?"* |
| V6 | Kano K4 | A resposta depende de um "e se o adversário não confirmar?" | J2 | Média | Não dá para resolver no form. Levar para a entrevista (hipótese H6 do [`05`](05-hipoteses.md)) |
| V7 | Matriz, linhas 3 e 6 | "Mesmo" e a pressuposição de contestação | [revisão] | Média | Linha 3: *"Jogar contra adversários do meu nível"*. Linha 6: *"Saber o que fazer quando alguém discorda do placar"* |
| V8 | "O app foi escolha sua?" | "Site conta?"; quem usa dois apps; o organizador responde sobre a ferramenta dele | J2, J4, J5 | Baixa | *"O app ou site onde você vê seus jogos e seu ranking foi escolha sua?"*; com V2, o professor já responde como jogador |
| V9 | Matriz no celular | Não verificado | [revisão] | ? | Conferir no *preview* do Tally em 393px |

---

## Decisões para o Gabriel

O piloto não decide. Três pontos pedem escolha:

1. **Como encaixar os blocos novos sem perder P3 e P4.** Opções:
   - **a) Formulário único e longo** (a proposta como está): mais dado por respondente, mais desistência nas personas menos engajadas.
   - **b) Duas camadas:** o formulário atual, corrigido, termina com *"Tem mais 4 minutos para ajudar?"* e só quem aceita vê a matriz e o Kano. Menos desistência; a matriz e o Kano medem só os engajados, e isso precisa ficar explícito na análise.
   - **c) Blocos opcionais** no meio do formulário: sem abandono, com respostas parciais, como a própria proposta já aponta.
2. **A abertura diz quem faz a pesquisa?** Dizer o nome do produto ganha confiança de quem desconfia (J4) e enviesa quem tem opinião sobre o app atual. Dizer "pesquisa independente de um designer" é verdadeiro e neutro. Não dizer nada mantém a desconfiança.
3. **Quais correções da versão atual entram mesmo que a proposta não entre.** T1 a T4 não dependem da proposta.

---

## O que levar para o pré-teste com gente real

A síntese já sugere um pré-teste de 3 a 5 pessoas respondendo em voz alta, no celular. O piloto diz **onde olhar**:

| Onde observar | O que confirmaria o problema |
| --- | --- |
| Filtro, com alguém de circuito federado | A pessoa hesita entre "Só torneios" e "Rankings e torneios", ou pergunta o que é ranking |
| "Procura informação do adversário", com alguém de ranking de arena | A pessoa marca "Nunca" dizendo que já conhece todo mundo |
| Matriz "como está hoje" | A pessoa diz "nunca aconteceu" e marca o meio |
| Disfuncionais do Kano | A pessoa relê, ou justifica a resposta com "hoje já é assim" |
| O tempo total, cronometrado | Passa de 10 minutos na versão proposta |
| A matriz num celular pequeno | A pessoa rola na horizontal ou erra a linha |
