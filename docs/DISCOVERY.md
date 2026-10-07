# DISCOVERY.md

Mapa de oportunidades de produto e negócio para o jogador competitivo de Beach Tennis. Retoma a Fase 0 (discovery) do roadmap antigo.

> Este doc registra **evidências e oportunidades ranqueadas por força de evidência**. Ele **não prioriza nem decide**: a priorização é do Gabriel e mora no Linear. Levantamento feito em setembro de 2026. Números de mercado e preços envelhecem, então confira a data da fonte antes de usar.

Para visão, escopo do MVP, princípios, JTBDs e contexto do esporte, ver `docs/PRODUCT.md`. Os problemas do concorrente principal estão no `docs/PRODUCT.md` (seção "Problemas do concorrente principal que o produto quer resolver (hipóteses)"), e o audit completo é o documento "Auditoria do app atual" no projeto Discovery e estratégia do Linear. A pesquisa de domínio detalhada (rankings, Finals, placar, W.O., categorias, confrontos, H2H) está no comentário de entrega da issue de pesquisa de domínio no Linear. Aqui entra só o que é necessário para o mapa.

---

## Como ler este doc

**Força da evidência** (usada em todas as tabelas):

| Nível | Critério |
| --- | --- |
| **Forte** | Várias fontes independentes concordam, e pelo menos uma foi lida na íntegra (regulamento em PDF) ou é dado público do próprio concorrente principal |
| **Média** | Uma fonte específica e verificável, ou várias fontes concordantes vistas só pelo resumo de busca |
| **Fraca** | Benchmark genérico fora do BT, opinião, ou inferência sem fonte direta |

**Limitação do método:** o levantamento foi feito numa sessão com proxy de rede. A maioria dos sites (o do concorrente principal, lojas de apps, sites de reclamação pública, ITF, CBBT) só pôde ser vista pelo resumo do mecanismo de busca. Os únicos documentos lidos na íntegra foram os regulamentos hospedados pela Tênis Integrado (CBT 2022, 2023, 2026 e versão antiga; FMT 2025; FCT 2025; FCTBT 2023/24; Interpoints RJ 2024). Por isso quase nada aqui chega a "Forte" só por pesquisa externa. A lacuna maior é a **voz do jogador**: não há entrevistas, e as respostas do Tally não foram encontradas.

---

## 1. O que existe da Fase 0

| Artefato do roadmap antigo | Onde está | Situação |
| --- | --- | --- |
| Audit heurístico do app atual | Linear, documento "Auditoria do app atual" (projeto Discovery e estratégia) | O original (Figma, presumido) não foi localizado; o audit foi reconstruído no Linear. O resumo dos problemas está no `docs/PRODUCT.md` (seção "Problemas do concorrente principal que o produto quer resolver (hipóteses)") |
| Análise competitiva | Notion, página "Autenticação" do projeto | Encontrada. Cobre **só onboarding** (TikTok, Instagram, Lemon8, Meetup), não o mercado de BT |
| Personas e JTBD | `docs/PRODUCT.md` | 5 hipóteses, sem validação registrada |
| Pesquisa Tally (12 perguntas) | — | Não localizada no Notion nem no Dropbox |
| Journey map e síntese de oportunidades | — | Não localizado. **Este doc cumpre a parte "síntese de oportunidades"** |

---

## 2. Mercado

### 2.1 Tamanho e perfil

| Achado | Força | Fonte |
| --- | --- | --- |
| ~1,1 milhão de praticantes em 2023 (ante ~400 mil em 2021), estimativa da CBT replicada pela imprensa. O Brasil teria ~60% dos jogadores do mundo | Média (fonte única, sem metodologia pública) | Máquina do Esporte, Terra, IESB |
| Mercado de ~US$ 140 mi; patrocínio de eventos acima de R$ 10 mi em 2023 | Fraca (fonte primária não identificada) | ND Mais, Máquina do Esporte |
| Sul e Sudeste concentram ~70% das quadras. Arenas indoor levam o esporte para longe do litoral e reduzem a sazonalidade de verão | Média | Jornal do Comércio (10/2023), agregados |
| O perfil demográfico se contradiz: 54% homens no dado nacional × maioria feminina de 25–39 anos, alta renda e ensino superior nos estudos locais (Criciúma, SP) | Fraca | Terra (CBT), RSD Journal |
| Há duas entidades nacionais com ranking próprio: **CBT** (tênis, com BT dentro) e **CBBT** (Confederação Brasileira de Beach Tennis) | Forte | Regulamentos CBT (lidos), cbbtennis.com.br |

