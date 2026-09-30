# EXPLORE.md — LetzPlay

Spec da aba Explorar: a vitrine de competições e arenas, a busca do app, a página da organização e os blocos "Como se inscrever" e "Tenho interesse" da página da competição.

> Este doc detalha **o conteúdo** do que a `docs/NAVIGATION.md` já decidiu que existe (seção 7, N32 a N34): a aba, os três escopos da busca, a vitrine enxuta, a página da organização. Onde as coisas moram e como se chega a elas continua sendo da NAVIGATION. A página da competição é da `docs/RANKING.md` (RK17); daqui saem só os dois blocos para quem ainda pode se inscrever. As regras daqui são numeradas **EX1, EX2…**, e as leituras do agente **EL1, EL2…**, para não colidir com as R do domínio, as N e as L da navegação e as RK do ranking. Rotas são propostas.

---

## Fontes

As siglas são as mesmas do `docs/DOMAIN.md` > "Fontes" e da `docs/NAVIGATION.md` > "Fontes". As que esta spec usa, mais as próprias:

| Sigla | Conteúdo usado aqui |
| --- | --- |
| **DEC-NAV-Q** | Q1 (Explorar enxuto no MVP) e Q5 (uma busca só, no Explorar, com três escopos) |
| **DEC-NAV-A** | L12 (o escopo inicial da busca é Jogadores, N32), L13 ("Tenho interesse" privado, para medir a demanda), L14 (organização com tipo, cidade e contato; a arena é o tipo arena) |
| **DEC-EXP** | Decisões do Gabriel na issue desta spec (29/09, ~20:40 UTC): EQ1 (a busca começa em Jogadores, com a contagem de resultados em cada escopo), EQ2 (toda organização tem página, em `/organizacoes/[organizacao]`), EQ3 (no beta, só as organizações que promovem competição; dados reais pela carga, nunca no repositório) e as leituras EL1 a EL14 confirmadas, com ajustes na EL9 e na EL12 |
| **NAV** | `docs/NAVIGATION.md`: N6, N10, N28, N32 a N34, estados (seção 9), acessibilidade (10.3) e métricas (seção 13) |
| **RANK** | `docs/RANKING.md`: página da competição (RK17) e StandingSummaryItem |
| **PROF** | `docs/PROFILE.md`: perfil visível para qualquer jogador com conta (PF20) |
| **SCHED** | `docs/SCHEDULING.md` M23: o telefone nunca aparece na busca, e a regra vale no banco |
| **FEED** | `docs/FEED_CARDS.md` §11.2: a descoberta de organizações fica numa tela de competições, não no feed. O comentário da issue desta spec pedia para avaliar se a busca absorve essa tela: **absorve**, com os filtros por nível e região fora do MVP (DEC-NAV-Q) |
| **REF** | `docs/discovery/referencias/06-descoberta-competicoes.md`: página do evento, "rankings × torneios" |
| **DSC** | `docs/DISCOVERY.md`: oportunidade 1.2 (descoberta por nível e região) com evidência **fraca** |
| **NNG-SCOPE** | Katie Sherwin, ["Scoped Search: Dangerous, but Sometimes Useful"](https://www.nngroup.com/articles/scoped-search/), Nielsen Norman Group, 2015 (lido em 29/09/2026): "Sites that select a scope by default are the worst offenders"; "Always set the default scope to 'all'"; "Users are more likely to change the search scope in retrospect than during their first search attempt"; o resultado deve dizer o escopo e oferecer ampliar num toque |
| **HIG-SEARCH** | Apple Human Interface Guidelines, ["Search fields"](https://developer.apple.com/design/human-interface-guidelines/search-fields) (lido em 29/09/2026): "If possible, start search immediately when a person types"; "Use placeholder text to help people know what they can search for… when you need to reinforce the scope"; "Default to a broader scope and let people refine it as they need" |
| **MOB** | Telas de busca no Mobbin (29/09/2026), 10 apps. Com uma visão "todos" antes dos escopos: 5 ([Givingli](https://mobbin.com/screens/af2aa6db-4042-441f-993b-8d7e12da1708), [Posh](https://mobbin.com/screens/fe24a89a-b184-4763-bc6c-4e1ff3146b76), [Substack](https://mobbin.com/screens/231a27f2-0cf7-4041-a275-f96bbdba0f28), [Hulu](https://mobbin.com/screens/6ee2fbb3-d7cf-4e42-99ee-8998c1ebc01d), [Hypelist](https://mobbin.com/screens/7ace65a4-e8e0-4799-a49b-f2081931bce4)). Só com escopos: 4 ([Strava](https://mobbin.com/screens/d9be8a1e-6e79-4bac-8741-e2bf33b81395), [Polarsteps](https://mobbin.com/screens/7fd17bf2-7230-4415-9eca-a2d0d1e01bf7), [Vestiaire](https://mobbin.com/screens/1a20b6c0-36fe-4a9f-a8c9-483703cb88ff), [pliability](https://mobbin.com/screens/83a41f1f-dc86-47ad-8055-ecd0df594f1a)). O Hulu mostra a contagem em cada escopo ("Movies (11)", "Episodes (12)"). Amostra pequena: serve de exemplo, não de estatística |
| **DEC-EXP-2** | Resposta do Gabriel na issue desta spec (30/09): confirma a EX27 ("Tenho interesse" só enquanto há categoria livre e o jogador não tem inscrição na competição) e a EL15 |
| **DEC-EXP-3** | Decisão do Gabriel na issue do SearchField e da contagem nas Tabs (30/09): os escopos da busca usam as **Tabs do DS**, e não o SegmentedControl. As Tabs não pedem variante nova e, com o texto ampliado (WCAG 1.4.4 e 1.4.10), rolam em vez de cortar. Medido com a Arimo a 393px: as três abas com contagem ocupam 120, 131 e 110px; no SegmentedControl, cada segmento igual tem 93px para o texto, e "Competições 1" (99,6px) sairia cortado |
| **WCAG-253** | WCAG 2.2, critério 2.5.3 "Label in Name": o nome acessível contém o rótulo visível |
| **APG-BUTTON** | WAI-ARIA Authoring Practices, padrão "Button": num botão de alternar, o rótulo não muda com o estado; se o rótulo muda, não se usa `aria-pressed` |
| **LEIT** | Leitura do agente desta spec. Todas foram confirmadas pelo Gabriel: EL1 a EL14 na DEC-EXP, EL15 e a junção da EX27 na DEC-EXP-2. O mapa está na seção 10 |

---

## 1. Princípio

**Vitrine curta, busca que responde.** O Explorar é uma aposta medida: a evidência da descoberta por nível e região é fraca (DSC 1.2), e o beta tem dois organizadores. Por isso a aba não finge volume: mostra o que existe, deixa claro como entrar em cada competição (com o organizador, R32) e mede a procura com o "Tenho interesse". Filtro, recomendação e mapa só entram se as métricas da seção 9 mostrarem uso.

A busca tem outro papel: é a porta mais curta para um perfil (JTBD 3, avaliar o adversário) e para a competição que alguém citou no WhatsApp. Ela precisa achar o que o jogador digita do jeito que ele digita: sem acento, pelo sobrenome, com ou sem @.

### Termos desta spec

- **Competição aberta:** ranking com temporada em andamento, ou torneio cuja data de fim é hoje ou depois. É a que ainda admite jogo. O resto é **encerrada**: ranking entre temporadas (a última terminou e a próxima não começou) e torneio que já aconteceu.
- **"Arena" tem três sentidos no app**, e esta spec usa sempre o qualificado:
  1. **Organização do tipo arena** (DOMAIN, glossário): uma entidade, com página (seção 5). É o que o escopo "Arenas" e a seção "Arenas" da vitrine listam.
  2. **Local do torneio**: texto guardado no torneio (`TournamentCompetition.venue` no código; o `DOMAIN.md` ainda não o descreve). Aparece no item do torneio ("Sáb, 12/10 · Arena Sunset").
  3. **Arena da partida**: texto opcional da data acordada (R34, M18).

  Os dois textos não apontam para a organização. **Limite aceito no MVP:** um torneio de outra organização jogado numa arena não aparece na página dessa arena, e tocar no local do torneio ou da partida não abre nada.

---

## 2. A tela

- **EX1. O Explorar tem, de cima para baixo: o título "Explorar", o campo de busca e a vitrine** (seção 3). As abas de escopo (Jogadores · Competições · Arenas, com as Tabs do DS) aparecem **só quando o campo tem foco ou texto**, logo abaixo dele, e a vitrine dá lugar aos resultados. [NAV N32, N33; HIG-SEARCH; DEC-EXP EL1; DEC-EXP-3]

  **Por quê:** a HIG põe a barra de escopo "na área de resultados". Mostrar os escopos sem busca poria três abas acima de uma vitrine que não depende deles.
- **EX2. A busca começa enquanto o jogador digita, a partir de 2 caracteres.** Com 1 caractere, a área de resultados diz "Digite ao menos 2 letras." Sem termo e com foco, ela fica vazia, com o controle de escopos visível. [HIG-SEARCH; DEC-EXP EL1]
- **EX3. O placeholder diz o que o escopo busca:** "Nome ou @username" (Jogadores), "Competição ou organizador" (Competições), "Arena ou cidade" (Arenas). O rótulo acessível do campo é "Buscar". [HIG-SEARCH]
- **EX4. O escopo começa em Jogadores** (N32) e volta para ele quando o campo é limpo ou o jogador sai da aba. Ao voltar de um resultado com "Voltar", o termo, o escopo e a rolagem continuam como estavam. [NAV N10, N32; NNG-SCOPE; DEC-EXP EL2]

  **Por quê voltar ao padrão:** a NN/g observa que quem troca de escopo esquece que trocou e faz a busca seguinte no escopo errado. Guardar o escopo só enquanto há termo evita isso sem apagar o trabalho de quem abriu um resultado e voltou.
- **EX5. Cada aba de escopo mostra a contagem de resultados do termo atual:** "Jogadores 0 · Competições 1 · Arenas 1". A contagem aparece a partir da primeira busca (2 caracteres) e se atualiza com o termo; sem termo, as abas mostram só o nome. Acima de 99, a aba mostra "99+". O nome acessível de cada aba inclui a contagem ("Competições, 1 resultado"). Os escopos usam as Tabs do DS, e não o SegmentedControl (DEC-EXP-3). [DEC-EXP EQ1; DEC-EXP-3; NNG-SCOPE; MOB (Hulu)]

  **Por quê:** a busca começa num escopo só, que é o caso que a NN/g aponta como o de maior risco: quem digita "Vila" em Jogadores não vê o Vila do Tênis e conclui que ele não está no app. O número na aba mostra onde está o resultado sem mudar o escopo inicial.

  **Limite de largura:** as três contagens precisam caber a 393px ao lado de "Competições" (NAV N25), sem truncar. A issue do SearchField testa com a fonte real e com contagens de 2 dígitos. Se não couber, a decisão volta ao Gabriel. Trocar para um escopo "Tudo" também precisa da aprovação dele. [DEC-EXP EQ1]

---

## 3. Vitrine

A vitrine é o Explorar sem termo digitado. Responde "o que existe para eu jogar?" com o que os organizadores do beta cadastraram.

- **EX6. Duas seções, nesta ordem: "Competições" e "Arenas".** Cada uma é um `<section>` com título (`h2`) e lista. [NAV N33]
- **EX7. Rankings e torneios ficam numa lista só, com o tipo escrito no item** ("Ranking", "Torneio"). Com poucas competições no beta, duas listas separadas deixariam uma delas quase vazia. [REF "Rankings × torneios", opção 1; DEC-EXP EL3]
- **EX8. Ordem da lista de competições:**
  1. **Torneios abertos**, do mais próximo ao mais distante: têm data marcada, e a data é o que o jogador decide.
  2. **Rankings com temporada em andamento**, por nome.
  3. **Rankings entre temporadas**, por nome, com "Entre temporadas".

  **Torneios que já aconteceram não entram na vitrine**: não há o que fazer com eles. Aparecem na busca (EX15). [NAV N33; DEC-EXP EL3]
- **EX9. As competições em que o jogador já está inscrito aparecem na vitrine**, no mesmo lugar da ordem, com o Badge "Você participa". Tirar da vitrine faria o jogador de um ranking do Vila achar que o Vila não está no app. [DEC-EXP EL4]
- **EX10. O item de competição** (CompetitionListItem, seção 8):
  - avatar da organização e nome da competição;
  - linha de apoio: tipo · organização · cidade ("Ranking · Vila do Tênis · Belo Horizonte");
  - situação: no ranking, "Temporada 2026/2 · rodada 3" ou "Entre temporadas"; no torneio, a data e o local ("Sáb, 12/10 · Arena Sunset") ou "Encerrado";
  - Badge "Você participa" quando há inscrição ativa (EX9).

  Toque → a página da competição (`/competicoes/[competicao]`, NAV N9). [RANK RK17; NAV N33]
- **EX11. A seção "Arenas" lista as organizações do tipo arena, por nome.** O item (ArenaListItem): avatar, nome, cidade e "2 competições abertas" (ou "Nenhuma competição aberta"). Toque → a página da organização (seção 5). [NAV N34; DEC-EXP EQ2]
- **EX12. Sem paginação na vitrine no MVP.** O beta tem poucas competições; a lista mostra todas. Rever quando uma seção passar de 20 itens (seção 11, "Riscos"). [DEC-EXP EL5]
- **EX13. Vazios:** sem competição aberta, a seção "Competições" diz "Nenhuma competição aberta agora." e mostra só os rankings entre temporadas, se houver; sem organização do tipo arena, a seção "Arenas" some. Com as duas vazias (só em ambiente de desenvolvimento, porque os organizadores do beta já estão cadastrados), o EmptyState diz "Ainda não há competições no LetzPlay." [NAV N22, 9.2]

---

## 4. Busca

Os escopos, o que cada um busca e o escopo inicial são da N32. Esta seção define a correspondência, a ordem, o item e os estados.

- **EX14. O que cada escopo busca:**

| Escopo | Busca em | Entra no resultado | Toque leva a |
| --- | --- | --- | --- |
| **Jogadores** | Nome, sobrenome e @username | Todo jogador com conta, menos o próprio (o próprio perfil está na aba Perfil) | `/jogadores/[username]` |
| **Competições** | Nome da competição e nome da organização | Rankings e torneios, abertos e encerrados | `/competicoes/[competicao]` |
| **Arenas** | Nome e cidade | Organizações do tipo arena | `/organizacoes/[organizacao]` |

  O telefone, o e-mail e a data de nascimento nunca são buscáveis nem voltam no resultado (PROF, SCHED M23). [NAV N32; PROF PF20; DEC-EXP EQ2, EL7]
- **EX15. A correspondência ignora maiúsculas e acentos e vale pelo início de qualquer palavra.** "joao" acha "João Silva"; "sil" acha "Ana Silva"; "@lu" e "lu" acham "@lucas.m". Não há correção de erro de digitação no MVP. [DEC-EXP EL6]

  **Por quê:** o jogador digita no celular, na quadra, e nomes brasileiros têm acento. Achar pelo sobrenome importa porque o adversário é conhecido pelo sobrenome no chaveamento.
- **EX16. Ordem dos resultados:**
  - **Jogadores:** @username igual ao termo; depois amigos; depois quem tem inscrição ativa numa competição em comum com o jogador (o adversário provável, JTBD 3); depois os demais. Empate: ordem alfabética do nome.
  - **Competições:** a mesma ordem da vitrine (EX8), com os torneios encerrados no fim, do mais recente ao mais antigo.
  - **Arenas:** nome que começa pelo termo antes de cidade que começa pelo termo; empate em ordem alfabética.

  [DEC-EXP EL7]
- **EX17. O item de jogador** (PlayerListItem): avatar, nome completo e @username; na linha de apoio, "Amigo", ou a competição em comum ("Rankin · Masculino B"), ou nada. O item de competição e o de arena são os da vitrine (EX10, EX11). [PROF PF4; DEC-EXP EL8]

  **Por quê a competição em comum:** dois "Lucas" no mesmo beta são prováveis. A competição separa o adversário do homônimo sem abrir o perfil.
- **EX18. Até 20 resultados, com "Mostrar mais"** no fim da lista. A contagem total é anunciada ("12 jogadores encontrados") numa região `aria-live="polite"` (NAV 10.3; WCAG 4.1.3). [DEC-EXP-2 EL15]
- **EX19. Sem resultado:** "Nada encontrado para '[termo]' em [escopo]." e, abaixo, um link para cada **outro escopo com resultado** para o mesmo termo, com a contagem ("Ver 2 em Competições"). Escopo com zero não ganha link: ele levaria a outra tela vazia. Se nenhum escopo tem resultado, só a frase. A contagem das abas (EX5) já mostra os três números. [NAV 9.2; NNG-SCOPE]
- **EX20. Carregando e erro:** 3 linhas de Skeleton no formato do item do escopo; se a busca falha, "Não foi possível buscar. Tentar de novo" no lugar dos resultados, e o campo continua editável. Resultado que chega fora de ordem (o de um termo anterior) é descartado. [NAV N23, N24]
- **EX21. A busca exige login**, como o perfil (PF20). Sem login, `/explorar` leva ao login e volta ao Explorar depois dele (NAV N28). [PROF PF20]

---

## 5. Página da organização

Toda organização tem página, qualquer que seja o tipo (arena, clube, federação ou grupo). A arena é um dos tipos, não uma entidade à parte. [DEC-EXP EQ2; NAV N34]

- **EX22. A página da organização tem três blocos, nesta ordem: cabeçalho, contato e competições.** Rota proposta `/organizacoes/[organizacao]`. [NAV N34; DEC-EXP EQ2]

| Bloco | Conteúdo |
| --- | --- |
| **Cabeçalho** | Avatar, nome, o tipo escrito ("Arena", "Clube", "Federação", "Grupo") e a cidade |
| **Contato** | O contato que a organização informou. Quando é um link (WhatsApp, Instagram, site), vira o botão "Falar com [nome]", que abre o link fora do app. Quando é só texto (um telefone, um e-mail, "procure o Carlos na recepção"), o bloco mostra o texto como foi escrito, selecionável, sem botão. Sem contato cadastrado, o bloco some |
| **Competições** | As competições **que a organização promove**, com o item da vitrine (EX10) e a mesma ordem (EX8). As encerradas ficam atrás de "Ver encerradas (N)". Sem competição aberta: "Nenhuma competição aberta agora." |

- **EX23. Chega-se à página pelo item da seção "Arenas" e do escopo "Arenas"** (EX11, EX14) e **pela organização no cabeçalho** da página da competição (RK17) e dos cards do feed (NAV, tabela de toques). As organizações de outros tipos não aparecem na vitrine nem na busca: chega-se a elas pelos cabeçalhos, e o nome delas é buscável no escopo "Competições" (EX14). [DEC-EXP EQ2]
- **EX24. A página não tem endereço, mapa, quadras, horários nem reserva.** A organização guarda só tipo, cidade e contato (DOMAIN), e aulas e reserva de quadras estão fora do MVP (`PRODUCT.md`). [NAV N34; DEC-EXP EL13]
- **EX25. O local do torneio e a arena da partida continuam sendo texto** (seção 1, "Termos") e não viram link para esta página. Ligar os dois pediria escolher a organização numa lista no cadastro do torneio e na marcação, o que a SCHEDULING não prevê. [NAV N34, R34; DEC-EXP EL13]

---

## 6. Página da competição: como se inscrever

A página é da `RANKING.md` (RK17). A NAVIGATION (N33) decidiu que dois blocos entram logo abaixo do cabeçalho para quem ainda pode se inscrever. Esta seção define quando eles aparecem e o que mostram.

- **EX26. "Como se inscrever" aparece enquanto houver categoria da competição em que o jogador não tem inscrição ativa**, venha ele de onde vier (N33). Um jogador pode jogar mais de uma categoria (R2), então estar inscrito numa não esconde o bloco. Quem tem inscrição ativa em todas as categorias não vê o bloco. [NAV N33; R2; DEC-EXP EL9]
- **EX27. "Tenho interesse" aparece nas mesmas condições da EX26, e só enquanto o jogador não tem nenhuma inscrição ativa na competição.** Depois da primeira inscrição, o botão some, e o interesse já marcado fica guardado para a métrica de conversão (EX31). [DEC-EXP EL9, EL12; DEC-EXP-2]

  **Por que o interesse some antes do "Como se inscrever":** o interesse é por competição (EX31), não por categoria. Quem já está inscrito numa categoria já é da competição; o interesse dele não mede procura nova. O "Como se inscrever" continua, porque ele ainda pode entrar em outra categoria.

### 6.1 Como se inscrever

- **EX28. O bloco diz que a inscrição é feita com o organizador e mostra o contato da organização:** a linha "A inscrição é feita com o organizador." e o contato, com o mesmo tratamento da página da organização (EX22): link vira o botão "Falar com o organizador"; texto aparece como foi escrito, sem botão. Sem contato cadastrado, fica só a linha, com o nome da organização, que leva à página dela. [NAV N33; R32; DEC-EXP EL10]

  **Por quê um contato da organização, e não um por competição:** o DOMAIN guarda o contato na organização, num campo só (texto ou link). Um organizador com três rankings não precisa cadastrar o mesmo WhatsApp três vezes. Prazo e valor de inscrição ficam fora: quem informa é o organizador, na conversa.

### 6.2 Tenho interesse

- **EX29. "Tenho interesse" é um botão de alternar, abaixo de "Como se inscrever".** Tocar registra o interesse e o rótulo vira "Interesse registrado", com ícone de check; tocar de novo desfaz, sem confirmação. É um botão secundário, não o primário da página. [NAV N33; DEC-NAV-A L13]
- **EX30. Abaixo do botão, uma linha diz o que ele faz:** "Só você vê. O organizador não é avisado." A linha evita que o jogador ache que se inscreveu ou que o organizador vai procurá-lo. [DEC-NAV-A L13; DEC-EXP EL11]
- **EX31. O interesse é por competição**, não por categoria nem por temporada (DOMAIN, glossário). Ele vale até o jogador desfazer. Quando o jogador passa a ter inscrição ativa na competição (pela carga do time, R32), o botão some (EX27) e o interesse fica guardado para a métrica "Interesse que virou inscrição" (seção 9). [DOMAIN; DEC-EXP EL12]
- **EX32. O interesse não aparece em nenhum outro lugar do app no MVP**: nem no perfil, nem no feed, nem numa lista de "minhas competições de interesse". [DEC-NAV-A L13]
- **EX33. Acessibilidade do botão:** o nome acessível acompanha o rótulo visível ("Tenho interesse" → "Interesse registrado"), pela WCAG 2.5.3 e pela NAV 10.3 (o rótulo visível é o nome acessível). Como o rótulo muda com o estado, o botão **não** usa `aria-pressed`: o APG usa `aria-pressed` só em botão de rótulo fixo, e os dois juntos fariam o leitor de tela dizer "Interesse registrado, pressionado". A mudança é anunciada numa região `aria-live="polite"` ("Interesse registrado" / "Interesse removido"). Se o registro falha, o botão volta ao estado anterior e um Toast diz "Não foi possível registrar. Tente de novo." [WCAG-253; APG-BUTTON; NAV 10.3]

### 6.3 Torneio

- **EX34. A página do torneio não tem spec ainda** (NAV N9). Para o Explorar funcionar com um torneio na vitrine, o mínimo é: cabeçalho (organização e nome), data e local, categorias e os dois blocos desta seção. O resto (confrontos, resultados) é da spec do torneio. [NAV N9; DEC-EXP EL14]

---

## 7. Dados do beta

Segue o `CLAUDE.md` > "Supabase": dados mockados primeiro, tabela só quando a feature precisa do cenário real.

- **EX35. No beta entram só as organizações que promovem competição**, cada uma com o tipo real. Arenas onde só se joga, sem competição própria, não entram: uma página sem competição não serve ao JTBD 1. [DEC-EXP EQ3]
- **EX36. Os dados reais entram pela carga do time no Supabase (R32), nunca no repositório**, que é público. Isso vale para nome, tipo, cidade e contato das organizações, e para as competições. Os mocks do repositório usam organizações, competições e jogadores **fictícios**. [DEC-EXP EQ3; `GIT_WORKFLOW.md` > "Proteção de branch"]
- **EX37. O beta precisa ter cadastrado:**
  - **Organizações:** nome, @username, avatar, tipo, cidade e contato;
  - **Competições** de cada organização, com categorias e temporada: são as mesmas que o ranking já precisa (RK17);
  - **Jogadores:** já existem (tabela `profiles`), com nome, sobrenome, @username e avatar.
- **EX38. O interesse nasce como tabela real antes do beta**, porque é a métrica da aba: um mock não mede nada. A política de RLS deixa cada jogador ler, criar e apagar só o próprio interesse; o time lê o agregado pelo painel do Supabase, sem tela no app. [DOMAIN; `CLAUDE.md` > "Supabase"]
- **EX39. No desenvolvimento, vitrine, busca e página da organização começam com mocks tipados**, no formato do domínio. As tabelas de organização e competição entram quando a issue do ranking com dados reais as criar; o Explorar lê as mesmas.

### 7.1 Segurança

- **RLS protege linhas, não colunas.** A policy de SELECT de `profiles` é `using (true)` para qualquer usuário autenticado: toda coluna que estiver em `profiles` pode ser lida por qualquer jogador logado, pela Data API, sem passar pela busca. Filtrar colunas na consulta da busca não protege nada. Por isso **a data de nascimento e o telefone ficam fora de `profiles`**, em tabelas com policy própria (M23), e a busca de jogadores lê só o que já é público: nome, sobrenome, @username e avatar. Qualquer coluna nova em `profiles` deve ser tratada como pública. [SCHED M23; PROF PF20]
- **Limite de chamadas.** A busca dispara enquanto se digita (EX2), e cada busca calcula três contagens (EX5). A implementação precisa de limite de chamadas por usuário e de esperar uma pausa curta na digitação antes de consultar.
- **Contato é público dentro do app.** O contato da organização é visto por qualquer jogador logado. A carga só grava o contato que a organização quer divulgar.

---

## 8. Componentes

Lista para a auditoria do design system, como na NAVIGATION (seção 11). **Esta spec não desenha os componentes.**

| Componente | Tier | Papel nesta spec | Situação |
| --- | --- | --- | --- |
| **SearchField** | 1 | Campo de busca (EX1, EX3) | Novo, ou variante do FormInput (NAV) |
| **Tabs** | 1 | Escopos da busca com a contagem em cada aba (EX1, EX5) | No `master`, com a contagem opcional por aba. Tabs, e não o SegmentedControl (DEC-EXP-3) |
| **CompetitionListItem** | 3 | Item de competição na vitrine, na busca e na página da organização (EX10) | Novo, ou o `CompetitionBlock` do feed como base. Parte do ListItem |
| **ArenaListItem** | 3 | Item de arena na vitrine e na busca (EX11) | Novo. Parte do ListItem |
| **PlayerListItem** | 2 | Item de jogador na busca (EX17) | Novo, ou o ListItem com Avatar. Pode servir à lista de amigos (PF5) |
| **InterestToggle** | 2 | "Tenho interesse" / "Interesse registrado" (EX29, EX33) | Novo, ou o Button secondary com rótulo que muda. Estados: desligado, ligado, enviando, erro |
| **OrganizationContact** | 3 | Contato da organização na página dela (EX22) e no "Como se inscrever" (EX28) | Novo. Com link, só texto e sem contato |
| **Badge**, **EmptyState**, **Skeleton**, **Toast**, **ListItem**, **Avatar** | 1–2 | "Você participa", "Entre temporadas", vazios, carregando, erro do interesse | No `master` |

---

## 9. Métricas de sucesso

As métricas "Uso do Explorar", "Tenho interesse" e "Busca por escopo" já estão na NAVIGATION (seção 13). Esta spec detalha como lê-las e soma duas.

| Métrica | Definição | Por que importa |
| --- | --- | --- |
| **Uso do Explorar** | % dos jogadores que abrem a aba por mês, separado entre rodada e entre temporadas (NAV) | Decide se a descoberta cresce. Uso concentrado entre temporadas confirma o JTBD 1; uso na rodada indica que a aba é, na prática, a busca de jogadores |
| **Tenho interesse** | Interesses por competição e % dos jogadores que marcaram algum (NAV) | Mede a procura por competições novas |
| **Interesse que virou inscrição** | Dos interesses, % cujo jogador teve inscrição ativa na competição até o fim da temporada seguinte | Diz se o interesse prevê inscrição. Se prevê, é o argumento para avisar o organizador e para a inscrição pelo app |
| **Busca por escopo** | Buscas por escopo e % que terminam numa página aberta (NAV) | Qual escopo tem uso real |
| **Busca no escopo errado** | % das buscas com zero resultado no escopo escolhido e resultado em outro; delas, % em que o jogador trocou de escopo | Mede se a contagem nas abas (EX5) resolve o risco do escopo inicial. Taxa alta sem troca de escopo é o sinal para reabrir o "Tudo" com o Gabriel |

---

## 10. Decisões e leituras

### Respondidas (DEC-EXP, 29/09)

- **EQ1** → EX4, EX5, EX19: a busca começa em Jogadores, com a contagem de resultados em cada escopo. Se a contagem não couber a 393px, a decisão volta ao Gabriel; nenhum escopo "Tudo" sem aprovação dele.
- **EQ2** → EX11, EX14, EX22, EX23: toda organização tem página, em `/organizacoes/[organizacao]`; a arena é um tipo. A N34 e a tabela de toques da NAVIGATION mudam junto.
- **EQ3** → EX35, EX36: no beta, só as organizações que promovem competição, com o tipo real; dados reais pela carga, mocks fictícios.

### Leituras

| Leitura | Regra | Situação |
| --- | --- | --- |
| **EL1.** Escopos só com foco ou texto; busca a partir de 2 caracteres, enquanto digita | EX1, EX2 | Confirmada |
| **EL2.** O escopo volta a Jogadores ao limpar ou sair da aba, e é mantido ao voltar de um resultado | EX4 | Confirmada |
| **EL3.** Rankings e torneios numa lista só, torneios abertos primeiro, torneios passados fora da vitrine | EX7, EX8 | Confirmada |
| **EL4.** As competições do próprio jogador aparecem na vitrine com "Você participa" | EX9 | Confirmada |
| **EL5.** Sem paginação na vitrine até 20 itens por seção | EX12 | Confirmada |
| **EL6.** Correspondência sem acento, pelo início de qualquer palavra, com ou sem @ | EX15 | Confirmada |
| **EL7.** Ordem dos jogadores: @username exato, amigos, competição em comum, demais; o próprio jogador fica fora | EX14, EX16 | Confirmada |
| **EL8.** A linha de apoio do jogador mostra "Amigo" ou a competição em comum | EX17 | Confirmada |
| **EL9.** Os blocos aparecem enquanto houver categoria em que o jogador não está inscrito | EX26, EX27 | Confirmada com ajuste do Gabriel (antes: só para quem não tinha nenhuma inscrição) |
| **EL10.** "Como se inscrever" usa o contato da organização, sem prazo nem valor | EX28 | Confirmada |
| **EL11.** A linha "Só você vê. O organizador não é avisado." abaixo do "Tenho interesse" | EX30 | Confirmada |
| **EL12.** O interesse é por competição, vale até ser desfeito; depois da inscrição, fica guardado e o botão some | EX27, EX31 | Confirmada com ajuste do Gabriel (o botão some) |
| **EL13.** Página da organização sem endereço nem mapa; local do torneio e arena da partida sem link | EX24, EX25 | Confirmada |
| **EL14.** Conteúdo mínimo da página do torneio para o Explorar | EX34 | Confirmada |
| **EL15.** Até 20 resultados por busca, com "Mostrar mais" | EX18 | Confirmada (DEC-EXP-2) |

**Como a EL9 e a EL12 convivem:** o "Como se inscrever" segue a EL9 (aparece enquanto houver categoria livre). O "Tenho interesse" segue as duas: aparece enquanto houver categoria livre **e** o jogador ainda não tiver inscrição na competição, porque o interesse é por competição e, depois da primeira inscrição, o botão some (EL12). A regra está na EX27, confirmada pelo Gabriel (DEC-EXP-2).

---

## 11. Fora do MVP e riscos

### Fora do MVP

| O que | Por que fica fora | Quando reabrir |
| --- | --- | --- |
| Filtros por nível e região | DEC-NAV-Q; evidência fraca (DSC 1.2) e pouco volume | "Uso do Explorar" alto entre temporadas, com mais organizadores |
| Recomendação ("para você") | Pede categoria e região no perfil e o mapeamento de nomes de categoria (DSC 1.3) | Depois dos filtros |
| Mapa | Custo alto; com poucas arenas, o mapa fica vazio (REF, caminho C) | Com dezenas de arenas |
| Escopo "Tudo" na busca | DEC-EXP EQ1: a contagem nas abas vem primeiro | "Busca no escopo errado" alta, ou a contagem não cabe a 393px |
| Inscrição pelo app | `PRODUCT.md`; a inscrição é feita com o organizador (R32) | "Interesse que virou inscrição" alto |
| Avisar o organizador do interesse | O interesse é privado no MVP (DEC-NAV-A L13) | Idem |
| Buscas recentes e sugestões | A HIG sugere, mas o volume do beta não pede | Se "Busca por escopo" mostrar buscas repetidas |
| Correção de erro de digitação | Custo de busca aproximada sem volume que justifique | Se houver muita busca sem resultado em todos os escopos |
| Local do torneio e arena da partida ligados à organização | Pediria escolher a organização numa lista no cadastro e na marcação (EX25) | Quando torneios de fora forem comuns nas arenas do app |
| Endereço, quadras e reserva na página da organização | Aulas e reserva de quadras fora do MVP (`PRODUCT.md`) | Com o modo organizador |

### Riscos para acompanhar no beta

- **Vitrine rasa.** Com dois organizadores, a vitrine tem poucas competições e talvez uma organização do tipo arena. A aba pode parecer vazia (NAV seção 14). A métrica de uso e a conversa com os jogadores dizem se ela espera mais organizadores.
- **Vitrine longa.** Se uma seção passar de 20 itens, a lista sem paginação (EX12) fica pesada: rever com paginação ou filtros.
- **Escopo errado parece "não existe".** O risco da EQ1. A métrica "Busca no escopo errado" mede se a contagem resolve.
- **"Tenho interesse" lido como inscrição.** Mesmo com a linha da EX30, o jogador pode achar que se inscreveu. Ouvir no beta; se acontecer, o texto do botão muda antes do comportamento.
- **Contato desatualizado.** O contato é cadastrado pelo time (R32) e pode mudar sem aviso. Um link que não funciona é pior que nenhum: conferir com os organizadores a cada temporada.
- **Arena sem os torneios que recebe.** Um torneio de outra organização jogado numa arena não aparece na página dela (seção 1, "Termos"). O jogador pode estranhar. Ouvir no beta.
- **Busca de jogadores como diretório.** Qualquer jogador logado acha qualquer outro pelo nome (PF20). No beta fechado é aceitável; com o app aberto, rever com denunciar e bloquear (PROFILE seção 9).
