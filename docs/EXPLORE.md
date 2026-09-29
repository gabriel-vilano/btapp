# EXPLORE.md — LetzPlay

Spec da aba Explorar: a vitrine de competições e arenas, a busca do app, a página da arena e os blocos "Como se inscrever" e "Tenho interesse" da página da competição.

> Este doc detalha **o conteúdo** do que a `docs/NAVIGATION.md` já decidiu que existe (seção 7, N32 a N34): a aba, os três escopos da busca, a vitrine enxuta, a página da arena. Onde as coisas moram e como se chega a elas continua sendo da NAVIGATION. A página da competição é da `docs/RANKING.md` (RK17); daqui saem só os dois blocos de quem não está inscrito. As regras daqui são numeradas **EX1, EX2…** para não colidir com as R do domínio, as N da navegação e as RK do ranking. Rotas são propostas.

---

## Fontes

As siglas são as mesmas do `docs/DOMAIN.md` > "Fontes" e da `docs/NAVIGATION.md` > "Fontes". As que esta spec usa, mais as próprias:

| Sigla | Conteúdo usado aqui |
| --- | --- |
| **DEC-NAV-Q** | Q1 (Explorar enxuto no MVP) e Q5 (uma busca só, no Explorar, com três escopos) |
| **DEC-NAV-A** | L12 (o que cada escopo busca e aonde leva), L13 ("Tenho interesse" privado, para medir demanda), L14 (arena = organização do tipo arena, com tipo, cidade e contato) |
| **NAV** | `docs/NAVIGATION.md`: N6, N10, N28, N32 a N34, estados (seção 9) e métricas (seção 13) |
| **RANK** | `docs/RANKING.md`: página da competição (RK17) e StandingSummaryItem |
| **PROF** | `docs/PROFILE.md`: perfil visível para qualquer jogador com conta (PF20); o telefone nunca aparece (M23) |
| **FEED** | `docs/FEED_CARDS.md` §11.2: a descoberta de organizações fica numa tela de competições, não no feed. O comentário da issue desta spec pedia para avaliar se a busca absorve essa tela: **absorve**, com os filtros por nível e região fora do MVP (DEC-NAV-Q) |
| **REF** | `docs/discovery/referencias/06-descoberta-competicoes.md`: página do evento, "rankings × torneios", "entrada manual como saída do vazio" |
| **DSC** | `docs/DISCOVERY.md`: oportunidade 1.2 (descoberta por nível e região) com evidência **fraca** |
| **NNG-SCOPE** | Katie Sherwin, ["Scoped Search: Dangerous, but Sometimes Useful"](https://www.nngroup.com/articles/scoped-search/), Nielsen Norman Group, 2015 (lido em 29/09/2026): "Sites that select a scope by default are the worst offenders"; "Always set the default scope to 'all'"; "Users are more likely to change the search scope in retrospect than during their first search attempt"; o resultado deve dizer o escopo e oferecer ampliar num toque |
| **HIG-SEARCH** | Apple Human Interface Guidelines, ["Search fields"](https://developer.apple.com/design/human-interface-guidelines/search-fields) (lido em 29/09/2026): "If possible, start search immediately when a person types"; "Use placeholder text to help people know what they can search for… when you need to reinforce the scope"; "Default to a broader scope and let people refine it as they need"; "you can display recent searches before search begins" |
| **MOB** | Telas de busca no Mobbin (29/09/2026), 10 apps. Com uma visão "todos" agrupada antes dos escopos: 5 ([Givingli](https://mobbin.com/screens/af2aa6db-4042-441f-993b-8d7e12da1708), [Posh](https://mobbin.com/screens/fe24a89a-b184-4763-bc6c-4e1ff3146b76), [Substack](https://mobbin.com/screens/231a27f2-0cf7-4041-a275-f96bbdba0f28), [Hulu](https://mobbin.com/screens/6ee2fbb3-d7cf-4e42-99ee-8998c1ebc01d), [Hypelist](https://mobbin.com/screens/7ace65a4-e8e0-4799-a49b-f2081931bce4)). Só com escopos: 4 ([Strava](https://mobbin.com/screens/d9be8a1e-6e79-4bac-8741-e2bf33b81395), [Polarsteps](https://mobbin.com/screens/7fd17bf2-7230-4415-9eca-a2d0d1e01bf7), [Vestiaire](https://mobbin.com/screens/1a20b6c0-36fe-4a9f-a8c9-483703cb88ff), [pliability](https://mobbin.com/screens/83a41f1f-dc86-47ad-8055-ecd0df594f1a)). O Hulu mostra a contagem em cada escopo ("Movies (11)", "Episodes (12)"). Amostra pequena: serve de exemplo, não de estatística |
| **LEIT** | Leitura do agente desta spec, a confirmar pelo Gabriel. A lista está na seção 10 |

---

## 1. Princípio

**Vitrine curta, busca que responde.** O Explorar é uma aposta medida: a evidência da descoberta por nível e região é fraca (DSC 1.2), e o beta tem dois organizadores. Por isso a aba não finge volume: mostra o que existe, deixa claro como entrar em cada competição (com o organizador, R32) e mede a procura com o "Tenho interesse". Filtro, recomendação e mapa só entram se as métricas da seção 9 mostrarem uso.

A busca tem outro papel: é a porta mais curta para um perfil (JTBD 3, avaliar o adversário) e para a competição que alguém citou no WhatsApp. Ela precisa achar o que o jogador digita do jeito que ele digita: sem acento, pelo sobrenome, com ou sem @.

---

## 2. A tela

- **EX1. O Explorar tem, de cima para baixo: o título "Explorar", o campo de busca e a vitrine** (seção 3). O controle de escopos (Jogadores · Competições · Arenas) aparece **só quando o campo tem foco ou texto**, logo abaixo dele, e a vitrine dá lugar aos resultados. [NAV N32, N33; HIG-SEARCH]

  **Por quê:** a HIG põe a barra de escopo "na área de resultados". Mostrar os escopos sem busca poria três segmentos acima de uma vitrine que não depende deles.
- **EX2. A busca começa enquanto o jogador digita, a partir de 2 caracteres.** Com 1 caractere, a área de resultados diz "Digite ao menos 2 letras." Sem termo e com foco, ela fica vazia, com o controle de escopos visível. [HIG-SEARCH; LEIT]
- **EX3. O placeholder diz o que o escopo busca:** "Nome ou @username" (Jogadores), "Competição ou organizador" (Competições), "Arena ou cidade" (Arenas). O rótulo acessível do campo é "Buscar". [HIG-SEARCH]
- **EX4. O escopo começa em Jogadores** (N32) e volta para ele quando o campo é limpo ou o jogador sai da aba. Ao voltar de um resultado com "Voltar", o termo, o escopo e a rolagem continuam como estavam. [NAV N10, N32; NNG-SCOPE; LEIT]

  **Por quê voltar ao padrão:** a NN/g observa que quem troca de escopo esquece que trocou e faz a busca seguinte no escopo errado. Guardar o escopo só enquanto há termo evita isso sem apagar o trabalho de quem abriu um resultado e voltou.

> **Pergunta aberta EQ1** (seção 10): a NN/g e a HIG recomendam começar pelo escopo mais amplo, e a N32 começa em Jogadores. A proposta é mostrar a contagem de cada escopo nos segmentos. A EX4 e a EX16 mudam se o Gabriel escolher outra opção.

---

## 3. Vitrine

A vitrine é o Explorar sem termo digitado. Responde "o que existe para eu jogar?" com o que os organizadores do beta cadastraram.

- **EX5. Duas seções, nesta ordem: "Competições" e "Arenas".** Cada uma é um `<section>` com título (`h2`) e lista. [NAV N33]
- **EX6. Rankings e torneios ficam numa lista só, com o tipo escrito no item** ("Ranking", "Torneio"). Com poucas competições no beta, duas listas separadas deixariam uma delas quase vazia. [REF "Rankings × torneios", opção 1; LEIT]
- **EX7. Ordem da lista de competições:**
  1. **Torneios com data futura**, do mais próximo ao mais distante: têm prazo, e o prazo é o que o jogador decide.
  2. **Rankings com temporada em andamento**, por nome.
  3. **Rankings entre temporadas**, por nome, com "Entre temporadas".

  **Torneios que já aconteceram não entram na vitrine**: não há o que fazer com eles. Aparecem na busca (EX13). [NAV N33; LEIT]
- **EX8. As competições em que o jogador já está inscrito aparecem na vitrine**, no mesmo lugar da ordem, com o Badge "Você participa". Tirar da vitrine faria o jogador de um ranking do Vila achar que o Vila não está no app. [LEIT]
- **EX9. O item de competição** (CompetitionListItem, seção 8):
  - avatar da organização e nome da competição;
  - linha de apoio: tipo · organização · cidade ("Ranking · Vila do Tênis · Belo Horizonte");
  - situação: no ranking, "Temporada 2026/2 · rodada 3" ou "Entre temporadas"; no torneio, a data e a arena ("Sáb, 12/10 · Arena Sunset") ou "Encerrado";
  - Badge "Você participa" quando há inscrição ativa (EX8).

  Toque → a página da competição (`/competicoes/[competicao]`, NAV N9). [RANK RK17; NAV N33]
- **EX10. A seção "Arenas" lista as organizações do tipo arena, por nome.** O item (ArenaListItem): avatar, nome, cidade e "2 competições abertas" (ou "Nenhuma competição aberta"). Toque → a página da arena (seção 5). [NAV N34]
- **EX11. Sem paginação na vitrine no MVP.** O beta tem poucas competições; a lista mostra todas. Rever quando uma seção passar de 20 itens (seção 12). [LEIT]
- **EX12. Vazios:** sem competição aberta, a seção "Competições" diz "Nenhuma competição aberta agora." e mostra só os rankings entre temporadas, se houver; sem arena, a seção "Arenas" some. Com as duas vazias (só em ambiente de desenvolvimento, porque os organizadores do beta já estão cadastrados), o EmptyState diz "Ainda não há competições no LetzPlay." [NAV N22, 9.2]

---

## 4. Busca

Os escopos, o que cada um busca e aonde leva são da N32. Esta seção define a correspondência, a ordem, o item e os estados.

- **EX13. O que cada escopo busca:**

| Escopo | Busca em | Entra no resultado | Toque leva a |
| --- | --- | --- | --- |
| **Jogadores** | Nome, sobrenome e @username | Todo jogador com conta, menos o próprio (o próprio perfil está na aba Perfil) | `/jogadores/[username]` |
| **Competições** | Nome da competição e nome da organização | Rankings e torneios, inclusive encerrados | `/competicoes/[competicao]` |
| **Arenas** | Nome e cidade | Organizações do tipo arena | `/arenas/[arena]` |

  O telefone, o e-mail e a data de nascimento nunca são buscáveis (PROF, M23). [NAV N32; PROF PF20]
- **EX14. A correspondência ignora maiúsculas e acentos e vale pelo início de qualquer palavra.** "joao" acha "João Silva"; "sil" acha "Ana Silva"; "@lu" e "lu" acham "@lucas.m". Não há correção de erro de digitação no MVP. [LEIT]

  **Por quê:** o jogador digita no celular, na quadra, e nomes brasileiros têm acento. Achar pelo sobrenome importa porque o adversário é conhecido pelo sobrenome no chaveamento.
- **EX15. Ordem dos resultados:**
  - **Jogadores:** @username igual ao termo; depois amigos; depois quem tem inscrição ativa numa competição em comum com o jogador (o adversário provável, JTBD 3); depois os demais. Empate: ordem alfabética do nome.
  - **Competições:** a mesma ordem da vitrine (EX7), com os torneios encerrados no fim, do mais recente ao mais antigo.
  - **Arenas:** nome que começa pelo termo antes de cidade que começa pelo termo; empate em ordem alfabética.

  [LEIT]
- **EX16. O item de jogador** (ListItem): avatar, nome completo e @username; na linha de apoio, "Amigo", ou a competição em comum ("Rankin · Masculino B"), ou nada. O item de competição e o de arena são os da vitrine (EX9, EX10). [PROF PF4; LEIT]

  **Por quê a competição em comum:** dois "Lucas" no mesmo beta são prováveis. A competição separa o adversário do homônimo sem abrir o perfil.
- **EX17. Até 20 resultados, com "Mostrar mais"** no fim da lista. A contagem total é anunciada ("12 jogadores encontrados") numa região `aria-live="polite"` (NAV 10.3; WCAG 4.1.3). [LEIT]
- **EX18. Sem resultado:** "Nada encontrado para '[termo]' em [escopo]." e, abaixo, um link para cada escopo que tem resultado para o mesmo termo, com a contagem ("Ver 2 em Competições"). Se nenhum escopo tem, só a frase. [NAV 9.2; NNG-SCOPE]
- **EX19. Carregando e erro:** 3 linhas de Skeleton no formato do item do escopo; se a busca falha, "Não foi possível buscar. Tentar de novo" no lugar dos resultados, e o campo continua editável. Resultado que chega fora de ordem (o de um termo anterior) é descartado. [NAV N23, N24]
- **EX20. A busca exige login**, como o perfil (PF20). Sem login, `/explorar` leva ao login e volta ao Explorar depois dele (NAV N28). [PROF PF20]

---

## 5. Página da arena

- **EX21. A página da arena tem três blocos, nesta ordem: cabeçalho, contato e competições.** [NAV N34]

| Bloco | Conteúdo |
| --- | --- |
| **Cabeçalho** | Avatar, nome, "Arena" e a cidade |
| **Contato** | O contato que a arena informou (texto e um link, como WhatsApp, Instagram ou site), com o botão "Falar com a arena", que abre o link fora do app. Sem contato cadastrado, o bloco some |
| **Competições** | As competições da arena, com o item da vitrine (EX9) e a mesma ordem (EX7). As encerradas ficam atrás de "Ver encerradas (N)". Sem competição aberta: "Nenhuma competição aberta agora." |

- **EX22. A página não tem endereço, mapa, quadras, horários nem reserva.** A organização guarda só tipo, cidade e contato (DOMAIN), e aulas e reserva de quadras estão fora do MVP (`PRODUCT.md`). [NAV N34; LEIT]
- **EX23. A arena escrita na partida continua sendo texto livre** (R34) e não vira link para esta página. Ligar as duas pediria escolher a arena numa lista na marcação, o que a SCHEDULING não prevê. [NAV N34, R34]

> **Pergunta aberta EQ2** (seção 10): o cabeçalho da página da competição e dos cards do feed mostra a organização. Quando ela não é arena (clube, federação, grupo), tocar nela leva aonde?

---

## 6. Página da competição, para quem não está inscrito

A página é da `RANKING.md` (RK17). A NAVIGATION (N33) decidiu que, para quem não está inscrito, dois blocos entram logo abaixo do cabeçalho. Esta seção define os dois.

- **EX24. Os dois blocos aparecem para quem não tem inscrição ativa em nenhuma categoria da competição**, venha de onde vier (N33). Quem tem inscrição ativa em uma categoria não vê os blocos, mesmo que a competição tenha outras categorias. [NAV N33; LEIT]

### 6.1 Como se inscrever

- **EX25. O bloco "Como se inscrever" diz que a inscrição é feita com o organizador e mostra o contato da organização:** a linha "A inscrição é feita com o organizador.", o texto de contato que ele informou e o botão "Falar com o organizador", que abre o link fora do app. Sem contato cadastrado, fica só a linha, com o nome da organização. [NAV N33; R32]

  **Por quê um contato da organização, e não um por competição:** o DOMAIN guarda o contato na organização. Um organizador com três rankings não precisa cadastrar o mesmo WhatsApp três vezes. Prazo e valor de inscrição ficam fora: quem informa é o organizador, na conversa.

### 6.2 Tenho interesse

- **EX26. "Tenho interesse" é um botão de alternar, abaixo de "Como se inscrever".** Tocar registra o interesse e o botão vira "Interesse registrado", com ícone de check; tocar de novo desfaz, sem confirmação. É um botão secundário, não o primário da página. [NAV N33; DEC-NAV-A L13]
- **EX27. Abaixo do botão, uma linha diz o que ele faz:** "Só você vê. O organizador não é avisado." A linha evita que o jogador ache que se inscreveu ou que o organizador vai procurá-lo. [DEC-NAV-A L13; LEIT]
- **EX28. O interesse é por competição**, não por categoria nem por temporada (DOMAIN, glossário). Ele vale até o jogador desfazer. Quando o jogador passa a ter inscrição ativa na competição (pela carga do organizador, R32), os blocos somem (EX24) e o interesse fica guardado para a métrica "interesse que virou inscrição" (seção 9). [DOMAIN; LEIT]
- **EX29. O interesse não aparece em nenhum outro lugar do app no MVP**: nem no perfil, nem no feed, nem numa lista de "minhas competições de interesse". [DEC-NAV-A L13]
- **Acessibilidade:** o botão tem `aria-pressed` (falso em "Tenho interesse", verdadeiro em "Interesse registrado"); o nome acessível é o mesmo nos dois estados ("Tenho interesse") e o estado vem do `aria-pressed`, como pede o padrão Button do WAI-ARIA APG. Se o registro falha, o botão volta ao estado anterior e um Toast diz "Não foi possível registrar. Tente de novo."

### 6.3 Torneio

- **EX30. A página do torneio não tem spec ainda** (NAV N9). Para o Explorar funcionar com um torneio na vitrine, o mínimo é: cabeçalho (organização e nome), data e arena, categorias e os dois blocos desta seção. O resto (confrontos, resultados) é da spec do torneio. [NAV N9; LEIT]

---

## 7. Dados do beta

Segue o `CLAUDE.md` > "Supabase": dados mockados primeiro, tabela só quando a feature precisa do cenário real.

- **EX31. O beta precisa ter cadastrado, pela carga do time (R32):**
  - **Organizações** do Rankin e do Vila do Tênis: nome, @username, avatar, **tipo**, **cidade** e **contato**. O tipo de cada uma é pergunta ao Gabriel (EQ3);
  - **Competições** de cada organização, com categorias e temporada: são as mesmas que o ranking já precisa (RK17);
  - **Jogadores:** já existem (tabela `profiles`), com nome, sobrenome, @username e avatar.
- **EX32. O interesse nasce como tabela real antes do beta**, porque é a métrica da aba: um mock não mede nada. A política de RLS deixa cada jogador ler, criar e apagar só o próprio interesse; o time lê o agregado pelo painel do Supabase, sem tela no app. [DOMAIN; `CLAUDE.md` > "Supabase"]
- **EX33. No desenvolvimento, vitrine, busca e página da arena começam com mocks tipados** (organizações, competições e jogadores), no formato do domínio. As tabelas de organização e competição entram quando a issue do ranking com dados reais as criar; o Explorar lê as mesmas.
- **Proteções a considerar na implementação:** a busca de jogadores devolve só nome, @username, avatar e a linha de apoio (EX16), nunca e-mail ou telefone; a consulta roda com a sessão do jogador, sob RLS; e o número de chamadas por segundo precisa de limite, porque a busca dispara enquanto se digita (EX2) e o repo é público.

---

## 8. Componentes

Lista para a auditoria do design system, como na NAVIGATION (seção 11). **Esta spec não desenha os componentes.**

| Componente | Tier | Papel nesta spec | Situação |
| --- | --- | --- | --- |
| **SearchField** | 1 | Campo de busca (EX1, EX3) | Novo, ou variante do FormInput (NAV) |
| **SegmentedControl** | 1 | Escopos da busca (EX1); com contagem se a EQ1 for aprovada | No `master` |
| **CompetitionListItem** | 3 | Item de competição na vitrine, na busca e na página da arena (EX9) | Novo, ou o `CompetitionBlock` do feed como base. Parte do ListItem |
| **ArenaListItem** | 3 | Item de arena na vitrine e na busca (EX10) | Novo. Parte do ListItem |
| **PlayerListItem** | 2 | Item de jogador na busca (EX16) | Novo, ou o ListItem com Avatar. Pode servir à lista de amigos (PF5) |
| **InterestToggle** | 2 | "Tenho interesse" / "Interesse registrado" (EX26, EX27) | Novo, ou o Button secondary com `aria-pressed`. Estados: desligado, ligado, enviando, erro |
| **EnrollHowToBlock** | 3 | Bloco "Como se inscrever" (EX25) e o contato da arena (EX21) | Novo. Com e sem contato |
| **Badge**, **EmptyState**, **Skeleton**, **Toast**, **ListItem**, **Avatar** | 1–2 | "Você participa", vazios, carregando, erro do interesse | No `master` |

---

## 9. Métricas de sucesso

As métricas "Uso do Explorar", "Tenho interesse" e "Busca por escopo" já estão na NAVIGATION (seção 13). Esta spec detalha como lê-las e soma duas.

| Métrica | Definição | Por que importa |
| --- | --- | --- |
| **Uso do Explorar** | % dos jogadores que abrem a aba por mês, separado entre rodada e entre temporadas (NAV) | Decide se a descoberta cresce. Uso concentrado entre temporadas confirma o JTBD 1; uso na rodada indica que a aba é, na prática, a busca de jogadores |
| **Tenho interesse** | Interesses por competição e % dos jogadores que marcaram algum (NAV) | Mede a procura por competições novas |
| **Interesse que virou inscrição** | Dos interesses, % cujo jogador teve inscrição ativa na competição até o fim da temporada seguinte | Diz se o interesse prevê inscrição. Se prevê, é o argumento para avisar o organizador e para a inscrição pelo app |
| **Busca por escopo** | Buscas por escopo e % que terminam numa página aberta (NAV) | Qual escopo tem uso real |
| **Busca sem resultado** | % das buscas com zero resultado no escopo escolhido e, delas, % que tinham resultado em outro escopo | Mede o custo do escopo padrão (EQ1). Taxa alta com resultado em outro escopo é o erro que a NN/g descreve |

---

## 10. Decisões e leituras

### Perguntas abertas

**EQ1. O escopo inicial da busca.**

**Contexto:** a N32 começa em Jogadores. A NN/g diz que o escopo escolhido por padrão é o pior caso de busca com escopo, porque o usuário não percebe que a busca está limitada e conclui que o conteúdo não existe; a recomendação é começar por "todos". A HIG diz o mesmo ("default to a broader scope"). Na amostra do Mobbin, 5 de 10 apps têm uma visão "todos" antes dos escopos. O risco concreto aqui: quem digita "Vila" em Jogadores não acha o Vila do Tênis e pode concluir que a arena não está no app.

**Opções:**
1. **Três escopos, começando em Jogadores, com a contagem em cada segmento** ("Jogadores (3) · Competições (1) · Arenas (0)"), como no Hulu, mais o link da EX18. Custo baixo e mantém a N32; o segmento com número mostra onde está o que o jogador procurou. Risco: três contagens a 393px ficam apertadas ao lado de "Competições" (NAV N25).
2. **Quatro escopos, começando em "Tudo"**, com até 3 resultados de cada tipo e "Ver todos" para o escopo. É o que a NN/g e a HIG recomendam. Custo: um segmento e uma tela a mais, e muda a N32.
3. **Manter a N32 como está**, só com a EX18 no resultado vazio. Mais simples; o erro fica sem sinal enquanto há resultado no escopo errado (um jogador chamado "Vila" esconde a arena).

**Recomendação:** opção 1. Cobre o risco principal com uma mudança pequena, e a métrica "Busca sem resultado" (seção 9) diz no beta se é preciso ir para a opção 2. Se a contagem não couber a 393px, a opção 2 vira a recomendação.

**EQ2. Aonde leva a organização que não é arena.**

**Contexto:** a N34 dá página só à organização do tipo arena. O cabeçalho da página da competição (RK17) e dos cards do feed mostra a organização, e o Rankin pode não ser arena (EQ3). Hoje não há regra para o toque nesse nome.

**Opções:**
1. **Uma página para toda organização**, com o mesmo conteúdo da seção 5 e o tipo escrito no cabeçalho ("Arena", "Clube", "Grupo"); o escopo "Arenas" continua listando só as do tipo arena. Uma entidade, uma rota (N10); a rota proposta vira `/organizacoes/[organizacao]` em vez de `/arenas/[arena]`, o que muda a N34.
2. **Só a arena tem página**; o nome das outras organizações não é tocável. Não muda a N34, mas o mesmo lugar do cabeçalho reage ou não conforme o tipo, e o jogador não tem onde ver as outras competições do Rankin.
3. **Trocar o escopo "Arenas" por "Organizações"**, com página para todas. Mais completo; o jogador procura "arena", não "organização", e a N32 muda.

**Recomendação:** opção 1. Mantém a regra de uma rota por entidade e o escopo com a palavra que o jogador usa.

**EQ3. Quais organizações e arenas o beta cadastra, e de que tipo.**

**Contexto:** o Vila do Tênis é arena. O Rankin não está claro: pode ser um grupo que joga em várias arenas. Se só o Vila for arena, a seção "Arenas" terá um item, e a página da arena terá as competições de um organizador só.

**Opções:**
1. **Só as organizações que promovem competição no beta**, cada uma com o tipo real. A seção "Arenas" pode ter 1 ou 2 itens; a métrica de uso diz se isso afasta.
2. **Também as arenas onde os jogos do beta acontecem**, sem competição, como diretório. Enche a seção, mas cria páginas sem competição, que não servem ao JTBD 1, e dados que o time precisa manter.

**Recomendação:** opção 1, com o Gabriel dizendo o tipo do Rankin e a cidade e o contato de cada organização.

### Leituras do agente (a confirmar)

- **L1.** Escopos aparecem só com foco ou texto (EX1); busca a partir de 2 caracteres, enquanto digita (EX2).
- **L2.** O escopo volta a Jogadores ao limpar ou sair da aba, e é mantido ao voltar de um resultado (EX4).
- **L3.** Rankings e torneios numa lista só, torneios futuros primeiro, torneios passados fora da vitrine (EX6, EX7).
- **L4.** As competições do próprio jogador aparecem na vitrine com "Você participa" (EX8).
- **L5.** Sem paginação na vitrine até 20 itens por seção (EX11).
- **L6.** Correspondência sem acento, pelo início de qualquer palavra, com ou sem @ (EX14).
- **L7.** Ordem dos jogadores: @username exato, amigos, competição em comum, demais; o próprio jogador fica fora (EX13, EX15).
- **L8.** A linha de apoio do jogador mostra "Amigo" ou a competição em comum (EX16).
- **L9.** Quem tem inscrição ativa em uma categoria não vê os blocos de inscrição (EX24).
- **L10.** "Como se inscrever" usa o contato da organização, sem prazo nem valor (EX25).
- **L11.** A linha "Só você vê. O organizador não é avisado." abaixo do "Tenho interesse" (EX27).
- **L12.** O interesse é por competição, vale até ser desfeito e fica guardado depois da inscrição (EX28).
- **L13.** Página da arena sem endereço nem mapa, e a arena da partida sem link para ela (EX22, EX23).
- **L14.** Conteúdo mínimo da página do torneio para o Explorar (EX30).

---

## 11. Fora do MVP

| O que | Por que fica fora | Quando reabrir |
| --- | --- | --- |
| Filtros por nível e região | DEC-NAV-Q; evidência fraca (DSC 1.2) e pouco volume | "Uso do Explorar" alto entre temporadas, com mais organizadores |
| Recomendação ("para você") | Pede categoria e região no perfil e o mapeamento de nomes de categoria (DSC 1.3) | Depois dos filtros |
| Mapa | Custo alto; com poucas arenas, o mapa fica vazio (REF, caminho C) | Com dezenas de arenas |
| Inscrição pelo app | `PRODUCT.md`; a inscrição é feita com o organizador (R32) | "Interesse que virou inscrição" alto |
| Avisar o organizador do interesse | O interesse é privado no MVP (DEC-NAV-A L13) | Idem |
| Buscas recentes e sugestões | A HIG sugere, mas o volume do beta não pede | Se "Busca por escopo" mostrar buscas repetidas |
| Correção de erro de digitação | Custo de busca aproximada sem volume que justifique | Se "Busca sem resultado" for alta dentro do escopo certo |
| Endereço, quadras e reserva na página da arena | Aulas e reserva de quadras fora do MVP (`PRODUCT.md`) | Com o modo organizador |

---

## 12. Riscos para acompanhar no beta

- **Vitrine rasa.** Com dois organizadores, a vitrine tem poucas competições e talvez uma arena (EQ3). A aba pode parecer vazia (NAV seção 14). A métrica de uso e a conversa com os jogadores dizem se ela espera mais organizadores.
- **Escopo errado parece "não existe".** O risco da EQ1. A métrica "Busca sem resultado" mede.
- **"Tenho interesse" lido como inscrição.** Mesmo com a linha da EX27, o jogador pode achar que se inscreveu. Ouvir no beta; se acontecer, o texto do botão muda antes do comportamento.
- **Contato desatualizado.** O contato é cadastrado pelo time (R32) e pode mudar sem aviso. Um link que não funciona é pior que nenhum: conferir com os organizadores a cada temporada.
- **Busca de jogadores como diretório.** Qualquer jogador logado acha qualquer outro pelo nome (PF20). No beta fechado é aceitável; com o app aberto, rever com denunciar e bloquear (PROFILE seção 9).