### 2.2 Quem compete pelo mesmo jogador

O jogador competitivo usa, ao mesmo tempo, quatro tipos de ferramenta. Nenhum concorrente cobre as quatro bem.

| Categoria | Exemplos | O que resolve bem | O que resolve mal | Força |
| --- | --- | --- | --- | --- |
| **Plataforma de ranking e torneio (B2B2C)** | **O concorrente principal** (também hospeda CBBT, Circuito BT, Brasil Open, centenas de arenas); Tênis Integrado (federações); Meu Ranking / Ranking Beach Tennis; Torneio Já; Ranketes | Motor de regras flexível: desafio, sorteio, todos contra todos, escada, torneio com chave e pontuação configurável pelo organizador. Inscrição e pagamento | App do jogador mal avaliado nas duas lojas (notas e números: evidência: documento D2 ("Evidência: concorrentes (preços, números, ids de loja)"), projeto Discovery e estratégia no Linear). Queixas de logout frequente, lentidão, notificações quebradas (o jogador perde torneios) e resultados pendentes há meses por falta de ação do organizador. Perfis duplicados usados para sandbagging (reclamação pública; evidência: documento D1 ("Evidência: voz do usuário e reclamações"), projeto Discovery e estratégia no Linear) | Média |
| **SaaS de arena (reserva, aulas, financeiro)** | BT Match, Arena Online, Partiu Play, Arena Manager, apps white-label sobre Matchpoint (TPC) | Operação da arena: quadra, Pix, aula. Alguns têm ranking interno | Ranking preso a uma arena. O jogador tem uma conta por arena | Média |
| **Rating e comunidade de raquete (fora do BT)** | Playtomic (padel), UTR (tênis), Rivals (padel, grupo fixo), Match! Tennis | Rating por jogador que funciona em duplas (UTR e Playtomic ajustam cada parceiro). H2H, adversários em comum, gráfico de evolução como feature paga | Não cobrem BT no Brasil. O rating do Playtomic é criticado por recompensar volume de jogos e por punir o jogador pelo erro do parceiro | Média |
| **Canais informais** | Grupos de WhatsApp, Instagram das arenas | Marcação de jogo (data e hora), avisos de torneio, divulgação. O boca a boca do WhatsApp é apontado como a ferramenta de vendas mais forte | Nada fica registrado: sem histórico, sem ranking, sem confirmação | Média (regulamentos e blogs citam, ex.: Nômades BT usa template no WhatsApp) |

**Observação estrutural (Forte):** o concorrente principal é ao mesmo tempo o líder do mercado e o alvo da análise. A maior parte dos rankings de arena encontrados na pesquisa roda nele. O ativo dele é o **motor de competição + a rede de organizadores**. A fraqueza é a **experiência do jogador**.

---

## 3. Oportunidades por JTBD

Ranqueadas dentro de cada JTBD, e os JTBDs ordenados pela força da evidência da maior dor. A coluna "Evidência" diz de onde vem o sinal.

### JTBD 2 — Saber onde estou no ranking

A dor com mais evidência. Os regulamentos (lidos) mostram regras complexas, e o app atual tem problemas documentados justamente em resultado e notificação.

