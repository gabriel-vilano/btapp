# 01 — As personas sintéticas

9 personas: 6 de jogador, montadas a partir das proto-personas P1 a P5 da síntese, e 3 de organizador, montadas a partir da persona P6 e dos perfis A a E do roteiro de entrevista.

> **[sintético]** Tudo neste arquivo é um perfil para ensaiar instrumentos. As personas não existem. O contexto concreto de cada uma (cidade, categoria, ferramenta, regra) vem de uma fonte do discovery, citada na linha; o que foi inventado para completar o perfil está na lista **Inferido**.

Códigos de fonte: os da síntese (`PUB`, `MER`, `JOR`, `DOR`, `ARE` etc.) e os de organizadores (`REG1` a `REG4`, `YT1`, `RA3`, `ACAD1` etc.). A tabela completa está no `README.md` da síntese (`docs/discovery/sintese/README.md`, PR #31) e, para os códigos de organizadores, no Linear (evidência: documento D5 ("Fontes e ferramentas dos organizadores"), projeto Discovery e estratégia no Linear).

---

## Como as personas foram montadas

1. **Base comportamental** da proto-persona da síntese: o que faz, o que a move, onde dói.
2. **Um contexto concreto** tirado de uma fonte específica do discovery, para que a persona responda sobre uma regra, uma cidade e uma ferramenta que existem (ex.: o regulamento FCTBT 2025, e não "uma federação qualquer").
3. **Traços de resposta:** paciência, aparelho, momento em que responde, desconfiança. São o que faz a persona travar ou desistir, e são quase todos inferidos.
4. **Gatilhos de desistência** escritos antes do piloto, para que a desistência não dependa do humor da rodada.

**Nomes funcionais, sem nome próprio.** Mesma escolha da síntese: evita tratar a hipótese como pessoa real e evita atribuir gênero a um arquétipo. As duas personas com gênero gramatical marcado (J3, O2) herdam o dado da fonte: o estudo de Criciúma tem 75% de mulheres (`PUB`) e o vídeo YT1 é de uma dupla de organizadoras.

---

## Jogadores

Mapa das personas de jogador pelo caminho que devem seguir no Tally. Cobrir os quatro ramos da pergunta de filtro ("Nos últimos 12 meses, você jogou algum ranking ou torneio?") era requisito da issue.

| Persona | Base | Ramo esperado no filtro | Por que está no piloto |
| --- | --- | --- | --- |
| J1 · Escalador federado | P1 | "Só torneios" **ou** "Rankings e torneios" | Testa a ambiguidade de "ranking" para quem joga circuito federado |
| J2 · Fiel do ranking da arena | P2 | "Só rankings" | Testa o ramo de ranking e as perguntas de marcação e registro |
| J3 · Recém-chegada | P3 | "Só torneios" | Pouca paciência e pouco vocabulário; testa o Kano |
| J4 · Cumpre tabela | P4 | "Rankings e torneios" | Responde com pressa e com desconfiança; testa o tempo |
| J5 · Professor-organizador | P5 | "Rankings e torneios" | Responde de dois lugares ao mesmo tempo |
| J6 · Joga por diversão | não-público | "Nenhum dos dois" | Testa o caminho curto e a fronteira de "competir" |

---

### J1 · O escalador federado

| | |
| --- | --- |
| **Base** | P1 · escalador de categoria |
| **Onde** | Fortaleza (CE), circuito estadual da FCTBT |
| **Categoria** | C masculina, e mista C no mesmo fim de semana (a FCTBT permite até 2 categorias por fim de semana) |
| **Rotina** | Treina 3 a 4 vezes por semana; joga as etapas estaduais da temporada; quer ficar entre os 18 melhores da C para subir para a B |
| **Ferramentas** | Sistema da federação para inscrição e chave; Instagram da federação e das arenas; grupo de WhatsApp da dupla e da turma de treino |
| **Gasto com competição** | Inscrição federada de R$ 145 a 185 por categoria, R$ 195 a 280 por duas; anuidade R$ 160 |
| **Como responde** | No celular, à noite. Paciente com pergunta objetiva; irritado com pergunta que "não entende como funciona o circuito" |
| **Gatilho de desistência** | Mais de duas perguntas seguidas que não se aplicam ao circuito federado |

**Da evidência:** categorias Iniciante a PRO, até 2 categorias por fim de semana, ranking com as 7 melhores pontuações, promoção C→B dos 18 melhores masculinos, preços de inscrição e anuidade, inscrição só online pelo sistema da federação (`PUB` 2.1, 2.2, 3 e 4, regulamento FCTBT 2025 lido na íntegra). Treino 3 a 4 vezes por semana (`PUB HP4`, Fraca).

**Inferido:** a cidade dentro do Ceará; jogar exatamente a C; o horário em que responde; a irritação com pergunta genérica; a quantidade de etapas por ano.

---

### J2 · O fiel do ranking da arena

| | |
| --- | --- |
| **Base** | P2 · fiel do ranking da arena |
| **Onde** | Região metropolitana de Belo Horizonte (MG), numa arena com ranking de desafio parecido com o da AVB Arena |
| **Categoria** | C no ranking da arena. Nunca jogou torneio federado |
| **Rotina** | Aula em grupo 2 vezes por semana na mesma arena; um jogo de ranking a cada 2 ou 3 semanas; às vezes o torneio da casa |
| **Ferramentas** | Grupo de WhatsApp do ranking (desafio, aviso com *template*, placar com as parciais); formulário no site da arena para desafio e indisponibilidade; a página do ranking no site |
| **Como responde** | No celular, depois do jogo, sem pressa. Tende a achar que "está tudo bem" |
| **Gatilho de desistência** | Nenhum forte. Desiste só se o formulário parecer longo demais para "uma coisa da arena" |

**Da evidência:** ranking de desafio com formulário no site aprovado pela comissão, placar "com as parciais de cada set", torneios da arena somando pontos, C valendo 80% dos pontos de A (`JOR` 2, REG3 lido); desafio pelo WhatsApp com aviso no grupo usando *template* (REG2); preferência por jogar na arena e com amigos (`PUB` 2.3, Média).

**Inferido:** a cidade exata; a frequência de jogos de ranking; nunca ter jogado torneio federado; a tendência a achar que está tudo bem (é o traço que testa se o formulário captura dor de quem não reclama).

---

### J3 · A recém-chegada

| | |
| --- | --- |
| **Base** | P3 · recém-chegado competitivo |
| **Onde** | Criciúma (SC) |
| **Categoria** | D. Joga há 3 meses |
| **Rotina** | Aula em grupo 2 vezes por semana; jogou 2 torneios amadores de arena; mora a poucos quilômetros da arena |
| **Ferramentas** | Instagram da arena para saber de torneio; grupo de WhatsApp da turma de aula; inscrição por link que o professor mandou |
| **Gasto com competição** | Inscrição de torneio amador de arena, na faixa de R$ 70 por atleta |
| **Como responde** | No celular, entre outras coisas. Pouco vocabulário de circuito ("ranking" para ela é "a lista da arena") |
| **Gatilho de desistência** | Pergunta que ela não entende duas vezes seguidas; sensação de estar "fazendo prova" |

**Da evidência:** em Criciúma, 44,8% dos que competem jogam a D, 48% jogavam havia 1 a 3 meses, 87,7% moram a 1 a 4 km do local, maioria de mulheres (`PUB` 2.1, 2.3 e tabela de perfil, RSD Journal, Média). Faixa de inscrição de torneio amador (`PUB` 3, Média). O professor como porta de entrada (`PUB HP8`, Média).

**Inferido:** ter jogado exatamente 2 torneios; a inscrição por link do professor; o vocabulário limitado; os gatilhos de desistência.

---

### J4 · Quem cumpre tabela

| | |
| --- | --- |
| **Base** | P4 · quem cumpre tabela |
| **Onde** | São José dos Campos (SP), etapas de um circuito privado nacional |
| **Categoria** | B mista |
| **Rotina** | Joga as etapas do circuito na região e, entre elas, o ranking da arena onde treina |
| **Ferramentas** | O app do circuito, porque a inscrição só existe lá; o sistema do ranking da arena; WhatsApp para tudo o resto |
| **Histórico** | Já perdeu inscrição sem reembolso e já teve problema de login no dia de jogo |
| **Como responde** | No celular, entre jogos, com pressa. Desconfia de "pesquisa de empresa de app" |
| **Gatilho de desistência** | Bloco que parece não ter fim (matriz, grade); pergunta que parece venda |

**Da evidência:** uso do app porque o circuito exige (`MER O5`, `RS4`, Forte); queixa de login "no meio do torneio" (`MER O7`, Forte); navegação como dor mais citada (`MER O6`, Forte); etapa de São José dos Campos de um circuito privado com reclamação de desclassificação e reembolso, e política de não reembolso do circuito (RA3, RA7, lidos).

**Inferido:** categoria; jogar também um ranking de arena; a desconfiança com pesquisa; responder entre jogos.

---

### J5 · O professor-organizador

| | |
| --- | --- |
| **Base** | P5 · professor-organizador |
| **Onde** | Uma arena em São Paulo (SP) |
| **Categoria** | A, e às vezes Open |
| **Rotina** | Dá aula de manhã e à noite; organiza um torneio aberto por trimestre na arena e mantém um ranking dos alunos; compete como vitrine da arena |
| **Ferramentas** | Planilha e WhatsApp para o ranking dos alunos; um sistema de torneio para a inscrição; Instagram da arena |
| **Como responde** | No celular, no intervalo entre aulas. Responde metade como jogador e metade como organizador |
| **Gatilho de desistência** | Nenhum. Mas escreve muito no campo aberto e sai do tema |

**Da evidência:** organizadoras que também dão aula e fazem o torneio aberto numa arena de SP (`JOR` 3, YT1); professor que compete como marketing da arena e parceria de arena com professor para campeonato (`ARE` 3, ACAD1, ACAD2, Média); 3/4 dos jogadores de um evento já contrataram professor (`PUB` 5.3, Média).

**Inferido:** manter um ranking de alunos em planilha; a frequência do torneio; a categoria.

---

### J6 · Quem joga por diversão

| | |
| --- | --- |
| **Base** | Não-público do `docs/PRODUCT.md` ("quem não compete não tem motivo para usá-lo") |
| **Onde** | Porto Alegre (RS), aula em grupo num clube |
| **Categoria** | Não sabe. "Intermediário", segundo o professor |
| **Rotina** | Aula 2 vezes por semana; joga o "rei da quadra" de sexta na arena com a turma, com placar numa lousa |
| **Ferramentas** | App de reserva de quadra; grupo de WhatsApp da turma |
| **Como responde** | Chegou ao formulário por um amigo. Curiosidade baixa |
| **Gatilho de desistência** | Sentir que o formulário "não é para mim" |

**Da evidência:** 59% jogam por recreação na amostra de Criciúma (`PUB` 1.2, Média); mensalidade de clube de 2 aulas por semana em Porto Alegre (`PUB` 3, Resumo); planilha de torneio no formato "rei da quadra" à venda (FL2, só título).

**Inferido:** o "rei da quadra" semanal com placar em lousa (é o traço que testa a fronteira entre "competir" e "jogar"); a categoria dita pelo professor; a curiosidade baixa.

---

## Organizadores

As três personas cobrem os perfis A, B + E e D do roteiro. O perfil C (etapa federada, árbitro geral) ficou de fora: o roteiro pede 2 ou 3 personas, e o perfil C é o único que já tem regra escrita lida na íntegra (REG1, REG4). Os outros três não têm nenhuma voz em primeira pessoa sobre o tema, que é justamente onde o roteiro mais pode falhar.

| Persona | Perfil do roteiro | Formato | Tipo de entrevistado que simula |
| --- | --- | --- | --- |
| O1 · Comissão de ranking de clube | A | Ranking de desafio | Resposta curta, "é tranquilo", minimiza a dor |
| O2 · Professora que organiza torneio | B + E | Torneio aberto de arena | Fala muito, generaliza, puxa para a solução |
| O3 · Dono de arena pequena | D | Arena que recebe torneio | Desconfiado, fecha número, encerra cedo |

---

### O1 · A comissão do ranking de clube

| | |
| --- | --- |
| **Perfil do roteiro** | A · organizador de ranking de arena |
| **Onde** | Clube social em Minas Gerais, ranking de desafio com cerca de 80 pessoas |
| **O que faz** | Faz parte da "comissão gestora", voluntária. Inclui e exclui atletas, aprova desafio, cobra resultado, aplica W.O. por prazo, mantém a página do ranking e decide os casos omissos |
| **Ferramentas** | Formulário no site para desafio e indisponibilidade; grupo de WhatsApp com *template* de aviso; planilha que alimenta a página |
| **Tempo** | Não sabe dizer quanto gasta. "Um pouco todo dia" |
| **Como se comporta na entrevista** | Educado, curto. Não se vê como "organizador". Acha que o ranking "funciona" |

**Da evidência:** a lista de tarefas da comissão, quase igual nos dois regulamentos de desafio; prazos de W.O. de 1 semana para responder e 15 dias para jogar; desafio aprovado por formulário; aviso com *template* no grupo; resultado com parciais (`JOR` 2, REG2 e REG3 lidos). "Quase 80 pessoas em nosso ranking" no 3º mês de um app de organizador (`DOR D7`, AS1).

**Inferido:** ser voluntário; ser clube social e não arena comercial; não saber o tempo gasto; a postura de minimizar.

---

### O2 · A professora que organiza torneio

| | |
| --- | --- |
| **Perfil do roteiro** | B · torneio independente, e E · professor que organiza |
| **Onde** | Arena em São Paulo (SP), torneio aberto de dois dias, organizado em dupla com outra professora |
| **O que faz** | Inscrição, pagamento por dupla, camisa, frutas, chave, chamada, W.O., placar, transmissão das finais, patrocínio local. Dá aula na mesma semana |
| **Dia do torneio** | Chega às 8h30; no primeiro dia sai depois das 23h; no segundo fecha perto das 20h |
| **Ferramentas** | Um sistema de torneio para inscrição e chave; WhatsApp com os atletas; rádio comunicador entre quadras; YouTube para as finais |
| **Como se comporta na entrevista** | Fala muito e com energia. Generaliza ("sempre dá problema"). Na primeira brecha, descreve o app que queria |

**Da evidência:** o vlog de dois dias de torneio aberto de organizadoras que também são professoras, horários, frutas, rádio, bolas, transmissão, patrocínio (`JOR` 1.1, 1.2 e 3, YT1 e YT3 lidos); o pagamento só confirmado com os dois da dupla (RA3) e o fluxo em que "partners entered free" (GH); camisa perguntada "individualmente via WhatsApp" (GH #70).

**Inferido:** usar exatamente um sistema de torneio para a inscrição; a tendência a propor solução; a generalização.

---

### O3 · O dono de arena pequena

| | |
| --- | --- |
| **Perfil do roteiro** | D · dono ou gestor de arena |
| **Onde** | Cidade do interior do Ceará, arena com 4 quadras |
| **O que faz** | Aluga quadra, vende aula (por parceria com professor), day use e bar. Recebe torneio organizado por terceiros e faz um torneio próprio por ano |
| **Ferramentas** | App de reserva de quadra; WhatsApp; o professor parceiro cuida do torneio |
| **Relação com competição** | O torneio ocupa quadra que estaria alugada. Serve para "a arena aparecer" |
| **Como se comporta na entrevista** | Desconfiado. Quer saber quem está pagando a pesquisa. Não abre número. Acha que o assunto é do professor |

**Da evidência:** o caso da arena no interior do Ceará construído com visitas e entrevista com um dos sócios, a parceria com professor "com experiência em promover campeonatos" para fidelizar (`ARE` 3, ACAD1 lido na íntegra); professores que competem como estratégia de marketing (ACAD2); receita da arena além de quadra (`ARE`).

**Inferido:** o número de quadras; fazer um torneio próprio por ano; a desconfiança; recusar número; o gatilho de encerramento.

**Gatilho de encerramento:** pergunta sobre dinheiro logo depois de outra pergunta que ele achou "de consultor". Encerra educadamente e não indica ninguém.
