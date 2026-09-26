# MERCADO.md — Beach Tennis no Brasil e no mundo

**Propósito:** reunir evidências sobre tamanho, crescimento, governança e geografia do Beach Tennis (BT), com padel e pickleball como sinais de categoria. Aprofunda a seção 2.1 do `docs/DISCOVERY.md` (branch `docs/prd-11-mapa-oportunidades`). Não repete o que já está lá; retoma só os números que precisam ser confrontados.

**Pesquisa feita em 25/09/2026.**

> Este doc registra evidências. Não toma nem sugere decisões de produto.

---

## Método e limitações

| Item | Como foi feito |
| --- | --- |
| Busca | Mecanismo de busca web (resumos), cerca de 60 consultas em PT, EN e IT |
| Leitura na íntegra | 3 páginas via scraper (BBC Brasil/Terra 2023, H2R Insights 2024, RSD Journal 2021), 1 relatório via consulta direcionada ao PDF (Playtomic Global Padel Report 2026) e 2 regulamentos baixados do S3 da Tênis Integrado (CBT 2026, FCTBT 2025) |
| Bloqueios | O proxy da sessão bloqueou quase todos os domínios (ITF, CBBT, CBT, FPT, Lance, Playtomic, IBGE, SciELO, PubMed, Google Trends). O que vem desses sites foi visto **só pelo resumo da busca** |
| Google Trends | Não acessível. Não há dado de volume de busca neste doc |
| IBGE / PNAD | A última PNAD de esporte é de 2015 e não separa BT (categoria "esportes com raquete"). Não há dado oficial de praticantes de BT |

**Legenda de força** (igual ao `DISCOVERY.md`):

| Nível | Critério |
| --- | --- |
| **Forte** | Várias fontes independentes, ou fonte primária lida |
| **Média** | Uma fonte verificável, ou várias só por resumo de busca |
| **Fraca** | Inferência, proxy de outro esporte, fonte sem primária |

**Coluna "Acesso":** `Lido` = página ou PDF lido. `Resumo` = só o resumo do buscador.

---

## 1. Praticantes no Brasil

### 1.1 Os números em circulação