| # | Oportunidade | Evidência | Força |
| --- | --- | --- | --- |
| 2.1 | **Registro de resultado com confirmação e prazo.** Um lança, o outro confirma, e há auto-aprovação em 24h. Sem isso o ranking fica parado | Rankings no concorrente principal usam o fluxo "lança → adversário aprova → auto 24h". Reviews reclamam de resultados pendentes há mais de 2 meses porque o organizador não atualiza | Média |
| 2.2 | **Explicar a pontuação.** Por que subi ou desci, e quanto vale cada fase ou W.O. Cada organizador tem sua tabela (vitória 100/derrota 25; W.O. dado −100, −30 ou até +70) | Tabelas de pontos divergentes em rankings de arena. Regulamentos federativos com tabelas por grau (CBT 2026: GA+ a G3) | Forte (as regras existem e divergem); Média (a dor do jogador é inferida) |
| 2.3 | **Corrida às Finals com linha de corte.** A vaga é sempre por posição numa data de corte (top 8 ou proporcional), nunca por "garantia matemática" | ITF Sand Series, Liga Alphaville, Arena 12, Aloha. Padrão visual análogo: "zona de promoção" do Duolingo | Forte (regra); Fraca (impacto emocional é hipótese do `docs/PRODUCT.md`) |
| 2.4 | **Ranking individual que sobrevive à troca de parceiro**, com a dupla derivada da soma | Padrão dominante em CBT, federações, ITF, CBBT e na maioria das arenas. Dupla fixa só numa minoria (Nômades, Tennis Experience) | Forte |

### JTBD 3 — Preparar-me para um confronto

| # | Oportunidade | Evidência | Força |
| --- | --- | --- | --- |
| 3.1 | **Confiança no nível do adversário.** Um perfil por pessoa e histórico de categoria visível. Sandbagging e perfis duplicados são dor pública | Reclamação pública contra o concorrente principal (evidência: documento D1 ("Evidência: voz do usuário e reclamações"), projeto Discovery e estratégia no Linear). CBT 2026 proíbe jogar categoria inferior no mesmo ano, promove obrigatoriamente o top 8 nacional (ou por avaliação técnica) e só deixa descer a pedido, depois da virada do ano | Média |
| 3.2 | **H2H com os dois recortes**: dupla × dupla (o confronto de hoje) e jogador × jogador (o histórico) | O padel mostra os dois lado a lado (StudyPadel, Padel Addict), e os números divergem muito. O concorrente principal usa confronto direto entre duplas como desempate | Média |
| 3.3 | **Contexto no H2H**: adversários em comum quando nunca se enfrentaram, ranking na época, W.O. separado de jogo real | Match! Tennis (adversários em comum); Tennis Explorer (ranking na data); ATP e UTR (W.O. fora do V/D) | Média |

### JTBD 1 — Encontrar competição

| # | Oportunidade | Evidência | Força |
| --- | --- | --- | --- |
| 1.1 | **Notificação confiável** de chave, horário e mudança de programação. Os regulamentos jogam a responsabilidade no atleta ("é de responsabilidade do atleta o monitoramento"), e a programação muda por clima e atraso | FCTBT 2023/24 e CBT 2026 (lidos). Review: sem notificação, o jogador perde torneios. Organizadores criam grupo de WhatsApp por torneio | Média |
| 1.2 | **Descoberta por nível e região num lugar só.** Hoje a divulgação está espalhada entre Instagram, WhatsApp e ao menos 6 plataformas de inscrição | Lista de plataformas (o concorrente principal, Tênis Integrado, Torneio Já, Tornfy, TennisUP, Super Oito). Não há dado da voz do jogador | Fraca |
| 1.3 | **Categoria certa na inscrição.** A nomenclatura não tem padrão ("Masculino B", "MASC B", "C Mista", "Dupla Mista - Iniciante"; níveis de A a E, Iniciante, Pro, Open, cores) | Literais de páginas de torneio | Média (a variação é fato); Fraca (a dor é inferida) |

### JTBD 5 — Sentir que estou evoluindo

