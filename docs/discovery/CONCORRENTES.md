# CONCORRENTES.md

Análise de concorrentes e produtos similares ao concorrente principal, do ponto de vista do jogador competitivo de Beach Tennis no Brasil.

Pesquisa feita em 25/09/2026.

> Este doc é **descritivo**. Registra o que existe, como se posiciona, como cobra e o que os usuários dizem, em conclusão neutra. **Não recomenda nem decide.** O mapa de oportunidades está no `DISCOVERY.md` (seção 2.2 traz o primeiro mapa de concorrentes). Aqui ele é aprofundado produto a produto. JTBDs citados pelo número seguem o `docs/PRODUCT.md`.
>
> Preços de empresa, notas e contagens de loja, números declarados, trechos de review e identificadores de loja saíram do repo: evidência: documento D2 ("Evidência: concorrentes (preços, números, ids de loja)"), projeto Discovery e estratégia no Linear.

---

## Método e limitações

**Como foi feito.** Buscas na web (resumos do mecanismo de busca) e leitura integral de 8 páginas via scraper: páginas de loja do Tênis Integrado e do Meu Ranking; sites do Ranketes e do BT Match; página de preços do Playtomic Manager. As demais páginas estavam bloqueadas pelo proxy de rede da sessão (lojas de app, sites de concorrentes, help centers) e foram vistas só pelo resumo de busca.

**Limitações.**

- A maioria dos achados é **Resumo** (visto só no resumo da busca). Resumos podem misturar páginas antigas e recentes. Confira a fonte antes de citar um número isolado.
- Notas de loja mudam todo dia. As lidas são de 25/09/2026 e estão no D2.
- Preços em moeda estrangeira não foram convertidos.
- Não houve teste de uso dos apps (nenhuma conta criada). Features vêm do que o produto declara.
- Não há voz do jogador além de reviews públicas. Aqui elas aparecem só como paráfrase, sem autor.

**Legenda.**

| Marca | Significado |
| --- | --- |
| **Forte** | Várias fontes independentes, ou fonte primária lida na íntegra |
| **Média** | Uma fonte específica verificável, ou várias vistas só por resumo de busca |
| **Fraca** | Inferência, benchmark genérico ou fonte única vista só por resumo |
| **Lido** | A página foi lida na íntegra nesta pesquisa |
| **Resumo** | Só o resumo do mecanismo de busca foi visto |

---

## 1. Ranking e torneio de BT no Brasil

O núcleo da concorrência. Todos atendem **organizador e jogador ao mesmo tempo** (modelo B2B2C): quem paga é o organizador, quem usa o app de jogador é o atleta.

### 1.1 O concorrente principal

| Campo | Achado | Força | Fonte |
| --- | --- | --- | --- |
| Proposta | Sistema de gestão de rankings, torneios, barragens, aulas, locações e agenda de quadras. Para o jogador: H2H, painel de desempenho, histórico | Forte (Lido) | Site e loja do concorrente principal (D2) |
| Público | Organizador (academia, arena, clube, condomínio, liga, circuito) + jogador. Tênis, BT e padel | Forte (Lido) | idem |
| Base declarada | A maior base declarada do setor no Brasil, autodeclarada, sem data nem método (números: D2) | Média (Lido, autodeclarado) | Site do concorrente principal (D2) |
| Clientes de BT | CBBT e federações estaduais de BT (FPaBT, FGBT, FPEBT, FTBT, FBBT); Circuito Beach Tennis (contadores: D2 e D4) | Média (Resumo; CBBT Lido) | Páginas públicas das federações no concorrente principal (D2) |
| Features jogador | Lançar resultado, buscar torneio, participar de ranking, achar quadra, estatísticas, rede social própria (seguir, torcer, comentar) | Forte (Lido) | Loja |
| Features gestor | Clientes, agenda, aulas e professores, locação online, clubinho e day use, rankings e barragens, torneios, financeiro, loja e lanchonete, automações, dezenas de gráficos | Forte (Lido) | Home |
| Receita | SaaS para gestor. Sem preço público: o caminho é pedir um perfil de gestão | Forte (Lido) | Home |
| Avaliação nas lojas | Mal avaliado pelo jogador nas duas lojas; a ficha da loja iOS declara só inglês (números de loja: D2) | Forte (Lido, 25/09/2026) | Lojas (D2) |
| Mudança recente | Versões 10 e 11 (ago/2026): nova identidade visual, preparação para uma "nova fase", sessão preservada após atualizações e correção de autenticação | Forte (Lido) | Histórico de versões da loja |
| Queixas (reviews) | Sessão que cai em poucos minutos; notificação que não chega e faz perder torneio; lentidão; jogos pendentes por meses porque o gestor não atualiza; conta que não se exclui; erro no cadastro; parceiros antigos que não saem da lista (evidência: documento D1 ("Evidência: voz do usuário e reclamações"), projeto Discovery e estratégia no Linear) | Forte (Lido) | Loja (D1) |

**Pontos fortes (descritivo):** maior base declarada; é o sistema oficial da CBBT e de federações de BT; cobre a operação inteira da arena, então o ranking nasce onde o jogo acontece.
**Pontos fracos (descritivo):** experiência do jogador mal avaliada; resultado depende do gestor; ficha da loja iOS em inglês.

### 1.2 Tênis Integrado (Info Esportes)