| Número | Ano de referência | Quem diz | Fonte | Acesso | Força |
| --- | --- | --- | --- | --- | --- |
| 400 mil praticantes | 2021 | CBT (estimativa) | [BBC Brasil via Terra, 22/07/2023](https://www.terra.com.br/noticias/brasil/pais-do-beach-tennis-por-que-numero-de-praticantes-quase-triplicou-no-brasil,56d1803673ee45456bbfd231f64c8ceaq5vaerc8.html) | Lido | Média |
| 1,1 milhão de praticantes | 2023 | CBT (estimativa) | Mesma matéria; replicado por [IESB](https://jornalismo.iesb.br/destaque3/brasil-tem-11-milhao-de-praticantes-de-beach-tennis/), [FPT](https://fpt.com.br/Noticias/Info/3827/o-beach-venceu-brasil-vira-potencia-do-beach-tennis), [Lance, 28/05/2025](https://www.lance.com.br/outros-lances/2025/05/28/o-esporte-mais-quente-do-momento-beach-tennis-conquista-o-brasil-e-o-mundo/) | Lido (Terra); Resumo (demais) | Média |
| Mais de 1,5 milhão de praticantes | "dados de 2024" | Atribuído à CBT | [Manchete Esportiva, 2026](https://mancheteesportiva.com.br/estatisticas/beach-tennis-brasil-2026-espirito-santo/425/) e resumo de busca sem primária | Resumo | **Fraca** (sem primária localizada) |
| Brasil tem 60% dos jogadores do mundo | 2023 | CBT, replicado | FPT, Sagres, Lance | Resumo | Fraca (não há número mundial que sirva de denominador) |
| Tênis, BT e padel juntos cresceram mais de 30% desde 2022 | 2022–2025 | Atribuído à CBT | [TNH1](https://www.tnh1.com.br/variedades/novo-esporte-supera-o-beach-tennis-e-vira-febre-entre-ricos-no-brasil/) | Resumo | Fraca |

**Leitura:**

- Todos os números nacionais vêm da **mesma fonte**: estimativa da CBT, sem metodologia publicada. A imprensa replica sem primária.
- A série 400 mil → 1,1 mi → 1,5 mi não tem definição de "praticante" (joga 1x por ano? toda semana?).
- Nenhum estudo acadêmico, IBGE ou consultoria mede o total nacional. A [SpaceMoney](https://www.spacemoney.com.br/esportes/beach-tennis-brasil-lidera-ranking) (Resumo) diz isso literalmente: estimativas "amplas", séries históricas "escassas", projeções "raras".

### 1.2 Contexto de outros esportes (mesma matéria da BBC)

| Esporte | Praticantes no Brasil | Fonte | Acesso | Força |
| --- | --- | --- | --- | --- |
| Futebol | ~14 mi (~7% da população) | Estudo Unicamp publicado no fim de 2019, citado pela BBC | Lido (citação) | Média |
| Vôlei | ~610 mil | Idem | Lido (citação) | Média |
| Tênis | ~380 mil | Idem | Lido (citação) | Média |
| Beach Tennis | Fora do top 15 no estudo de 2019 | Idem | Lido (citação) | Média |

Se a estimativa da CBT de 2023 estiver certa, o BT teria quase 3× os praticantes de tênis de 2019. É uma comparação de fontes e anos diferentes.

### 1.3 O que existe de "base contável" (atletas em plataformas)

Contadores públicos das páginas de federações e circuitos no LetzPlay, vistos pelo resumo de busca. São cadastros acumulados, não praticantes ativos. Podem ter duplicatas (perfis duplicados são dor citada no `DISCOVERY.md`).

| Página no LetzPlay | Jogadores | Rankings | Torneios | Acesso | Força |
| --- | --- | --- | --- | --- | --- |
| [CBBT – Circuito Brasileiro de BT](https://letzplay.me/CBBT) | 24.806 | 48 | 200 | Resumo | Média |
| [Circuito Beach Tennis](https://letzplay.me/circuitobeachtennis) | 19.756 | 186 | 109 | Resumo | Média |
| [Federação Gaúcha de BT (FGBT)](https://letzplay.me/CBBT-FGBT) | 6.565 a 6.653 (dois snapshots) | 201 | 150 a 153 | Resumo | Média |
| [Federação Pernambucana (FPEBT)](https://letzplay.me/CBBT-FPEBT/rankings) | 4.506 | 193 | 54 | Resumo | Média |
| [Federação Mineira (FMBT)](https://letzplay.me/CBBT-FMinBT/rankings) | 3.479 | 198 | 49 | Resumo | Média |
| [Federação Brasiliense – BT](https://letzplay.me/FBT) | 2.829 | 159 | 38 | Resumo | Média |
| [Federação de BT de MS](https://letzplay.me/fbtms) | 1.379 | 63 | 21 | Resumo | Média |
| [Federação Bahiana (FBBT)](https://letzplay.me/CBBT-FBBT/rankings) | 941 | 135 | 24 | Resumo | Média |

**Leitura:** a soma das páginas acima dá ~65 mil cadastros, com sobreposição provável. É uma ordem de grandeza de **jogadores que já entraram num circuito formal** hospedado no LetzPlay. Fica duas ordens abaixo de 1,1 mi. Não inclui CBT e federações de tênis que usam a Tênis Integrado. O número de atletas ranqueados na CBT **não foi encontrado** (páginas de ranking bloqueadas).

### 1.4 Uma referência estadual

| Achado | Fonte | Acesso | Força |
| --- | --- | --- | --- |
| Ceará: mais de 10 mil praticantes, amadores e profissionais (estimativa da Associação Cearense de BT) | [UNIFOR](https://unifor.br/-/beach-tennis-conheca-uma-das-modalidades-esportivas-que-mais-cresce-no-brasil) | Resumo | Fraca |

---

## 2. Arenas e quadras

| Achado | Data | Fonte | Acesso | Força |
| --- | --- | --- | --- | --- |
| Estado de SP: mais de 900 estabelecimentos em 2023, o dobro de 2020 | 2023 | [Tecnofit (blog de software de gestão)](https://www.tecnofit.com.br/blog/quanto-lucra-uma-quadra-de-beach-tennis/); primária não citada | Resumo | Fraca |
| Rio de Janeiro: BT é a atividade esportiva licenciada mais comum da cidade, com 80 espaços regularizados | 2023 | BBC via Terra (Secretaria Municipal de Esportes) | Lido | Média |
| Florianópolis: mais de 30 quadras de areia públicas; "grande parte" dos novos espaços públicos terá quadra de areia | 2023 | BBC via Terra (Secretaria de Esporte) | Lido | Média |
| Porto Alegre: 30 a 40 locais de prática | 2021–2024 | [Jornal do Comércio, 07/2021](https://www.jornaldocomercio.com/_conteudo/ge2/noticias/2021/07/804266-beach-tennis-supera-status-de-esporte-passageiro.html); [blog Vera Bernardes](https://www.verabernardes.com.br/blog/40-lugares-praticar-beach-tennis-em-porto-alegre/) | Resumo | Fraca |
| Sul e Sudeste concentram ~70% das quadras | 10/2023 | Citado no `DISCOVERY.md`; nesta pesquisa **não foi possível reencontrar** a primária | — | Fraca |
| Não existe censo nacional de arenas. Há diretórios comerciais (ex.: [Total Beach Tennis](https://totalbeachtennis.com.br/blogs/blog-tbt/arenas-e-quadras-de-beach-tennis-do-brasil)) sem contagem publicada | 2026 | Busca | Resumo | Média (ausência) |

### 2.1 Economia de arena (sinal de oferta)

| Achado | Fonte | Acesso | Força |
| --- | --- | --- | --- |
| Montar uma quadra: R$ 40 mil a R$ 80 mil | [Tecnofit](https://www.tecnofit.com.br/blog/quanto-lucra-uma-quadra-de-beach-tennis/) | Resumo | Fraca |
| Arena Nacional (SP): ~R$ 5 mi para 18 quadras com lanchonete, loja e fisioterapia. Arena ZN (litoral SP): R$ 700 mil | Idem | Resumo | Fraca |
| Faturamento anual "próximo de R$ 1 mi" para uma arena (opinião de especialistas) | Idem | Resumo | Fraca |
| Franquias de BT faturam R$ 25–30 mil/mês e "ainda não estão consolidadas" (consultora do SEBRAE-SP) | [Tribuna de Minas, 22/04/2024](https://tribunademinas.com.br/noticias/economia/22-04-2024/beach-tennis-vale-a-pena-investir-em-uma-franquia.html) | Resumo | Fraca |
| Arenas viram "clube": loja, restaurante, DJ, eventos corporativos | [O Tempo](https://www.otempo.com.br/sports/especializados/arenas-de-beach-tennis-atraem-clientes-com-lojas-restaurantes-e-ate-dj-1.2550643); [SEBRAE-PE (caso Mago's Arena)](https://sebrae.com.br/sites/PortalSebrae/ufs/pe/artigos/de-amigos-para-socios-empresarios-obtem-sucesso-com-arena-de-esportes,e67f0ed61a612810VgnVCM100000d701210aRCRD) | Resumo | Média |

### 2.2 Arenas indoor e sazonalidade

| Achado | Fonte | Acesso | Força |
| --- | --- | --- | --- |
| Quadra coberta leva o BT a cidades frias e chuvosas. Depoimento de jogadora de Curitiba: "mesmo sendo uma quadra coberta, eu já me sinto na praia" | BBC via Terra, 2023 | Lido | Média |
| Escola Vita Beach (Curitiba): **+6% de alunos no inverno** em relação a maio; nº de professores quase dobrou desde 2019 | BBC via Terra, 2023 | Lido | Média (um caso) |
| Belém: arenas cobertas mantêm a prática no "inverno amazônico" (estação de chuva) | [O Liberal](https://www.oliberal.com/esportes/maisesportes/esporte-do-verao-beach-tennis-continua-em-alta-durante-o-inverno-em-belem-1.470738) | Resumo | Fraca |
| Condomínios no litoral gaúcho misturam quadras cobertas e descobertas | [Costa Dorata](https://costadorata.com.br/blog/beach-tennis-condominio-litoral-norte/) | Resumo | Fraca |
| Temporada competitiva formal segue o **ano civil** (CBT 2026: 1º/jan a 31/dez; FCTBT 2025: 7 melhores resultados da temporada) | Regulamentos CBT 2026 e FCTBT 2025 | Lido | Forte |
| Eventos de massa no litoral no verão (Brasil Beach Games 2026, Atlântida/Xangri-Lá: 1.500 atletas em 5 modalidades, ITF BT100 + 2 BT10) | [O Sul](https://www.osul.com.br/atlantida-vira-palco-mundial-do-beach-tennis-no-brasil-beach-games-2026/); [Prefeitura de Xangri-Lá](https://xangrila.rs.gov.br/artigo/brasil-beach-games-2026) | Resumo | Média |

**Lacuna:** não há série mensal de ocupação de arenas, inscrições ou buscas. A sazonalidade real só aparece por anedota.

---

## 3. Governança: quem organiza o BT

| Entidade | Papel | Plataforma de ranking/inscrição | Fonte | Acesso | Força |
| --- | --- | --- | --- | --- | --- |
| **ITF** | Rege o BT internacional (ITF Beach Tennis World Tour, Sand Series, Mundial, Copa do Mundo) | Site ITF | [ITF Beach Tennis Tour](https://www.itftennis.com/en/tours/beach-tennis-tour/) | Resumo | Forte |
| **IFBT** (International Federation of Beach Tennis) | Entidade internacional paralela, sediada na Itália. 24º Mundial IFBT em Rimini, 06/2025 | Próprio | [ifbt.eu](https://www.ifbt.eu/world-championships-2025/) | Resumo | Média |
| **CBT** (Confederação Brasileira de Tênis) | Filiada à ITF. Ranking nacional de BT, torneios GA+ a G3, anuidade R$ 300 (R$ 200 no 2º semestre) em 2026 | Site CBT | Regulamento CBT 2026 | Lido | Forte |
| **CBBT** (Confederação Brasileira de Beach Tennis) | Circuito Brasileiro de BT, federações estaduais "de BT" abaixo dela | LetzPlay | [cbbtennis.com.br](https://cbbtennis.com.br/); [Regulamento CBBT 2025](https://cbbtennis.com.br/wp-content/uploads/2025/01/Regulamento-Cbbt-2025.pdf) | Resumo | Forte |
| Federações **de tênis** com BT (FPT, FGT, FCTBT, FMT, FCT…) | Ranking estadual; FCTBT: filiação R$ 160/ano | Tênis Integrado | Regulamento FCTBT 2025 | Lido | Forte |
| Federações **de BT** (FGBT, FPEBT, FMBT, FECBT, FBBT, FSMGBT…) | Ranking estadual sob a CBBT | LetzPlay | Contadores da seção 1.3 | Resumo | Média |
| **CBI-BT** | Primeiro Circuito Brasileiro Interclubes de BT (2025) | Próprio | [cbibt.com.br](https://cbibt.com.br/) | Resumo | Fraca |

**Leitura:** em vários estados existem **duas federações paralelas** (uma de tênis via CBT, outra de BT via CBBT), cada uma numa plataforma diferente. No plano internacional também há duas (ITF e IFBT).

---

## 4. Circuitos e volume de torneios

### 4.1 ITF Beach Tennis World Tour

| Ano | Torneios ITF | Países | Prêmios | Fonte | Acesso | Força |
| --- | --- | --- | --- | --- | --- | --- |
| 2023 | ~325 (inferido: 2024 foi +51%) | — | — | Cálculo sobre o dado de 2024 | — | Fraca (inferência) |
| 2024 | **491** (465 pro + 26 juvenis), recorde | 32 | US$ 1.938.500 | [ITF, anúncio do calendário Sand Series 2025](https://www.itftennis.com/en/news-and-media/articles/itf-announce-2025-itf-beach-tennis-sand-series-calendar-with-record-breaking-prize-pool/); [Tennis TourTalk](https://tennistourtalk.com/115869/2025-itf-beach-tennis-sand-series-calendar-announced) | Resumo | Média |
| 2025 | Total não encontrado. Soma só dos 4 maiores países: 495 | — | "mais de US$ 2 mi" | ITF (idem); FPT (abaixo) | Resumo | Média |

Página institucional da ITF ainda fala em "mais de 300 torneios em 37 países" ([ITF](https://www.itftennis.com/en/tours/beach-tennis-tour/), Resumo). Parece texto desatualizado.

### 4.2 Brasil no calendário ITF

| Achado | Fonte | Acesso | Força |
| --- | --- | --- | --- |
| 2025: Brasil é o país com mais torneios ITF de BT: **180**, contra Itália 145, Espanha 98, França 72, EUA 45 | FPT, baseada no calendário ITF: [tenispaulista.com.br](https://www.tenispaulista.com.br/brasil-se-torna-o-pais-que-mais-recebe-torneios-internacionais-de-beach-tennis/); [Itatiaia](https://www.itatiaia.com.br/esportes/mais-esportes/brasil-se-torna-o-pais-que-mais-recebe-torneios-internacionais-de-beach-tennis); [SpaceMoney](https://www.spacemoney.com.br/esportes/beach-tennis-brasil-lidera-ranking) | Resumo (3 fontes, 1 primária) | Média |
| 2025 por estado: **SP 49**, PR 18, MG 15, RS 9, SC 9 | Mesmas | Resumo | Média |
| 2025: Brasil sedia 3 Sand Series (US$ 50k, 75k e 100k em Brasília), 9 BT400 e a Copa do Mundo ITF | ITF (anúncio Sand Series 2025) | Resumo | Média |
| Copa do Mundo ITF no Brasil em 2021, 2022, 2023, 2024 e 2025 | Terra (2023, lido); FPT (resumo) | Lido/Resumo | Forte |
| "Mais de 65% dos torneios internacionais acontecem no Brasil" (presidente da CBT, 2023) | BBC via Terra | Lido | **Fraca** (ver divergência D3) |
| CBT: 59 eventos ITF em 2022 e 62 em 2023, cada um com 2 ou 3 torneios | BBC via Terra | Lido | Média |

### 4.3 Circuitos nacionais e estaduais

| Circuito | Volume | Fonte | Acesso | Força |
| --- | --- | --- | --- | --- |
| CBT nacional (GA+, GA, G1+, G1, G2, G3) | Nº de torneios em 2026 não encontrado. Inscrição R$ 157 (adimplente) ou R$ 247 | Regulamento CBT 2026 | Lido | Forte (regras); sem volume |
| CBBT – Circuito Brasileiro | 25.894 jogadores, 208 torneios e 50 rankings acumulados na página (lido em 25/09/2026 no aprofundamento; o resumo dava 200 e 48) | LetzPlay | Lido | Forte |
| Campeonato Cearense (FCTBT) | Etapas FCTBT 1000/1500/2000; até 4 etapas no interior | Regulamento FCTBT 2025 | Lido | Forte |
| Federações de BT (seção 1.3) | 21 a 153 torneios acumulados por federação | LetzPlay | Resumo | Média |
| Brasil Open, Superliga, Brasil Beach Games | Existem; volume de atletas só no Brasil Beach Games (1.500 em 5 modalidades) | Ver seção 2.2; `DISCOVERY.md` | Resumo | Fraca |

**Lacuna:** não existe contagem de torneios amadores de arena por ano. Pelos contadores do LetzPlay, só as páginas listadas somam centenas de torneios. Mas os contadores são acumulados, sem recorte por ano.

---

## 5. Sinais de categoria: padel e pickleball

### 5.1 Padel no mundo

| Métrica | Playtomic + Strategy& (PwC) | FIP (Federação Internacional) | Outros |
| --- | --- | --- | --- |
| Jogadores | **19,4 mi** (fim de 2025), 850 mil federados | **35 mi** (World Padel Report 2025) | 25 mi em 110 países (Financial Times, 2023, citado por [TNH1](https://www.tnh1.com.br/variedades/novo-esporte-supera-o-beach-tennis-e-vira-febre-entre-ricos-no-brasil/)) |
| Quadras | **58.334** (2025) | **77 mil** em ~150 países | 40 mil (FT, 2023) |
| Clubes | 20.902 (2025) | — | — |
| Crescimento de quadras | +16% em 2025; +26% em 2024; projeção 91 mil em 2028 | Torneios FIP: 182 (2024) → 290 (2025) | — |
| Mercado de equipamentos | €598 mi em 2025 (€441 mi em 2023); 4,3 mi raquetes a €94,2 médio | — | — |
| Fonte | [Relatório 2026 (PDF)](https://8258038.fs1.hubspotusercontent-na1.net/hubfs/8258038/Global%20Padel%20Report/Playtomic%20Global%20Padel%20Report%202026%20(1).pdf); [nota PwC](https://www.pwc.es/es/sala-prensa/notas-prensa/2026/playtomic-global-padel-report-2026.pdf) | [Super Padel, 03/12/2025](https://superpadel.com.br/2025/12/03/fip-divulga-o-world-padel-report-2025-e-aponta-expansao-historica-do-esporte/) | — |
| Acesso | Lido (consulta direcionada ao PDF) + Resumo | Resumo | Resumo |
| Força | Forte (Playtomic) | Média | Fraca |

**Série de quadras e clubes (Playtomic 2026, tabela do relatório):**

| Ano | Quadras | Clubes |
| --- | --- | --- |
| 2019 | 16.638 | 4.927 |
| 2021 | 29.232 | 8.001 |
| 2023 | 43.249 | 12.651 |
| 2024 | 50.436 | 15.933 |
| 2025 | 58.334 | 20.902 |

O próprio relatório avisa: as conclusões são "direcionais", não censo. A pesquisa com clubes representa operadores maiores e mais digitalizados. Leitura de 2026: o padel "está amadurecendo", e o foco passa de construir quadras para quanto cada uma gera ([actu-padel](https://actu-padel.com/en/global-padel-report-2026-world-padel-faces-the-challenge-of-overcapacity/), Resumo: "desafio da sobrecapacidade").

### 5.2 Padel no Brasil

| Número | Fonte | Acesso | Força |
| --- | --- | --- | --- |
| ~1.600 quadras (2024) | Playtomic Global Padel Report 2025, via [resumo](https://sgbonline.com/exec-study-predicts-continued-explosive-growth-for-padel-including-in-the-u-s/) | Resumo | Média |
| América Latina: +896 quadras em 2025, "puxadas por México e Brasil"; Brasil "emergente, com sinais de digitalização" | Playtomic 2026 / 2025 | Lido / Resumo | Forte |
| 380 clubes e mais de 1.000 quadras (junho de 2025), primeira vez com 4 dígitos | FIP, via [Gazeta SP](https://www.gazetasp.com.br/esportes/mais-de-600-mil-praticantes-padel-dispara-no-brasil-e-e-o-esporte-que/1175610/) e [Exame](https://exame.com/casual/o-esporte-que-inaugura-tres-novas-quadras-por-dia-e-nao-e-o-beach-tenis/) | Resumo | Média |
| Mais de 600 mil praticantes; crescimento de 15–20% ao ano; ~3 quadras novas por dia | COBRAPA, via Gazeta SP e Exame | Resumo | Fraca (estimativa de entidade, sem metodologia) |
| ~350 clubes e mais de 700 mil jogadores amadores, concentrados em Sul e Sudeste | Resumo agregando [EsporteSC](https://www.esportesc.com.br/padel-cresce-no-brasil-conquista-novos-publicos-e-derruba-rotulo-de-elitizado/) e outros | Resumo | Fraca |
| Padel "vai superar o BT"; "febre entre ricos"; celebridades (Ronaldo, Virgínia) | [TNH1](https://www.tnh1.com.br/variedades/novo-esporte-supera-o-beach-tennis-e-vira-febre-entre-ricos-no-brasil/); [Campo Grande News](https://www.campograndenews.com.br/lado-b/faz-bem/queridinho-dos-famosos-padel-promete-desbancar-o-beach-tennis) | Resumo | Fraca (opinião) |
| Buscas por padel no Google Trends +500% desde 2020; posts #padel de 50 mil (2020) para 415 mil (2025) | Resumo sem fonte primária identificada | Resumo | Fraca |

### 5.3 Pickleball

| Número | Fonte | Acesso | Força |
| --- | --- | --- | --- |
| EUA: 19,8 mi jogadores em 2024 (+45,8% sobre 2023) | [SFIA](https://sfia.org/research/u-s-pickleball-participation/) | Resumo | Média |
| EUA: 24,3 mi em 2025 (+22,8%); +171,8% em 3 anos. Crescimento desacelerando | [pickleball.com](https://pickleball.com/news/sfia-report-confirms-over-24-million-americans-playing-pickleball); [The Dink](https://www.thedinkpickleball.com/report-is-u-s-pickleball-participation-leveling-off/) | Resumo | Média |
| Playtomic 2026: nos EUA o pickleball funciona como "porta de entrada" para o padel, não como concorrente | Relatório Playtomic 2026 (nota de imprensa) | Resumo | Média |
| Brasil: 25 a 30 mil praticantes, ~13 mil em SP (estimativa de federações) | [Rádio Itatiaia](https://www.itatiaia.com.br/porlucasmachado/pickleball-o-esporte-social-que-cresce-no-brasil/) | Resumo | Fraca |
| "Até 120 milhões de praticantes no mundo" | [Agita Brasil](https://www.agitabrasil.com.br/noticia/com-ate-120-milhoes-de-praticantes-no-mundo-pickleball-passa-a-integrar-as-areas-de-lazer-de-empreendimentos-de-alto-padrao-no-brasil) | Resumo | Fraca (número sem primária, parece inflado) |

### 5.4 Tênis como denominador

| Número | Fonte | Acesso | Força |
| --- | --- | --- | --- |
| 106 mi de jogadores de tênis no mundo (ITF Global Tennis Report 2024), +25,6% desde 2019. Mulheres: 40,3% | [ITF](https://www.itftennis.com/en/news-and-media/articles/itf-global-tennis-report-participation-hits-106-million-in-five-years/) | Resumo | Média |
| O relatório **não separa BT** nos resumos encontrados | Busca | Resumo | Média (ausência) |
| Itália: tênis + padel com 6,5 mi praticantes; BT não aparece separado | [FITP, Report Tennis e Padel 2024](https://www.fitp.it/Federazione/News/Attivita-internazionale/report-tennis-padel-2024-fitp) | Resumo | Média |

---

## 6. Regiões fortes

| Sinal | Estados/cidades | Fonte | Força |
| --- | --- | --- | --- |
| Torneios ITF 2025 | SP (49) muito à frente; depois PR, MG, RS, SC | FPT (seção 4.2) | Média |
| Cadastros em federações de BT no LetzPlay | RS (FGBT ~6,6 mil), PE (~4,5 mil), MG (~3,5 mil), DF (~2,8 mil) | Seção 1.3 | Média |
| Cidades-sede ITF, inclusive longe do mar | SP, Brasília, BH, Teresina, Palmas, Cuiabá, Ribeirão Preto, Maringá, Londrina | BBC via Terra, 2023 (lido) | Média |
| Oferta de espaços | Estado de SP (>900 em 2023), Rio (80 espaços licenciados), Florianópolis (>30 quadras públicas) | Seção 2 | Fraca a Média |
| Origem | Chegou pelo Rio em 2008; 1º torneio em Florianópolis, 2010 (CBT) | BBC via Terra | Média |

**Leitura:** o mapa por torneios internacionais (SP no topo) e o mapa por cadastros em federações de BT (RS, PE, MG no topo) não coincidem. Cada um mede uma coisa, e o segundo depende de quais federações usam o LetzPlay.

---

## 7. Onde as fontes divergem

| # | Tema | Versão A | Versão B | Comentário |
| --- | --- | --- | --- | --- |
| D1 | Praticantes BT no Brasil | 1,1 mi (CBT, 2023) | 1,5 mi (atribuído à CBT, "2024") | B sem primária localizada. Nenhuma das duas tem metodologia |
| D2 | Base mensurável × estimativa | ~65 mil cadastros somando 8 páginas de federação/circuito no LetzPlay | 1,1 mi praticantes | Não são a mesma coisa (competidor cadastrado × praticante). A distância mostra que o "competidor formal" é uma fração pequena |
| D3 | Peso do Brasil no calendário ITF | ">65% dos torneios" (CBT, 2023) | 180 de pelo menos 540 em 2025 (no máximo ~1/3) (FPT sobre calendário ITF) | Só Brasil, Itália, Espanha, França e EUA já somam 540 torneios em 2025. A afirmação de 65% não fecha com a contagem da FPT |
| D4 | Nº de torneios ITF no Brasil | 180 (FPT, 2025) | "~92 por ano" ([Manchete Esportiva](https://mancheteesportiva.com.br/estatisticas/beach-tennis-brasil-2026-espirito-santo/425/)); 59–62 "eventos" com 2–3 torneios cada (CBT, 2022–23) | Unidades diferentes (evento × torneio) e anos diferentes |
| D5 | Tamanho do ITF Tour | 491 torneios em 32 países (2024) | "mais de 300 em 37 países" (página da ITF) | Texto institucional desatualizado ou contagem diferente |
| D6 | Gênero dos praticantes | 54% homens (CBT, 2023) | Maioria feminina em todos os estudos locais (ver `PUBLICO.md`) | Amostras locais e de conveniência × número nacional sem método |
| D7 | Faixa etária | 44% têm 10–19 anos (CBT, 2023) | Estudos locais: média de 35 a 41 anos | O dado da CBT destoa de tudo o mais. Pode incluir base juvenil de tênis. Não verificável |
| D8 | Padel no mundo | 19,4 mi jogadores, 58 mil quadras (Playtomic) | 35 mi, 77 mil quadras (FIP) | FIP é entidade interessada em números altos; Playtomic declara método direcional |
| D9 | Padel no Brasil | ~1.600 quadras (Playtomic 2025) | >1.000 quadras e 380 clubes (FIP, 06/2025) | Quase 60% de diferença na mesma época |
| D10 | Padel × BT em praticantes | Padel 600–700 mil (COBRAPA) | BT 1,1–1,5 mi (CBT) | Ambos são estimativas de entidades interessadas |

---

## 8. Lacunas

- **Nenhuma medição independente** do número de praticantes de BT no Brasil (nem IBGE, nem consultoria, nem academia).
- **Atletas ranqueados na CBT e na CBBT:** não encontrados (sites bloqueados; contadores do LetzPlay são acumulados).
- **Torneios amadores por ano:** sem contagem.
- **Google Trends:** não acessado. Não há curva de interesse de busca para BT × padel.
- **Sazonalidade:** só anedotas.
- **Número mundial de praticantes de BT:** não existe. Por isso a frase "Brasil tem 60% dos jogadores do mundo" não tem denominador.