| # | Oportunidade | Evidência | Força |
| --- | --- | --- | --- |
| 5.1 | **Evolução ao longo do tempo** (posição, categoria, V/D por período). É exatamente o que os concorrentes cobram no plano pago | Playtomic Premium (gráfico de evolução de nível, comparação com top performers); UTR Power; Strava (Year in Sport só para assinantes desde 2025) | Média (padrão de mercado); Fraca (dor específica no BT) |
| 5.2 | **Marcos de promoção de categoria.** Subir de D para C é um evento formal em federações | CBT 2026 (top 8 sobe); FMT (top 10 D→C, top 5 C→B); FPT (campeão da D sobe) | Forte (regra); Fraca (valor emocional) |

### JTBD 4 — Acompanhar amigos no BT

| # | Oportunidade | Evidência | Força |
| --- | --- | --- | --- |
| 4.1 | **Feed de atividade automático** (resultados, inscrições) no modelo Strava | Strava: volume alto de kudos e atividade em grupo associada a retenção em 12 meses (números: evidência: documento D7 ("Referências internacionais: números de crescimento e monetização"), projeto Discovery e estratégia no Linear). O concorrente principal já tem seguir, torcer e comentar, e o jogador o avalia mal (D1) | Fraca (analogia fora do BT) |
| 4.2 | **Notificação de resultado de amigo** como gatilho de volta ao app | Benchmarks de push de fornecedores (Airship, agregadores), antigos e genéricos | Fraca |

---

## 4. Negócio

### 4.1 Como o segmento ganha dinheiro

| Modelo | Quem usa | Preço público | Força |
| --- | --- | --- | --- |
| **Taxa anual para pontuar no ranking** (federação como "assinatura") | CBT: R$ 300/ano (R$ 200 no 2º semestre); sem ela os pontos não contam. FCTBT: filiação R$ 160/ano | Sim | Forte (lido) |
| **Inscrição de torneio** | Arenas e federações. Amador: ~R$ 70–150 por atleta por categoria. CBT nacional: R$ 157 (adimplente) ou R$ 247 | Sim | Forte (oficial), Média (amador) |
| **Taxa de conveniência na inscrição** | Ticket Sports (evento não-BT; percentual: D2). Não encontrado no concorrente principal nem no Tênis Integrado; parte dos torneios no concorrente principal recebe por Pix direto | Parcial | Fraca |
| **SaaS para organizador ou arena** | O concorrente principal (perfil de gestão), BT Match, Arena Online, Playtomic Manager (preço: D2) | Só Playtomic | Média |
| **Assinatura do jogador** | UTR Power, Strava (a assinatura é a maior parte da receita), Playtomic Premium (preços e participação na receita: D2) | Sim, fora do BT | Média |
| **Taxa por transação** (reserva ou partida) | Playtomic; o Premium elimina a taxa | Parcial | Média |
| **Patrocínio e marcas** | Heroe's, Kona, Mormaii, Head, Wilson, Drop Shot; marketplace SO Raquetes | Não | Fraca |

### 4.2 Implicações para o MVP (mesmo com pagamentos fora do escopo)

São implicações de modelagem e de produto, não decisões:

- **A organização (arena, liga, federação) é entidade de primeira classe.** Em todo modelo com receita comprovada, quem paga é o organizador ou quem organiza a competição. O jogador paga inscrição **ao** organizador. Um modelo de dados sem organização dona da competição fecha a porta para SaaS e taxa de inscrição.
- **As regras de pontuação são dado do organizador, não constante do código.** Cada ranking tem sua tabela, inclusive de W.O. (ver 2.2). Um MVP com mocks pode usar uma tabela única, desde que o schema não a torne impossível de variar.
- **As features que o mercado cobra do jogador são as do JTBD 5** (evolução, estatística avançada, comparação). Se um dia houver assinatura, o candidato natural é a camada de estatística, não o ranking. O ranking é a razão de estar no app, e a CBT já cobra por ele via federação.
- **Integridade de cadastro tem valor para o organizador** (sandbagging custa a credibilidade do torneio). É um argumento de venda B2B, não só UX.

---

## 5. Features candidatas fora do escopo atual

Ordenadas pela força da evidência. "Fora do escopo" se refere ao Must have do `docs/PRODUCT.md`.