| Campo | Achado | Força | Fonte |
| --- | --- | --- | --- |
| Proposta | Sistema oficial de federações e da CBT: torneios, rankings, filiação, cursos | Forte (Lido + regulamentos lidos no `DISCOVERY.md`) | Loja iOS, [tenisintegrado.com.br](https://www.tenisintegrado.com.br/ranking) |
| Público | Federação (cliente) + atleta federado. Tênis e BT. Mesma empresa lançou Padel Integrado e Pickleball Integrado | Forte (Lido) | Loja iOS, "Mais de Info Esportes" |
| Features | Inscrição e pagamento de torneio, ranking, jogos avulsos, estatísticas, guia de treinadores, programação por quadra, check-in / no-show, súmula, pagamento de filiação | Forte (Lido) | Descrição e histórico de versões |
| Receita | Cobrada via federação: filiação anual (CBT R$ 300/ano) e inscrição (ex.: FCT R$ 70 por 2 categorias). Taxa própria da plataforma não encontrada | Forte para taxas federativas (regulamentos); Fraca para a plataforma | [Regulamento CBT BT](https://tenis-integrado-prod.s3.amazonaws.com/sync-prod/id382331/anexos/anexo_1720812460.pdf) |
| Avaliação na loja | Baixa na loja iOS (nota e posição: D2) | Forte (Lido, 25/09/2026) | Loja (D2) |
| Ritmo | ~25 versões entre set/2025 e ago/2026, foco em pagamento (Mercado Pago, InfoPay) e programação | Forte (Lido) | Histórico |
| Queixas | Reviews negativas, inclusive sobre programação do dia do torneio (conteúdo: D2) | Forte (Lido) | Loja (D2) |

**Fortes:** monopólio de fato no circuito federativo (ranking oficial CBT); pagamentos integrados.
**Fracos:** o atleta não escolhe usar, a federação escolhe; avaliação de loja baixa; reviews relatam falha de programação com custo competitivo real (D2).

### 1.3 Meu Ranking / Ranking Beach Tennis / rankingdetenis.com (RDT Soluções)

| Campo | Achado | Força | Fonte |
| --- | --- | --- | --- |
| Proposta | Ranking contínuo / barragem: atletas jogam regularmente, sem a eliminação e o stress dos torneios. Desde 2016 no tênis; versão BT seguiria regulamento da FBT | Forte (Lido) | Loja iOS, [rankingbeachtennis.com](https://www.rankingbeachtennis.com/) |
| Público | Dois apps: Jogador e Organizador. 9 esportes (tênis, BT, padel, squash, futevôlei, vôlei de praia, tênis de mesa, pickleball, raquetinha) | Forte (Lido) | Loja iOS (os dois apps) |
| Features | Ranking por rodada com defesa de pontos (modelo ATP), H2H, estatística, inscrição em torneio, notificação de rodada, ranking de duplas todos contra todos (jun/2025), **link do grupo de WhatsApp do torneio exibido após a inscrição** (jun/2026) | Forte (Lido) | Histórico de versões |
| Receita | Assinatura paga pelo administrador; jogador grátis. Inscrição de torneio por categoria, com desconto para assinantes do app (valores: D2) | Média (Resumo) | [meuranking-app.com](https://www.meuranking-app.com/), [rankingdetenis.com](https://www.rankingdetenis.com/Torneio/Regulamento?barragem=1) |
| Avaliação na loja | A mais alta entre os apps de ranking BR lidos (nota, contagem e posição: D2) | Forte (Lido, 25/09/2026) | Loja (D2) |
| Reviews | Positivas e curtas: elogiam a fluidez das barragens, o H2H e a busca de torneio (trechos: D2) | Forte (Lido) | Loja (D2) |

**Fortes:** a melhor avaliação de loja entre os apps de ranking BR lidos; atualização mensal; convive com o WhatsApp em vez de competir com ele.
**Fracos:** base menor; identidade dividida em 3 marcas (Meu Ranking, Ranking de Tênis, Ranking Beach Tennis); preço do organizador não público.

> Atenção: existe um homônimo, "Meu Ranking: gestão de futebol amador" ([meuranking-app.com](https://www.meuranking-app.com/)), que também cita BT. Os resumos de busca misturam os dois. **Fraca** a atribuição de "jogador acessa por link no grupo de WhatsApp sem baixar nada" à RDT.

### 1.4 Ranketes

> **Decisão (26/09):** o Ranketes é **referência pontual**, não concorrente a monitorar. Motivo: uso quase nulo nas lojas (evidência: documento D2 ("Evidência: concorrentes (preços, números, ids de loja)"), projeto Discovery e estratégia no Linear).

| Campo | Achado | Força | Fonte |
| --- | --- | --- | --- |
| Proposta | "O jogo acabou. Agora ele vale ranking." Hub de tênis e BT para atleta, professor, promoter e arena. Em "acesso antecipado" | Forte (Lido) | [ranketes.com.br](https://www.ranketes.com.br/) |
| Features atleta | Registro de partida com **confirmação do adversário**; desafio com dia e hora e lembrete para os dois; **H2H da temporada** (vitórias, sets, games, data da virada); atletas por distância; Match Club (sorteio de duplas, "Reis da Quadra"); torneios 8/16, grupos + mata-mata, dupla eliminação, "formato Finals"; feed, badges, perfil público; rankings de tênis e BT separados, simples e duplas | Forte (Lido) | idem |
| Regra de pontos | Vitória 80 (partida/desafio) a 250 (ranking); bônus de até 1,6× por vencer quem está acima no ranking; derrota leva ~20%; todos começam com 100; ninguém fica negativo; torneio vale ×2; temporada 1/jan–31/dez; categorias Iniciante, C, B, A, PRO; top 10 ganha selo permanente | Forte (Lido) | FAQ |
| Preço | Atleta grátis, mas há um plano pago anual de atleta, também vendido na loja iOS, que libera participação em torneio e H2H da temporada. O próprio site se contradiz entre as páginas (correção do `aprofundamento/`). Competições organizadas: cobrança **por participação**, sem mensalidade. Professor: grátis até 10 alunos, depois mensalidade. Clube/Arena: mensalidade que escala por quadra. Pix, cartão, boleto (valores: D2) | Forte (Lido, 25/09/2026) | Seção Planos |

**Fortes:** escopo e linguagem muito próximos do jogador competitivo (H2H, desafio, confirmação, temporada); preço público e simples.
**Fracos:** produto novo, com uso quase nulo nas lojas; pontuação própria, não federativa.

### 1.5 Torneio Já

| Campo | Achado | Força | Fonte |
| --- | --- | --- | --- |
| Proposta | Portal de inscrição em torneios de BT com conta, notificações e lista de torneios | Média (Resumo) | [torneioja.com.br](https://www.torneioja.com.br/) |
| Cobertura | Torneios concentrados em SC e PR, agenda até 2027; também etapas de ranking de arena (ex.: "Ranking de Beach Tennis Joog Arena PG") | Média (Resumo) | [Lista de torneios](https://torneioja.com.br/torneios/) |
| Preço / avaliação | Não encontrados | — | — |

### 1.6 Tornfy

| Campo | Achado | Força | Fonte |
| --- | --- | --- | --- |
| Proposta | Gestão de torneios e circuitos: inscrição, chave, programação, ranking, pagamento, galeria. Gestão pela web, app só para o atleta | Média (Resumo) | [tornfy.com](https://tornfy.com/) |
| Esportes | BT, padel, vôlei, vôlei de praia, futebol | Média (Resumo) | [tornfy.com/Beach](https://tornfy.com/Beach) |
| Uso | Circuitos regionais no Sul (ex.: Circuito Serrano de BT) | Média (Resumo) | Galerias no site |
| Reviews | Negativas (conteúdo: D2) | Fraca (Resumo) | Loja (D2) |
| Preço | Não encontrado | — | — |

### 1.7 TennisUP

| Campo | Achado | Força | Fonte |
| --- | --- | --- | --- |
| Proposta | Clube + aulas + torneios num só sistema, tênis e BT. Apps separados: TennisUP (atleta) e TennisUPManager | Média (Resumo) | [tennisup.com.br](https://www.tennisup.com.br/), loja Android |
| Features | Inscrição por categoria com pagamento, programação, resultado em tempo real, notificação; matrícula em aula; reserva de quadra, day use | Média (Resumo) | Loja iOS |

### 1.8 Apps de Super 8 e torneio relâmpago

O "Super 8" (e variantes Super 4/6/12) é o formato social mais citado do BT amador: jogadores giram de parceiro e o app sorteia jogos e quadras.

| Produto | O que faz | Observação | Força | Fonte |
| --- | --- | --- | --- | --- |
| Super Oito (superoito.app) | Cria e gere torneios, resultado ao vivo, "modo telão". Plano grátis até 1 categoria; Premium com 7 dias grátis | Preço do Premium não encontrado | Média (Resumo) | [superoito.app](https://www.superoito.app/), loja Android |
| Beach Tennis Super 8 (mesmo dev) | Sorteio de jogos e quadras, critério de vitória configurável | Recomendado pela loja iOS junto do concorrente principal (números: D2) | Média (Resumo) | Loja Android (D2) |
| Super 8 - Beach Tennis (Codecacto) | Super 4/6/8/12, dupla fixa ou rotativa, **100% offline** | — | Média (Resumo) | Loja Android |
| Super 8 Live (super8.live) | Ligas e torneios em Super 8 com ranking | — | Fraca (Resumo) | [super8.live](https://app.super8.live/leagues) |

### 1.9 Outros encontrados no BR

| Produto | Achado | Força | Fonte |
| --- | --- | --- | --- |
| **LiveBT** | Criado em 2019 para árbitros controlarem ocupação de quadra e publicarem resultados ao vivo em torneios de BT | Média (Resumo) | [Beach Tennis POA](https://www.beachtennispoa.com.br/noticias/livebt-revoluciona-a-forma-de-acompanhar-torneios-de-beach-tennis/) |
| **FullTennis** | Barragens, rankings e torneios (tênis, BT, tênis de mesa); resultado lançado pelo jogador e pelo admin | Média (Resumo) | Loja iOS |
| **torneio.app / Playinga** | Portal "com tudo sobre BT" (notícias, agenda, aulas, pontos) e software de torneio | Fraca (Resumo) | [torneio.app](https://torneio.app/en), [Playinga](https://playinga.com/pt/beach-tennis-tournament-software) |
| **PlayUse** | Marketplace de vaga em jogo: "encontre jogos de BT do seu nível", paga só a sua vaga | Média (Resumo) | [playuse.app](https://playuse.app/) |
| **DUPLA** | App para arena com pontos de fidelidade, desafios, sorteios, reserva por WhatsApp automatizado, 3 planos (preço não visível) | Média (Resumo) | [site.appdupla.com](https://site.appdupla.com/) |
| Super BT, ArenaBT, Play BT, Play da Galera, z2play | Vistos só pelo nome em buscas ou nas recomendações da loja iOS | Fraca | Loja iOS (listas de recomendação) |
| **"BT Ranking", "Beach Tennis Brasil"** | Nenhum produto com esses nomes encontrado. Os resultados apontam para CBT, CBBT (via concorrente principal) e grupos de WhatsApp | Média (ausência em várias buscas) | — |

---

## 2. Padel, tênis e pickleball (referência de rating e comunidade)

Nenhum destes cobre BT no Brasil de forma relevante. Entram como referência de **rating individual, H2H e monetização do jogador**.

### 2.1 Playtomic

| Campo | Achado | Força | Fonte |
| --- | --- | --- | --- |
| Proposta | Reserva de quadra + partidas abertas por nível + comunidade. Padel, pickleball, tênis | Forte | [playtomic.com](https://playtomic.com/pricing) |
| Escala | Escala internacional grande, com rodadas de investimento recentes e milhares de clubes (números: D2) | Forte (várias fontes; clubes Lido) | D2 |
| Nível | Escala 0–7. Partida aberta define faixa pelo 1º inscrito (−0,25 / +0,75). Partida amistosa × competitiva | Média (Resumo, help center oficial) | [Help Manager](https://helpmanager.playtomic.com/hc/en-gb/articles/20535188135185-Casual-vs-Competitive-Open-Matches) |
| Crítica ao nível | Jogadores manipulam o nível escolhendo parceiros e adversários mais fracos; outros dizem que se corrige com volume | Fraca (Resumo de post) | [No Strings Padel](https://clubhouse.nostringspadel.com/the-playtomic-app-are-player-ratings-accurate-2/) |
| Receita clube | Playtomic Manager: 4 planos mensais (Standard, Professional, Champion, Master). Torneios já no Standard; ligas só a partir do Champion (valores: D2) | Forte (Lido, versão em cache de 23/09/2026) | [playtomic.com/pricing](https://playtomic.com/pricing) |
| Receita jogador | Taxa por reserva/partida; Premium "Unlimited" elimina taxas, dá estatística avançada e alerta prioritário. Preço não encontrado (varia por loja e país) | Média (Resumo, help center) | [Player Help](https://playerhelp.playtomic.com/hc/en-gb/articles/19831696399633-Premium-Plan-Unlimited) |
| Brasil | Presente em clubes de padel de SP (ex.: rede Santo Padel usa para reserva). Sem BT | Fraca (Resumo) | [Playtomic clubes](https://playtomic.com/clubs/academia-santo-padel-nacional) |

> Nota: o `DISCOVERY.md` citou uma grade de preço do Playtomic Manager a partir de agregadores. A página oficial lida mostra outra grade (valores: D2). Pode ser mudança de preço ou diferença de região.

### 2.2 UTR Sports (Universal Tennis Rating)

| Campo | Achado | Força | Fonte |
| --- | --- | --- | --- |
| Proposta | Rating universal de tênis (e pickleball, UTR-P) + eventos verificados | Forte | [How UTR works](https://www.utrsports.net/pages/how-utr-works) |
| Duplas | Compara a média do time A com a do time B; os dois parceiros sobem ou descem **o mesmo valor**. Só conta se médias ficam a até 2,00 e parceiros a até 4,00 entre si | Média (Resumo, FAQ oficial) | [FAQ Doubles](https://support.universaltennis.com/en/support/solutions/articles/9000183289-faq-doubles-algorithm) |
| Verificado × não | Só eventos de provedores terceiros vetados contam para o "Verified UTR" | Média (Resumo) | [FAQ Algorithm](https://support.universaltennis.com/en/support/solutions/articles/9000233354-faq-universal-tennis-rating-utr-rating-algorithm) |
| Preço | Assinatura Power do jogador (mensal no anual) e planos College e High School. Inclui estatística, chatbot de insights, rankings por filtro, desconto em evento e em lojas parceiras (valores: D2) | Média (Resumo, blog oficial) | [UTR Power](https://www.utrsports.net/blogs/news/a-new-chapter-for-utr-sports-power-becomes-3-in-1-membership) |

### 2.3 DUPR (pickleball)

| Campo | Achado | Força | Fonte |
| --- | --- | --- | --- |
| Proposta | "Rating mais preciso do pickleball"; padrão da USA Pickleball | Média (Resumo) | [dupr.com](https://www.dupr.com/) |
| Escala | Base grande de jogadores com rating, autodeclarada (número: D2) | Fraca (Resumo, autodeclarado) | idem |
| Confiabilidade | **Reliability Score** de 1 a 100 (≥ 60% = confiável), por recência, adversários e tipo de jogo | Média (Resumo, blog oficial) | [DUPR Reliability](https://www.dupr.com/post/introducing-the-dupr-reliability-score) |
| Peso do resultado | Resultado autodeclarado conta, mas pesa menos que resultado de clube, liga ou torneio | Média (Resumo) | [How it works](https://www.dupr.com/how-it-works) |
| Ecossistema | Sincroniza automaticamente com PickleballBrackets / Pickleball.com (desde 29/07/2024) e CourtReserve (filtro de nível em eventos) | Forte (várias fontes) | [DUPR blog](https://www.dupr.com/post/pickleballbrackets-pickleball-com-and-pickleball-tournaments-align-with-dupr-marking-a-major-step-forward-for-the-growth-of-the-game), [CourtReserve](https://courtreserve.com/dupr-integration/) |
| Preço | DUPR+: assinatura mensal ou anual (descontos, eventos, sem anúncio) (valores: D2) | Média (Resumo) | [DUPR+](https://www.dupr.com/duprplus) |
| Crítica | Reviews mistas (conteúdo: D2) | Fraca (Resumo de reviews) | Loja (D2) |

### 2.4 ITF World Tennis Number (WTN)

| Campo | Achado | Força | Fonte |
| --- | --- | --- | --- |
| Proposta | Escala global 40 (iniciante) a 1 (elite), um número de simples e um de duplas, recalculado semanalmente | Forte (várias fontes) | [worldtennisnumber.com](https://worldtennisnumber.com/), [USTA](https://www.usta.com/en/home/play/itf-world-tennis-number.html) |
| Preço | Grátis para jogador e provedor | Média (Resumo) | [USTA FAQ](https://customercare.usta.com/hc/en-us/articles/4414716969492-ITF-World-Tennis-Number-FAQs) |
| BT | ITF tem ranking de BT só para o World Tour profissional (490+ torneios, 35 países), gerido via Tournament Software. Não há WTN de BT | Média (Resumo) | [ITF BT Tour](https://www.itftennis.com/en/tours/beach-tennis-tour/), [itfbeach.tournamentsoftware.com](https://itfbeach.tournamentsoftware.com/) |

### 2.5 Demais referências

Preços e números de usuários destas empresas: D2.

| Produto | Público | O que faz | Modelo de cobrança | Força | Fonte |
| --- | --- | --- | --- | --- | --- |
| **Rivals** (padel) | Grupo fixo de 4 | Placar ao vivo ponto a ponto, rating único do grupo, "belts", recordes, retrospectiva do ano, funciona sem sinal | Grátis para 1 grupo de até 4; Crew Pro pago (grupos maiores, estatística, modo TV). Um paga pelo grupo | Média (Resumo) | [getrivals.app](https://getrivals.app/) |
| **Match! Tennis** | Juvenil/competitivo EUA | Calendário de torneios, ordena inscritos por ranking/UTR, notas sobre adversário, "scout" de rival | Pro pago (mensal ou anual); Elite com relatórios de scout | Média (Resumo) | [Pricing](https://web.matchtennisapp.com/pricing/) |
| **PadelMix / Americano Padel Manager** | Organizador casual | Americano e Mexicano: sorteio equilibrado, folga rotativa, placar público por link | Não encontrado | Média (Resumo) | [padelmix.app](https://padelmix.app/), loja iOS |
| **Global Tennis Network** | Ligas e ladders | Ladder, liga, torneio, nível calculado pelos jogos. Criar ladder grátis numa rede oficial | Grátis para começar | Média (Resumo) | [GTN](https://www.globaltennisnetwork.com/ladder-leagues/learn-more) |
| **Tennis Round** | Jogador casual EUA | Achar parceiro por nível e cidade; Premium faz o match | Premium pago | Fraca (Resumo, Wikipedia) | [Wikipedia](https://en.wikipedia.org/wiki/Tennis_Round) |
| **MATCHi + Padelboard** | Clube (Europa) | Reserva para 6 esportes; Padelboard (adquirido em 2022) faz competições com conta única | Não encontrado | Média (Resumo) | [MATCHi](https://playmore.matchi.com/competition-padelboardbymatchi) |
| **Setteo** | Jogador + clube | "Assistente" que marca jogo, reserva e acha parceiro; Setteo Rating "universal, unissex, peer-to-peer"; token OLX. Software oficial da USPTA | Não encontrado | Fraca (Resumo) | [setteo.com](https://www.setteo.com/), [USPTA](https://www.uspta.com/USPTA/About_USPTA/Who_We_Are/News/Setteo_Named_the_Official_Club_and_Tournament_Software_Platform_of_the_USPTA.aspx) |
| **Rankedin** | Organizador + jogador padel | Torneio em 9 passos, rankings, pagamentos, notificação de torneios dos clubes favoritos | Não encontrado | Fraca (Resumo) | [rankedin.com](https://www.rankedin.com/) |
| **Tournament Software** (Visual Reality) | Federações | Chaves, resultados, rankings, perfis para BWF, ITF Masters, ITF Beach Tennis | Não encontrado | Média (Resumo) | [tournamentsoftware.com](https://www.tournamentsoftware.com/) |
| **Swiss Tennis myTennis** | Federação nacional | Perfis de jogador, ranking oficial 2×/ano, interclubes, busca de torneio | **Premium anual pago**: push de favoritos, dashboard, estatística detalhada | Média (Resumo, site oficial) | [swisstennis.ch](https://www.swisstennis.ch/was-ist-mytennis) |
| **StudyPadel** | Fã de padel pro | Estatística de **duplas** profissionais: títulos, H2H, ranking por pontos somados | Não encontrado | Média (Resumo) | [studypadel.com](https://www.studypadel.com/pairs) |
| **PickleballBrackets / Pickleball.com** | Diretor de torneio + jogador | Inscrição, chave, sync com DUPR | Jogador paga **taxa fixa + percentual** da inscrição; diretor paga por torneio; SMS cobrado por jogador | Média (Resumo, help center oficial) | [Tournament pricing](https://pickleball.com/docs/en/72000615191-tournament-pricing) |
| **CourtReserve** | Clube de tênis/pickleball | Reserva, membros, eventos com filtro DUPR | 4 planos mensais, trial de 30 dias | Média (Resumo) | [courtreserve.com/pricing](https://courtreserve.com/pricing/) |

Não encontrados como produto relevante: "Padel Manager" (só apps de Americano com nome parecido), "Tennis Channel / Global Tennis Network" como um só produto (são coisas distintas), "PadelFIP" como app de jogador (só ranking oficial FIP).

---

## 3. Reserva de quadra que também faz competição

| Produto | Mercado | Competição? | Modelo de receita | Força | Fonte |
| --- | --- | --- | --- | --- | --- |
| **Playtomic** | Global, padel | Partidas abertas por nível, torneios e ligas no Manager | Ver 2.1 | Forte | 2.1 |
| **MATCHi** | Europa | Via Padelboard | Não encontrado | Média | 2.5 |
| **AirCourts** | Portugal | Não encontrado | Não encontrado | Média (Resumo) | [aircourts.com](https://www.aircourts.com/index.php/site) |
| **Minha Quadra** | BR, poucas cidades | Não | Comissão percentual por reserva | Média (Resumo) | [minhaquadra.com.br](https://www.minhaquadra.com.br/parceiros/) |
| **Vai de Quadra** | BR | "Organize partidas e acompanhe seus jogos" | Não encontrado | Fraca (Resumo) | [vaidequadra.com.br](https://vaidequadra.com.br/en) |
| **Rezenha** | BR | Não; divide pagamento com o time, confirma CPF | Não encontrado | Fraca (Resumo) | [rezenha.com](https://rezenha.com/) |
| **Kourtify, Quadras Online, Agendei Quadras, Squadio** | BR | Squadio cita campeonatos; demais não | Não encontrado | Fraca (Resumo) | [kourtify.com](https://www.kourtify.com/), [squadio.com.br](https://www.squadio.com.br/) |
| **Partiu Play** | BR, SaaS de arena | Não encontrado | Preço dinâmico, lista de espera, mensalistas | Média (Resumo) | [partiuplay.com.br](https://www.partiuplay.com.br/) |
| **PlayUse** | BR, BT | Jogo por nível (vaga paga) | Não encontrado | Média (Resumo) | 1.9 |

"Reserve Já" e "Quadra Livre" não foram encontrados com esses nomes.

---

## 4. SaaS de gestão de arena no Brasil

Todos vendem para o dono da arena. Quase todos incluem "torneios e ranking" como módulo. O ranking fica **dentro de uma arena**. Valores de mensalidade: D2.

| Produto | Foco | Competição | Preço público | Força | Fonte |
| --- | --- | --- | --- | --- | --- |
| **Concorrente principal (gestão)** | Arena, clube, academia, liga, federação | Rankings, barragens, torneios | Não público | Forte (Lido) | 1.1 |
| **BT Match** | Arena de BT | Inscrições, grupos, jogos e ranking com página pública | Planos "Torneios" e "Arena Completa", 15 dias grátis; valor não encontrado. **Em 25/09/2026 o domínio retornou página 404 da hospedagem** | Média para features (Resumo); Forte para o 404 (Lido) | [btmatch.com.br](https://btmatch.com.br/) |
| **Arena Online** | Arenas menores | Torneios e rankings | Sim, mensalidade com preço de lançamento | Fraca (Resumo, fonte única) | [arenaonline.app.br](https://arenaonline.app.br/) |
| **Arena Manager** | White-label multiesporte | Não destacado | Mensalidade fixa, 0% sobre mensalidade dos alunos, Pix | Média (Resumo) | [arenamanager.com.br](https://arenamanager.com.br/) |
| **Arena Manager Pro** | BT, futevôlei, tênis | Rankings e torneios | Não encontrado | Fraca (Resumo) | [arenamanagerpro.com](https://arenamanagerpro.com/) |
| **Atacante.App** | Multiquadra | Não destacado | Sim, mensalidade sem adesão | Média (Resumo) | [atacante.app](https://atacante.app/sistema-para-beach-tennis/) |
| **TPC Matchpoint** | Clubes (origem Espanha) | Ranking por categoria; arenas publicam regulamento de ranking de desafio no app (ex.: Aloha) | Não encontrado. Cada arena tem **app próprio** nas lojas (white-label) | Média (Resumo) | [tpcmatchpoint.com](https://tpcmatchpoint.com/pt-br/index.html), [Regulamento Aloha](https://app-alohabeachsportsarena-br.matchpoint.com.es/files.ashx?id=63c6e88bc32f0963726555a01b3efe4b&AspxAutoDetectCookieSupport=1) |
| **DUPLA** | Arena | Desafios, sorteios, pontos de fidelidade | 3 pacotes, valor não visível | Média (Resumo) | 1.9 |
| **Ranketes Arena** | Clube, arena, CT, condomínio | Ranking interno, torneios, mini-site | Sim, mensalidade que escala por quadra | Forte (Lido) | 1.4 |
| ArenaAi, ArenaTech, Effect Sports, Areio, Sistema de Agenda, Tecnofit, ABC Evo (W12) | Arena / academia | Majoritariamente agenda e financeiro | Não verificado | Fraca (Resumo) | [ArenaAi](https://arenai.com.br/), [Tecnofit](https://www.tecnofit.com.br/blog/app-beach-tennis/) |

"Nextfit" não apareceu associado a BT nas buscas.

---

## 5. Soluções informais

| Canal | Como é usado | Evidência | Força | Fonte |
| --- | --- | --- | --- | --- |
| **Grupos de WhatsApp** | Aviso de desafio, marcação de data, regras de ranking de arena. Regulamentos citam o grupo como canal oficial | Regulamento Aloha: instruções de desafio "no grupo de WhatsApp"; Nômades BT usa template de desafio; diretórios públicos listam grupos "Beach Tennis Brasil", "Beach tennis BR" | Média | [Regulamento Aloha](https://app-alohabeachsportsarena-br.matchpoint.com.es/files.ashx?id=63c6e88bc32f0963726555a01b3efe4b&AspxAutoDetectCookieSupport=1), [Nômades](https://nomadesbt.com.br/ranking-regulamento/), [gruposwhats.app](https://gruposwhats.app/group/306286) |
| **WhatsApp integrado a apps** | Meu Ranking exibe o link do grupo do torneio após a inscrição; DUPLA automatiza reserva via WhatsApp | Histórico de versões e sites | Forte (Meu Ranking, Lido); Média (DUPLA) | 1.3, 1.9 |
| **Instagram de arenas e organizadores** | Divulgação de torneio por perfis regionais de organizadores (perfis: D2) | Perfis encontrados em busca | Fraca (Resumo) | D2 |
| **Planilhas** | Chaveamento e controle de Super 8, "Rei da Quadra", categoria mista. Há mercado de planilhas prontas (eplanilhas, Hotmart) e pedidos de freela para montar uma | Vários produtos à venda | Média | [eplanilhas](https://www.eplanilhas.com.br/planilha-de-torneio-de-beach-tennis-categoria-mista/), [Hotmart](https://hotmart.com/pt-br/marketplace/produtos/planilha-de-controle-de-torneio-de-beach-tenis-formato-rei-da-quadra/E95336494C), [99freelas](https://www.99freelas.com.br/project/planilha-excel-para-jogos-de-beach-tennis-551125) |
| **Sympla** | Inscrição paga de torneio, com valor por número de categorias. Ex.: Open Med BT (Vila Velha) (valores: D2) | Página do evento | Média (Resumo) | [Sympla evento](https://www.sympla.com.br/evento/open-med-beach-tennis/2941985) |
| Taxa Sympla | Taxa de serviço percentual (repassável ao comprador) + taxa de processamento (não repassável), com mínimo por ingresso (valores: D2) | Help center oficial | Média (Resumo) | [Sympla taxas](https://ajuda.sympla.com.br/hc/pt-br/articles/204767415-Qual-o-custo-para-utilizar-a-Sympla) |
| **Google Forms** | Não encontrado caso concreto de BT nesta pesquisa | — | Fraca | — |

---

## 6. Tabela-resumo comparativa

"—" = não encontrado. Valores de preço e notas de loja: D2.

| Produto | Tipo | Público pagante | Cobre BT? | Rating/ranking do jogador | H2H | Confirmação de resultado pelo adversário | Preço público |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Concorrente principal | Ranking + torneio + gestão | Organizador/arena | Sim (CBBT) | Ranking por competição | Sim | Em rankings configurados (ver `DISCOVERY.md`) | Não |
| Tênis Integrado | Federativo | Federação (atleta via filiação) | Sim (CBT) | Ranking oficial | — | — | Taxas federativas |
| Meu Ranking (RDT) | Ranking contínuo + torneio | Organizador | Sim | Ranking por rodada | Sim | — | Não |
| Ranketes | Ranking aberto + torneio + gestão | Competição por participação; professor; arena | Sim | Pontos por temporada | Sim, da temporada | Sim | Sim |
| Torneio Já | Inscrição | Organizador | Sim | Etapas de ranking | — | — | Não |
| Tornfy | Torneio/circuito | Organizador | Sim | Ranking de circuito | — | — | Não |
| TennisUP | Clube + torneio | Clube | Sim | — | — | — | Não |
| Super Oito e similares | Torneio relâmpago | Organizador | Sim | Classificação do evento | — | — | Freemium |
| Playtomic | Reserva + nível + comunidade | Clube + jogador (Premium) | Não | Nível 0–7 | — | — | Sim (clube) |
| UTR | Rating | Jogador (Power) | Não | Rating universal | Sim | Eventos verificados | Sim |
| DUPR | Rating | Jogador (DUPR+) | Não | Rating + confiabilidade | — | Peso menor p/ autodeclarado | Sim |
| ITF WTN | Rating federativo | Ninguém | Não | 40–1 | — | Eventos oficiais | Grátis |
| Rivals | Grupo fixo | Jogador (Crew Pro) | Não | Rating do grupo | Implícito | Placar ao vivo | Freemium |
| Match! Tennis | Scout de adversário | Jogador | Não | Usa UTR | Scout | — | Sim |
| Swiss myTennis | Federativo | Jogador (Premium) | Não | Ranking oficial | — | — | Sim |
| PickleballBrackets | Inscrição + chave | Jogador (taxa) + diretor | Não | Via DUPR | — | — | Sim |
| BT Match, Arena Online, Atacante, Arena Manager, TPC Matchpoint | SaaS de arena | Arena | Sim | Ranking interno | — | — | Parcial |
| WhatsApp + planilha + Sympla | Informal | Organizador (taxa do Sympla) | Sim | Manual | Não | Não | Grátis / taxa percentual |

---

## 7. Padrões observados

Descritivo. Sem recomendação.

### 7.1 Table stakes (quase todos têm)

| Padrão | Quem tem | Força |
| --- | --- | --- |
| **Inscrição em torneio com pagamento online** (Pix, cartão, boleto) | Concorrente principal, Tênis Integrado, Meu Ranking, Tornfy, TennisUP, Ranketes, Torneio Já, Sympla | Forte |
| **Chave e programação automáticas** | Todos os apps de torneio, inclusive os de Super 8 gratuitos | Forte |
| **Ranking por competição** (da arena, da liga, do circuito) | Todos os BR | Forte |
| **Histórico de jogos e estatística básica** (V/D) | Concorrente principal, Tênis Integrado, Meu Ranking, Ranketes | Forte |
| **H2H entre jogadores** | Concorrente principal, Meu Ranking, Ranketes; fora do BT, UTR, Match! Tennis, StudyPadel | Forte |
| **Dois apps ou dois modos: organizador × jogador** | Meu Ranking, TennisUP, Tornfy (gestão web), concorrente principal (perfil de gestão) | Forte |
| **Jogador não paga para usar o app** | Todos os BR; o jogador paga inscrição e filiação ao organizador | Forte |
| **Multiesporte** (tênis + BT, muitas vezes padel e pickleball) | Concorrente principal, Tênis Integrado (3 apps), Meu Ranking (9 esportes), Tornfy, Ranketes | Forte |

### 7.2 Lacunas (ninguém faz bem, pela evidência disponível)

| Lacuna | Evidência | Força |
| --- | --- | --- |
| **Avaliação de loja dos apps de ranking BR é baixa**, exceto um | Na loja iOS, o concorrente principal e o Tênis Integrado são mal avaliados, e o Meu Ranking bem avaliado (todos lidos). Na loja Android a distância é menor (notas: D2). As queixas são de sessão, notificação, lentidão, conta que não exclui, e não de feature ausente | Forte |
| **Programação e notificação confiáveis no dia do torneio** | Review de app federativo relata W.O. num Brasileiro por programação que não apareceu (D2); reviews do concorrente principal relatam torneio perdido por notificação que não chegou (D1); LiveBT existe desde 2019 para esse mesmo problema; organizadores empurram o jogador para o grupo de WhatsApp | Forte |
| **Resultado depende do organizador lançar** | Reviews do concorrente principal: jogos pendentes por meses (D1). Ranketes, Playtomic (24h) e o concorrente principal em ranking configurado (24h) validam pelo adversário, e nenhum arbitra a recusa (correção do `aprofundamento/`) | Média |
| **Não existe rating individual de BT que atravesse arenas e federações** | UTR, DUPR, WTN e Playtomic não cobrem BT. No Brasil, cada arena, circuito, CBT e CBBT tem seu ranking. Ranketes propõe pontos próprios, mas é novo | Forte (ausência confirmada em várias buscas) |
| **Rating de duplas com parceiro variável é problema não resolvido nem fora do BT** | UTR aplica o mesmo delta aos dois; DUPR usa confiabilidade e peso por origem; Playtomic é criticado por ser manipulável pela escolha de parceiro | Média |
| **Integridade de identidade** (perfil único, categoria verdadeira) | App federativo prende o CPF numa conta cancelada (D2); reclamação pública contra o concorrente principal sobre sandbagging (evidência: documento D1 ("Evidência: voz do usuário e reclamações"), projeto Discovery e estratégia no Linear; ver `DISCOVERY.md`); DUPR e UTR separam resultado verificado de autodeclarado, os BR não | Média |
| **Marcação do jogo continua no WhatsApp** | Regulamentos de arena citam o grupo; Meu Ranking passou a exibir o link do grupo em vez de substituí-lo. Só Ranketes declara desafio com data e lembrete dentro do app | Média |
| **Descoberta de torneio por nível e região num lugar só** | Pelo menos 8 plataformas de inscrição BR mais Sympla e Instagram. Nenhum agregador encontrado além de portais regionais (Torneio Já no Sul, torneio.app) | Média |
| **Monetização direta do jogador no BT** | Fora do BT existe (UTR, DUPR, Match! Tennis, myTennis, Playtomic Premium; valores: D2). No BT brasileiro não foi encontrada assinatura de jogador; a monetização é por inscrição, filiação e SaaS | Média |

### 7.3 Outros padrões

| Padrão | Evidência | Força |
| --- | --- | --- |
| O concorrente principal está em transição | O concorrente principal lançou v10 e v11 em ago/2026 com nova identidade e "nova fase"; Tênis Integrado lançou ~25 versões em 12 meses; Meu Ranking reescreveu o app (v16, set/2025) | Forte (Lido) |
| Entrantes novos copiam o vocabulário do jogador competitivo | Ranketes (2026): temporada, H2H da temporada, Finals, desafio com data, selo de top 10 | Forte (Lido) |
| O preço do SaaS de arena BR converge para uma faixa mensal estreita | Arena Online, Atacante e Ranketes têm mensalidades próximas (valores: D2) | Média (2 de 3 por resumo) |
| Players de reserva cobram por transação do jogador | Minha Quadra (comissão por reserva); Playtomic (taxa por reserva); PickleballBrackets (taxa fixa + percentual) | Média |
| White-label por arena fragmenta a conta do jogador | TPC Matchpoint tem um app por arena nas lojas (Aloha, Indoor Beach Sports, Padel Beach…); Arena Manager é white-label | Média |

---

## 8. Identificadores de loja

A tabela de identificadores de loja (pacote Android e id iOS de cada produto, para coleta de reviews) saiu do repo: evidência: documento D2 ("Evidência: concorrentes (preços, números, ids de loja)"), projeto Discovery e estratégia no Linear.