| Feature | JTBD | Evidência | Força |
| --- | --- | --- | --- |
| **Notificações** (resultado a confirmar, chave publicada, mudança de horário, posição no ranking) | 1, 2 | Reviews do concorrente principal; regulamentos que responsabilizam o atleta; grupos de WhatsApp por torneio | Média |
| **Confirmação de resultado pelo adversário** (com prazo e contestação) | 2 | Fluxo já usado em rankings no concorrente principal; resultados pendentes nas reviews | Média |
| **Unicidade de perfil e histórico de categoria** (anti-sandbagging) | 3 | Reclamação pública (D1); regras CBT | Média |
| **Busca de torneio por categoria e região** | 1 | Dispersão de canais; nenhuma voz do jogador | Fraca |
| **Marcação de jogo de ranking dentro do app** (propor datas, aceitar) | 2 | O WhatsApp faz isso hoje (Nômades: template; desafiado propõe 3 datas). Não há evidência de que o jogador queira sair do WhatsApp | Fraca |
| **Inscrição e pagamento de torneio** | 1 | Modelo de receita comprovado (seção 4); fora do MVP pelo `docs/PRODUCT.md` | Média (para negócio) |

---

## 6. Riscos e hipóteses para o beta

Cada hipótese é algo que o beta pode confirmar ou derrubar.

| # | Hipótese ou risco | Por que importa | Como o beta pode medir |
| --- | --- | --- | --- |
| H1 | **Cold start de dados.** O ranking só tem valor se os resultados entram. Em ranking de arena quem lança é o jogador. Em torneio é o organizador | Sem resultado, os JTBDs 2, 3 e 5 ficam vazios. As reviews mostram resultados parados há meses | % de partidas com resultado confirmado em 24h e em 7 dias |
| H2 | **O jogador aceita registrar e confirmar no app o que hoje combina no WhatsApp** | A marcação vive no WhatsApp ("marcação de jogos de ranking acontece no WhatsApp", `docs/PRODUCT.md`) | Taxa de partidas registradas × partidas jogadas (auto-relato) |
| H3 | **Ranking individual cobre o público do beta** | Padrão dominante, mas há rankings por dupla fixa. Escolher errado muda o schema (pesquisa de domínio, pergunta D2 do feed) | Perguntar no onboarding do beta qual ranking a pessoa disputa e como funciona |
| H4 | **Ranking é o motivo de abrir o app, e o feed é secundário** | Premissa do `docs/PRODUCT.md`. A evidência do feed é só analógica (Strava) | Sessões iniciadas por notificação de ranking × de feed; telas mais visitadas |
| H5 | **Frequência cai entre competições** (`docs/PRODUCT.md`) | Afeta retenção e o valor do JTBD 5. As arenas indoor reduzem a sazonalidade de verão | Retenção semanal ao longo de um ciclo de ranking |
| H6 | **A experiência ruim do app atual é a principal barreira**, mais do que falta de funcionalidade | Nota baixa nas duas lojas (D2), com queixas de sessão e lentidão, não de feature ausente | Comparar tarefas críticas (ver posição, confirmar resultado) no app atual × no novo |
| R1 | **Governança dupla (CBT × CBBT)** e regras que mudam todo ano (CBT trocou 52 semanas por ano civil entre versões) | Regra de domínio codificada fica velha | — (risco de modelagem) |
| R2 | **Tamanho de mercado incerto.** O único número nacional é uma estimativa de 2023 sem metodologia | Afeta qualquer tese de negócio | — (buscar dado melhor antes de pitch) |
| R3 | **Base demográfica pode diferir do "jogador competitivo" presumido** (os estudos locais apontam maioria feminina de alta renda) | Afeta tom, textos com gênero gramatical (pergunta D7 do feed) e categorias. Decidido em 26/09: o tom está coberto, por ora, pelos textos neutros e pela concordância com a categoria | Perfil dos usuários do beta |

---

## 7. Perguntas abertas

Só o Gabriel responde. As respostas de 25 e 26/09 estão registradas abaixo de cada pergunta.

1. **Qual formato de ranking o MVP representa:** escada de desafio, sorteio periódico, rodadas com grupos ou ranking de torneios? Condiciona H1–H3 e a spec de entidades do domínio.
   - **Decidido (25–26/09):** ranking de arena e torneio, com peso igual. O ranking segue **temporada → rodadas → sorteio dos confrontos lançado pelo admin do ranking**, e as partidas são marcadas pelos jogadores. Detalhe na spec de entidades e relações do domínio.
2. **Como o produto entra no mercado do concorrente principal?** Organizadores e jogadores que migram por vontade própria, sem importar nenhum dado dele. Muda o risco H1 inteiro.
   - **Adiado** para a issue de decisões estratégicas do time Product no Linear (entrada no mercado e modelo de negócio). Até lá, o beta começa do zero, com as inscrições carregadas pelo time a partir da lista que o próprio organizador fornece.
3. **Quem é o cliente pagante de longo prazo:** o organizador (SaaS, inscrição) ou o jogador (assinatura)? Ou ainda nenhum, enquanto o discovery não decide?
   - **Adiado (26/09)** para a mesma issue de decisões estratégicas.
4. **Onde estão o audit heurístico, as respostas do Tally e o journey map da Fase 0?** Se existirem, podem subir ou derrubar a força de várias linhas deste doc.
   - **Não localizados (26/09).** O Gabriel não sabe onde estão. O audit foi reconstruído depois no documento "Auditoria do app atual" (Linear, projeto Discovery e estratégia), com o resumo no `docs/PRODUCT.md` (seção "Problemas do concorrente principal que o produto quer resolver (hipóteses)"). As respostas do Tally e o journey map seguem não localizados.
5. **O beta vai incluir entrevistas com jogadores?** É a lacuna de evidência mais cara deste levantamento.
   - **Suspensa (26/09).** Não há pesquisa com usuários por agora: o app é construído a partir das decisões do Gabriel. Entrevistas e Tally ficam para um momento posterior.

---

## 8. Fontes principais

Regulamentos lidos na íntegra (Tênis Integrado, S3):

- CBT Beach Tennis 2026 — `tenis-integrado-prod.s3.amazonaws.com/sync-prod/id22798/anexos/anexo_1768245583.pdf`
- CBT Beach Tennis (versão antiga) — `…/id382331/anexos/anexo_1720812460.pdf`
- CBT 2022/2023 — `…/id22798/anexos/anexo_1683202320.pdf`
- FMT 2025 — `…/id6818/anexos/anexo_1731614415.pdf`
- FCT 2025 — `…/id4183/anexos/anexo_1752154174.pdf`
- FCTBT 2023/24 — `…/id6815/anexos/anexo_1723663327.pdf`
- Interpoints RJ 2024 — `…/id6825/anexos/anexo_1722282394.pdf`

Vistas só por resumo de busca (conferir antes de citar):

- ITF Beach Tennis World Tour Regulations 2025/2026 e Sand Series Finals 2024/2025 — itftennis.com
- CBBT Regulamento 2025 — cbbtennis.com.br
- Rankings de arena que rodam no concorrente principal (lista e links: D2)
- Nômades BT — nomadesbt.com.br/ranking-regulamento
- O concorrente principal nas lojas e em reclamação pública (identificadores: D2)
- Playtomic (níveis, Premium, pricing), UTR (algoritmo de duplas, Power), Strava (pricing), StudyPadel e Padel Addict (H2H de duplas)
- Mercado: Máquina do Esporte, Terra, ND Mais, Jornal do Comércio (10/2023), RSD Journal

Padrões de UI (Mobbin): [Premier League H2H](https://mobbin.com/screens/20854574-a9a3-4acb-b20e-3de8f4f7f854), [FotMob H2H](https://mobbin.com/screens/0380608e-ddb8-498d-a4a9-4a9ee9107cd6), [Box Box Club H2H](https://mobbin.com/screens/0ec06d0e-773c-4f3f-b262-ea2915b447e6), [Duolingo zona de promoção](https://mobbin.com/screens/5966689f-bae2-476e-8afd-57402080775b).
