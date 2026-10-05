# RATING.md

Aprofundamento de pesquisa de mesa sobre sistemas de nível e rating (DUPR, UTR, Playtomic, WTN, Elo/Glicko-2/TrueSkill) e rankings por pontos do Beach Tennis.

Pesquisa feita em 25/09/2026.

> **Sem decisões de produto.** Este documento descreve o que existe e o que os jogadores relatam. Não recomenda caminho.

**Como ler.**
- **Lido** = página aberta na íntegra via WebFetch. **Resumo** = visto só no snippet ou resumo da busca.
- Na primeira passada, **nenhuma página pôde ser lida na íntegra**: o proxy bloqueou todos os domínios tentados (ver "Nota de método"). Depois, **4 fontes centrais foram lidas na íntegra via Firecrawl** (help center do DUPR, FAQ de duplas do UTR, help center da Playtomic e a página da CBBT no incumbente). As linhas confirmadas por essa leitura estão marcadas **Lido**. As demais seguem **Resumo**; onde o resumo vem de help center ou documento oficial, isso está indicado.
- **Força:** **Forte** = várias fontes independentes concordam e pelo menos uma é doc oficial. **Média** = uma fonte específica verificável, ou várias concordantes só por resumo. **Fraca** = opinião, fonte única não oficial ou inferência.
- Datas: quando a fonte não traz data visível, vale a data de acesso (25/09/2026).

---

## 1. DUPR (pickleball)

### 1.1 Como calcula

| Achado | Força | Fonte |
| --- | --- | --- |
| Elo modificado. Usa as últimas 30 partidas elegíveis de simples ou 60 de duplas. Resumo | Média | [Pickleheads](https://www.pickleheads.com/guides/how-dupr-works) |
| A margem do placar conta: vencer por mais sobe mais, e uma derrota apertada contra time mais forte pode subir o rating. Resumo | Forte | [DUPR Blog](https://www.dupr.com/post/cracking-the-dupr-code-how-pickleballs-rating-system-shapes-the-game), [Pickleheads](https://www.pickleheads.com/guides/how-dupr-works) |
| Peso por origem do placar: placar autodeclarado pesa menos que placar enviado por organizador ou clube. Resumo | Forte | [DUPR Blog, FAQ de integridade](https://www.dupr.com/post/upa-integration-and-dupr-algorithm-faqs---all-you-need-to-know), [Pickleheads](https://www.pickleheads.com/guides/how-dupr-works) |
| Resultado de evento "Verified" pesa mais que partida comum. Resumo | Média | [SoCal Senior Pickleball News](https://socalseniorpickleballnews.com/dupr-verified-the-answer-to-ending-sandbagging-in-pickleball) |
| Reliability Score de 1 a 100, separado para simples e duplas. Aparece ao lado do rating, em fonte menor, e **não muda o rating**. Clubes usam o score como **corte de elegibilidade** para eventos, e ele define quem entra nos rankings do DUPR.com. Atualiza toda terça-feira. **Lido.** O corte de 60 aparece só no título do artigo e em fontes secundárias (Resumo) | Forte | [DUPR Help Center](https://dupr.zendesk.com/hc/en-us/articles/26872333542676-What-is-the-Reliability-Score-What-is-a-Passing-Reliability-Score), [DUPR Blog](https://www.dupr.com/post/introducing-the-dupr-reliability-score), [The Dink](https://www.thedinkpickleball.com/dupr-introduces-its-new-reliability-score/) |
| A confiabilidade depende de número de partidas, **origem da partida** e variedade de parceiros e adversários nos últimos 6 a 12 meses. Partida enviada por clube ou parceiro verificado constrói confiabilidade mais rápido que partida autodeclarada. **Lido.** "A maioria cruza para confiável entre 10 e 20 partidas": Resumo | Forte | [DUPR Help Center](https://dupr.zendesk.com/hc/en-us/articles/26872347456148-How-Should-I-Expect-My-Reliability-Score-to-Move-Over-Time-How-Can-I-Make-My-Score-More-Reliable), [ThePickleBase](https://www.thepicklebase.com/coaching-tips/dupr-reliability-score-explained) |
| Inatividade: a confiabilidade decai, devagar no começo, mais rápido perto de 60%, e volta a desacelerar abaixo de 60%. Resumo | Média | [DUPR Blog](https://www.dupr.com/post/introducing-the-dupr-reliability-score) |
| Rating provisório (com asterisco) até o jogador enfrentar gente já ranqueada, em geral 5 a 10 partidas. Resumo | Média | [Pickles NE, Q&A](https://www.picklesne.com/dupr-qa) |

### 1.2 Duplas e parceiro trocado

| Achado | Força | Fonte |
| --- | --- | --- |
| Rating é individual, mas o esperado da partida usa a **média dos dois parceiros**. Cada jogador ajusta seu rating de duplas conforme o time performou contra essa expectativa. Resumo | Forte | [Pickleheads](https://www.pickleheads.com/guides/how-dupr-works), [DUPR How it works](https://www.dupr.com/how-it-works) |
| A própria DUPR admite o limite: "The hardest part of rating doubles is that we don't have an eye on the court to see who's controlling the match." Resumo | Média | [The Dink](https://www.thedinkpickleball.com/the-toughest-problem-in-pickleball-inside-duprs-quest-for-accurate-ratings/) |

### 1.3 Anti-sandbagging

| Achado | Força | Fonte |
| --- | --- | --- |
| Tática comum: criar conta nova "NR" (sem rating) para entrar em chave mais baixa. | Média | [SoCal Senior Pickleball News](https://socalseniorpickleballnews.com/dupr-verified-the-answer-to-ending-sandbagging-in-pickleball), [Rallycard](https://rallycard.app/blog/pickleball-sandbagging-guide) |
| Programa DUPR Verified (2026): clubes verificados nos EUA; exige DUPR+ ativo e telefone verificado, um telefone por conta. Resumo | Média | [SoCal Senior Pickleball News](https://socalseniorpickleballnews.com/dupr-verified-the-answer-to-ending-sandbagging-in-pickleball), [Pickleball Nation](https://pickleballnation.com/blogs/pickleball-nation/dupr-verified-the-end-of-sandbagging) |
| Eventos e jogadores sujeitos a revisão de um "Fairplay Committee". Resumo | Fraca | [PickleballHQ](https://pickleballhq.co/dupr-verified-ending-pickleballs-sandbagging-crisis/) |
| Torneios sancionados exigem DUPR verificado para inscrever e montar chaves; parceria com USA Pickleball faz do DUPR o rating exclusivo dos eventos da entidade. Resumo | Média | [Pickleball US](https://pickleballus.org/players/tips/dupr-rating/), [US Open Pickleball FAQ](https://www.usopenpickleball.com/usop-registration/usop-dupr-faq) |

### 1.4 Percepção do jogador

| Achado | Força | Fonte |
| --- | --- | --- |
| Reclamação recorrente: rating cai depois de vitória, ou depois de partida apertada contra time mais forte. Há artigo inteiro com o título "Why They Drop After Wins". Resumo | Média | [Big Dill Pickleball](https://www.bigdillpickleballcompany.com/blogs/news/the-drawbacks-of-dupr-in-pickleball), [Pickletip](https://www.pickletip.com/dupr-ratings/) |
| Ratings antigos "parados" continuam valendo e distorcem o sistema; quem joga pouco sente que o número não o representa. Resumo | Média | [Big Dill Pickleball](https://www.bigdillpickleballcompany.com/blogs/news/the-drawbacks-of-dupr-in-pickleball) |
| Pesquisa direcionada a Reddit sobre "caiu depois de ganhar com parceiro" não retornou thread específica nesta rodada. A pesquisa anterior já registra 15 threads com esse tema. | Fraca | Busca desta rodada, sem resultado útil |

### 1.5 Monetização

| Achado | Força | Fonte |
| --- | --- | --- |
| DUPR+ é a assinatura paga do jogador (preço: evidência: documento D7 ("Referências internacionais: números de crescimento e monetização"), projeto Discovery e estratégia no Linear). Resumo | Média | [DUPR+](https://www.dupr.com/duprplus) |
| O selo "Verified" depende de DUPR+ ativo: a verificação anti-sandbagging é atrelada à assinatura. Resumo | Média | [SoCal Senior Pickleball News](https://socalseniorpickleballnews.com/dupr-verified-the-answer-to-ending-sandbagging-in-pickleball) |

---

## 2. UTR (tênis) e UTR-P (pickleball)

### 2.1 Como calcula

| Achado | Força | Fonte |
| --- | --- | --- |
| UTR = média ponderada de até 30 "match ratings" mais recentes, só dos últimos 12 meses. Resumo | Forte | [UTR Help Center](https://support.universaltennis.com/en/support/solutions/articles/9000151894-how-is-the-universal-tennis-rating-utr-rating-calculated-), [UTR How it works](https://www.utrsports.net/pages/how-utr-works) |
| O match rating compara o % de games vencidos com o % esperado pela diferença de rating. Não importa só quem ganhou. Resumo | Forte | [UTR Help Center, resumo do algoritmo](https://support.universaltennis.com/en/support/solutions/articles/9000151830-understanding-the-algorithm-complete-summary), [UTR FAQ](https://blog.universaltennis.com/understanding-utr-frequently-asked-questions/) |
| Pesos: confiabilidade do adversário (quem joga muito pesa mais), decaimento no tempo (partida velha pesa menos) e formato da partida. Resumo | Forte | [UTR FAQ](https://blog.universaltennis.com/understanding-utr-frequently-asked-questions/), [UTR Help Center](https://support.universaltennis.com/en/support/solutions/articles/9000233354-faq-utr-rating-algorithm) |
| Estudo com 1.532 partidas do USTA Junior Nationals 2022: UTR acertou 73,9% e WTN 70,4%; diferença não estatisticamente significativa. Resumo | Média | [The Sport Journal, Mayew & Mayew, 2023](https://thesportjournal.org/article/which-global-tennis-rating-better-measures-player-skill-evidence-from-the-2022-usta-junior-national-championships/) |

### 2.2 Duplas e parceiro trocado

| Achado | Força | Fonte |
| --- | --- | --- |
| UTR de duplas é separado do de simples (mas um bom histórico de simples "pode influenciar" o de duplas). O algoritmo compara a média do time A com a média do time B. Os dois parceiros sobem ou descem **o mesmo valor**. Dupla mista entra no mesmo rating de duplas; o UTR ignora gênero. **Lido** | Forte | [UTR Help Center, FAQ Doubles](https://support.universaltennis.com/en/support/solutions/articles/9000183289-faq-doubles-algorithm), [Tennis Australia](https://www.tennis.com.au/compete/tennis-ratings-utr/how-utr-works) |
| Filtros de elegibilidade: a partida só conta se as médias dos times estão a até 2,00 de distância e os parceiros a até 4,00 um do outro. Fora do corte de 2,00, só conta se o time mais fraco vencer. **Lido** | Forte | [UTR Help Center, FAQ Doubles](https://support.universaltennis.com/en/support/solutions/articles/9000183289-faq-doubles-algorithm) |
| UTR-P trata cada jogo de duplas como dois jogos individuais, o que "permite conexão entre gêneros". Usa até 60 partidas. Provisório por questionário (P1–P5), projetado após 1 partida, decimal confiável (1,0–10,0) após 7. Resumo | Média | [UTR Sports, How UTR-P works](https://www.utrsports.net/pages/how-utr-p-works), [UTR Help Center, UTR-P](https://support.universaltennis.com/en/support/solutions/articles/9000234183-understanding-the-pickleball-algorithm-utr-p-) |

### 2.3 Anti-sandbagging

| Achado | Força | Fonte |
| --- | --- | --- |
| "Verified UTR" conta só resultados de eventos de terceiros verificados. UTR-P separa placar autodeclarado de placar verificado, em ratings distintos. Resumo | Forte | [UTR, Sandbagging](https://www.utrsports.net/blogs/news/what-is-sandbagging-utr-prevents-sandbagging), [UTR, UTR-P vs DUPR](https://www.utrsports.net/blogs/news/pickleball-rating-systems-utr-dupr-verification), [Pickleball Union](https://pickleballunion.com/how-utr-p-is-winning-the-battle-against-sandbaggers/) |
| Argumento da UTR: jogadores não conseguem "postar placar entre si" para inflar ou derrubar rating verificado. Resumo | Média | [UTR, UTR-P vs DUPR](https://www.utrsports.net/blogs/news/pickleball-rating-systems-utr-dupr-verification) |

### 2.4 Percepção do jogador

| Achado | Força | Fonte |
| --- | --- | --- |
| Em juvenis de alto nível, o UTR perde significado e há discrepâncias estranhas; programas usam o número como atalho para agrupar crianças, e os pais não o questionam. Resumo | Fraca | [Junior Tennis USA (Substack)](https://juniortennisusa.substack.com/p/utr-can-be-right-but-its-wrong-for) |
| Não achei nesta rodada reclamação específica sobre UTR de duplas. | Fraca | Busca desta rodada |

### 2.5 Monetização

| Achado | Força | Fonte |
| --- | --- | --- |
| Power: assinatura paga, com desconto em cada evento verificado e isenção da "Verified Fee" (preços: D7). Em maio/2026 virou pacote "3 em 1" (Play, Stay, Style) com parceria Fabletics nos EUA. Resumo | Média | [UTR, Power 3-in-1](https://www.utrsports.net/blogs/news/a-new-chapter-for-utr-sports-power-becomes-3-in-1-membership), [UTR Power](https://www.utrsports.net/pages/power-membership) |
| Preço por país no plano anual (Colômbia, Canadá, Tchéquia, China e outros), valores não visíveis no resumo. Resumo | Média | [UTR Press](https://www.utrsports.net/blogs/press/utr-sports-expands-global-access-with-new-international-pricing) |
| Modelo: a verificação é cobrada por evento ("Verified Fee"), e a assinatura isenta essa taxa. Resumo | Média | [UTR, Verified events](https://www.utrsports.net/blogs/news/utr-verified-events-play-tennis-tournaments-save-money) |

---

## 3. Nível Playtomic (padel, 0–7)

### 3.1 Como calcula

| Achado | Força | Fonte |
| --- | --- | --- |
| Nível inicial por **questionário único** (só pode ser feito uma vez). Depois, a cada partida competitiva, o nível muda por resultado, nível dos adversários, **nível do parceiro** e confiabilidade do próprio jogador. Empate também mexe no nível: o time de nível somado maior perde pontos. **Lido** | Forte | [Playtomic Help](https://playerhelp.playtomic.com/hc/en-gb/articles/43310980754193-How-the-Playtomic-level-system-works), [Playtomic Manager](https://helpmanager.playtomic.com/hc/en-gb/articles/20563641264145-The-Playtomic-Levels-Algorithm) |
| Confiabilidade alta = variação pequena; baixa = variação rápida. Nem o jogador nem o suporte podem ajustar a confiabilidade à mão. Perder para nível menor derruba mais; ganhar de quem o sistema já esperava vencer sobe pouco. **Lido** | Forte |
| O nível **não muda** se o resultado for **rejeitado por um ou mais jogadores**, se a partida for casual ou se o placar for inválido (regras de set válido: 6-4 vale, 6-5 não). Ou seja, o veto do adversário (voz ampliada, seção 1; evidência: documento D1 ("Evidência: voz do usuário e reclamações"), projeto Discovery e estratégia no Linear) anula o efeito da partida. **Lido** | Forte |
| Nos comentários do próprio artigo, um jogador reclama que perdeu 0,4 por derrota e ganhou 0,25 a 0,3 por vitória; o suporte responde com a regra de expectativa. **Lido** (comentário público, sem identificar autor) | Fraca | [Playtomic Help](https://playerhelp.playtomic.com/hc/en-gb/articles/43310980754193-How-the-Playtomic-level-system-works), [Padel Tonic](https://padel.tennistonic.com/padel-news/6658/understanding-the-reliability-factor-in-playtomic-app/) |
| Partida amistosa não mexe no nível, mesmo com placar lançado. Partida competitiva sempre mexe. Resumo | Forte | [Playtomic Help](https://playerhelp.playtomic.com/hc/en-gb/articles/19831974052625-Friendly-vs-Competitive-Public-Matches), [Playtomic Manager](https://helpmanager.playtomic.com/hc/en-gb/articles/20535188135185-Friendly-vs-Competitive-Open-Matches) |
| Faixa da partida aberta competitiva: −0,25 / +0,75 a partir do primeiro jogador. Quem está fora pode pedir para entrar, e os inscritos aprovam. Resumo | Forte | [Playtomic Manager](https://helpmanager.playtomic.com/hc/en-gb/articles/20535188135185-Friendly-vs-Competitive-Open-Matches) |
| Avaliação entre pares: após a partida, cada um marca se o nível do outro é "menor", "correto" ou "maior". Com 20 pessoas marcando "maior", o jogador recebe oferta de subir 0,5. Resumo | Média | [Proper Padel, 12/09/2025](https://properpadel.uk/2025/09/12/is-playtomics-rating-system-flawed/) |

### 3.2 Duplas e parceiro trocado

| Achado | Força | Fonte |
| --- | --- | --- |
| Rating individual a partir de jogo de dupla, com média do time. Parceiros podem variar diferente na mesma partida porque cada um tem sua confiabilidade. A Playtomic trata isso como "normal" no help center. Resumo | Forte | [Playtomic Help](https://playerhelp.playtomic.com/hc/en-gb/articles/43310980754193-How-the-Playtomic-level-system-works), [Playtomic Help, ups & downs](https://playerhelp.playtomic.com/hc/en-gb/articles/19831827459345-The-Playtomic-Levels-ups-downs) |

### 3.3 Anti-manipulação

| Achado | Força | Fonte |
| --- | --- | --- |
| Clubes certificados ("Leveling Clubs") com treinador certificado fazem sessão de nivelamento: uma partida e algumas tarefas. O nível sai com confiabilidade fixada em 50% (média). Resumo | Forte | [Playtomic Help, Leveling Clubs](https://playerhelp.playtomic.com/hc/en-gb/articles/19832024478097-Playtomic-Leveling-Clubs), [Playtomic, apresentação para treinadores (PDF)](https://product.playtomic.com/hubfs/8258038/ENG%20-%20Leveling%20project%20-%20Coaches%20presentation-1.pdf?hsLang=en-us) |
| Efeito colateral: com 50%, uma derrota derruba o nível "consideravelmente mais" que com 70%. Resumo | Média | [Padel Tonic](https://padel.tennistonic.com/padel-news/6658/understanding-the-reliability-factor-in-playtomic-app/) |
| Barreiras estruturais: amistoso não conta; competitivo tem faixa de nível. Resumo | Forte | Fontes de 3.1 |
| **Brecha oficial:** o jogador pode **baixar o próprio nível manualmente** pelo app. A outra via de ajuste é a sessão de nivelamento em clube certificado. **Lido** | Forte | [Playtomic Help](https://playerhelp.playtomic.com/hc/en-gb/articles/43310980754193-How-the-Playtomic-level-system-works) |

### 3.4 Percepção do jogador

| Achado | Força | Fonte |
| --- | --- | --- |
| Artigo diz que os jogadores começam a ver o sistema de nível da Playtomic como falho ou pouco confiável. Queixa central: o nível cai por erro do parceiro, sem olhar desempenho individual. Resumo | Média | [Proper Padel, 12/09/2025](https://properpadel.uk/2025/09/12/is-playtomics-rating-system-flawed/) |
| No r/padel, relatos de que o sistema é viciado e de que o nível não bate com a quadra (citado pelo artigo acima). Resumo | Fraca | [Proper Padel](https://properpadel.uk/2025/09/12/is-playtomics-rating-system-flawed/) |
| Outro artigo pergunta se o nível é "referência real" ou "confiabilidade a relativizar". Resumo | Média | [Actu-Padel](https://actu-padel.com/en/playtomic-and-its-ranking-a-real-reference-for-your-matches-or-a-reliability-to-be-relativized/), [No Strings Padel](https://clubhouse.nostringspadel.com/the-playtomic-app-are-player-ratings-accurate-2/) |
| Avaliação pública da Playtomic muito baixa; queixas sobre um suporte que decide só pelos registros do sistema. Mistura reserva, pagamento e nível (nota e fonte: D7). Resumo | Média | D7 |

### 3.5 Monetização

| Achado | Força | Fonte |
| --- | --- | --- |
| Premium do jogador: zero taxa de reserva/partida, estatísticas detalhadas e comparação com jogadores do mesmo nível, alertas de vaga. **Preço ao jogador não encontrado** nos resumos (é vendido pelas lojas de app). Resumo | Média | [Playtomic Manager, Premium Plan](https://helpmanager.playtomic.com/hc/en-gb/articles/20534670300561-Playtomic-Premium-Plan-for-players), [Playtomic Help](https://playerhelp.playtomic.com/hc/en-gb/articles/19831696399633-Premium-Plan-Unlimited) |
| Os valores mensais que aparecem num agregador parecem ser do software de gestão para clubes, não do Premium do jogador. Não usar como preço de jogador (valores: D7). Resumo | Fraca | D7 |
| Nível entra na monetização por dois lados: comparação por nível no Premium, e a sessão de nivelamento como serviço do clube certificado. Inferência | Fraca | Fontes de 3.3 e 3.5 |

---

## 4. WTN — World Tennis Number (ITF)

| Achado | Força | Fonte |
| --- | --- | --- |
| Escala 40 (iniciante) a 1 (profissional). Resumo | Forte | [WTN, How it works](https://worldtennisnumber.com/eng/how-wtn-works), [USTA](https://www.usta.com/en/home/play/itf-world-tennis-number.html) |
| Simples e duplas usam algoritmos totalmente separados; um não afeta o outro. Em duplas, o adversário é um "notional opponent" derivado dos outros três jogadores. Resumo | Média | [WTN FAQ](https://worldtennisnumber.com/eng/faq) |
| Melhoria recente: além do resultado do set, o placar em games conta (6-4 e 7-5 tratados diferente de 6-0). O set continua sendo o componente dominante. Resumo | Forte | [WTN, Enhancement](https://worldtennisnumber.com/eng/news/enhancement-to-the-itf-world-tennis-number-calculation), [USTA Help](https://customercare.usta.com/hc/en-us/articles/51405638974484-Enhancements-to-the-World-Tennis-Number-WTN-Algorithm) |
| "Confidence Level": sobe com mais resultados; com confiança alta, o número fica menos volátil a resultado inesperado. Resumo | Forte | [WTN FAQ](https://worldtennisnumber.com/eng/faq), [USTA FAQ](https://customercare.usta.com/hc/en-us/articles/4414716969492-ITF-World-Tennis-Number-FAQs) |
| Inatividade acima de um ano: ajuste pequeno e gradual no número de adultos, e a confiança cai. Resumo | Média | [LTA](https://www.lta.org.uk/support-centre/competing/world-tennis-number/calculation--algorithm/will-my-rating-decrease-if-i-stop-playing-for-a-while) |
| Duplas não têm "Game zONe" (a faixa de adversários sugeridos existe só em simples). Resumo | Média | [USTA FAQ](https://customercare.usta.com/hc/en-us/articles/4414716969492-ITF-World-Tennis-Number-FAQs) |
| Monetização: modelo de federação. No Reino Unido, membro LTA Advantage (Play, Play+, Compete) recebe o WTN de graça. Não achei assinatura paga do WTN. Resumo | Média | [LTA](https://www.lta.org.uk/compete/wtn-rankings/world-tennis-number/) |
| O WTN **não cobre Beach Tennis**. O BT da ITF usa ranking por pontos do World Tour. Resumo | Média | [ITF, BT rankings](https://www.itftennis.com/en/rankings/beach-tennis-tour-rankings/) |

---

## 5. Base teórica: Elo, Glicko-2, TrueSkill

| Achado | Força | Fonte |
| --- | --- | --- |
| **Elo:** um número por jogador; o ganho depende da diferença entre esperado e real. Não modela incerteza. Base declarada do DUPR e do UTR-P ("Elo modificado"). Resumo | Forte | [arXiv 1910.06081](https://arxiv.org/pdf/1910.06081), [UTR-P](https://www.utrsports.net/pages/how-utr-p-works), [Pickleheads](https://www.pickleheads.com/guides/how-dupr-works) |
| **Glicko / Glicko-2:** acrescenta Rating Deviation (RD). RD alto = rating pouco confiável, típico de novato ou inativo; jogar com frequência reduz o RD. Glicko-2 acrescenta volatilidade, para corrigir mais rápido quem oscila. Resumo | Média | [skillratings (GitHub)](https://github.com/atomflunder/skillratings), [arXiv 2008.06787](https://arxiv.org/pdf/2008.06787) |
| **TrueSkill (Microsoft Research):** habilidade como distribuição normal, μ (habilidade) e σ (incerteza). Foi feito para inferir habilidade **individual** a partir de resultado de **time**, atualizando todos os jogadores juntos. Resumo | Forte | [Microsoft Research](https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/), [arXiv 2106.11397](https://arxiv.org/pdf/2106.11397) |
| Duplas com parceiro variável em Elo: prática comum é rating do time = média dos dois (ex.: 1482 e 1308 → 1395). Permite rating individual com parceiro trocado, mas distribui crédito igual. Resumo | Média | [Elo Sports Challenge](https://elosportschallenge.wordpress.com/2017/06/09/individual-ranking-for-doubles-game/), [Tennis Abstract, Elo misto](http://www.tennisabstract.com/blog/2019/07/09/introducing-elo-ratings-for-mixed-doubles/) |
| Paralelo com os produtos: Reliability (DUPR), reliability do adversário (UTR), confiabilidade (Playtomic) e Confidence Level (WTN) cumprem o papel do RD/σ. Inferência | Fraca | Seções 1 a 4 |

**Nota sobre duplas.** Todos os sistemas vistos usam média do time (ou "adversário nocional") e dividem o resultado entre os parceiros. Nenhum observa quem fez o ponto. A DUPR diz isso abertamente (1.2). É esse desenho que gera a queixa "caí por causa do parceiro" (1.4, 3.4).

---

## 6. Rankings por pontos no Beach Tennis

### 6.1 ITF Beach Tennis World Tour

| Achado | Força | Fonte |
| --- | --- | --- |
| Ranking **individual** de duplas: soma dos 10 melhores resultados em janela móvel de 52 semanas. Duplas mistas: 6 melhores. Resumo | Forte | [ITF, Regulamento BT World Tour 2025](https://www.itftennis.com/media/13744/2025-beach-tennis-world-tour-regulations.pdf), [yoSports](https://yosports.com.br/blogs/novidades/itf-ranking-beach-tennis-2026-o-guia-completo-para-entender-e-subir-de-nivel) |
| Pontos do campeão = número da categoria: BT10 = 10, BT50 = 50, BT100 = 100, BT200 = 200, BT400 = 400. Resumo | Média | [Total Beach Tennis](https://totalbeachtennis.com.br/blogs/blog-tbt/o-que-significa-as-siglas-dos-campeonatos-itf-bt-10), [ITF, mudanças 2026](https://www.itftennis.com/media/16193/itf-beach-tennis-world-tour-summary-of-2026-regulation-changes-250326.pdf) |
| Pontos de eventos maiores que BT400 ficam ativos até a edição seguinte do mesmo evento. Só pontua quem chega a uma rodada com pontos. Resumo | Média | [ITF, mudanças 2025](https://www.itftennis.com/media/13740/itf-beach-tennis-world-tour-summary-of-2025-regulation-changes.pdf) |
| O ponto depende de **até onde se foi** na chave e do **peso do torneio**, não do placar nem da força do adversário. Inferência sobre o modelo | Média | Fontes acima |

### 6.2 CBT (Confederação Brasileira de Tênis)

| Achado | Força | Fonte |
| --- | --- | --- |
| A CBT gere o ranking nacional de BT e as categorias amadoras por letra (A, B, C, D), além de idade (Sub-10 a Sub-18, 50+, 60+) e categoria E. Resumo | Forte | [CBT, Regulamento BT 2026](https://www.cbt-tenis.com.br/beachtennis/attached/11), [CBT Ranking 2026](https://www.cbt-tenis.com.br/beachtennis/ranking) |
| Quem jogou torneio CBT numa categoria técnica não pode jogar categoria abaixo. Quem se inscreve no PRO não joga amador. Resumo | Forte | [CBT, Regulamento BT 2026 (PDF)](https://tenis-integrado-prod.s3.amazonaws.com/sync-prod/id22798/anexos/anexo_1768245583.pdf), [CBT, regulamento anterior](http://cms.cbtenis.com.br/cms/Arquivos/Download/Upload/3606.pdf) |
| Categoria Profissional prioriza o ranking ITF de BT (posições até 300). Em torneio homologado pela ITF no Brasil, vale a pontuação ITF. Quem não passa da fase de grupos ganha 1 ponto. Resumo | Média | [CBT, Regulamento BT 2026 (PDF)](https://tenis-integrado-prod.s3.amazonaws.com/sync-prod/id22798/anexos/anexo_1768245583.pdf) |
| **Promoção obrigatória** para a categoria de cima quando o atleta (a) passa por avaliação técnica do Departamento de BT da CBT ("desempenho, histórico competitivo, regularidade de resultados e demais indicadores") ou (b) termina entre os **8 primeiros** do ranking nacional da categoria no ano anterior. **Lido** | Forte | [CBT, Regulamento BT 2026 (PDF), item 9](https://tenis-integrado-prod.s3.amazonaws.com/sync-prod/id22798/anexos/anexo_1768245583.pdf) |
| Descer de categoria: só por requerimento formal **depois da virada do ano**, com decisão "discricionária", "não gerando direito adquirido". Subir por vontade própria: basta se inscrever na categoria de cima. A CBT "poderá, a qualquer tempo, promover ou rebaixar atletas" por "equilíbrio competitivo e integridade das competições". **Lido** | Forte | idem, item 9 |
| Ou seja: o anti-sandbagging da CBT é **administrativo e humano** (comissão técnica + regra de não descer), não estatístico. Não há número de nível; há uma avaliação discricionária e um corte por posição (top 8). Inferência sobre o modelo | Média | idem |
| **Homologação obrigatória:** todo torneio de BT no território nacional, "independentemente de serem organizados por promotores de eventos, clubes, federações ou quaisquer outras entidades", deve ser homologado pela CBT. Evento sem homologação é "irregular", e quem participa, organiza ou apoia fica sujeito a sanção disciplinar (CBJD). O regulamento também proíbe usar uniforme ou material de "entidades, ligas, associações ou organizações paralelas … não reconhecidas" pela CBT. **Lido** | Forte | idem, itens 1 e 19 |
| O Finals da CBT é opcional: a CBT "poderá, a seu critério", encerrar o circuito com um Finals, com critérios "a serem oportunamente divulgados". **Lido** | Forte | idem, item 1 |

### 6.3 CBBT e rankings de arena

| Achado | Força | Fonte |
| --- | --- | --- |
| Existe a CBBT, Confederação Brasileira de Beach Tennis, reconhecida pela Secretaria Especial do Esporte em 12/05/2020. Ou seja, **duas confederações** disputam o BT no Brasil. Resumo. O regulamento da CBT 2026 (lido, ver 6.2) trata qualquer torneio não homologado por ela como irregular e veda material de "organizações paralelas": a disputa é **aberta e com sanção prevista** | Média (existência da CBBT); Forte (a regra da CBT) | [CBBT](https://cbbtennis.com.br/), [FSMBT](https://fsmbt.com/Publicacao.aspx?id=138543) |
| A CBBT roda no próprio incumbente, com uma base grande de jogadores, dezenas de rankings em andamento e centenas de torneios (contadores: evidência: documento D4 ("Evidência: mercado e contadores do incumbente"), projeto Discovery e estratégia no Linear). Os torneios têm **dupla chancela** (ex.: "CBBT 250 / FGBT500", "CBBT100 / FPEBT400"): o mesmo evento pontua em duas tabelas, a nacional e a estadual. **Lido** | Forte | D4 |
| Outro sistema grande: Ranking Beach Tennis (derivado do rankingdetenis.com, desde 2016), app MeuRanking. Resumo | Média | [Ranking Beach Tennis](https://www.rankingbeachtennis.com/) |
| Exemplo de ranking de arena (AVB, On The Beach): pontuação **individual** mesmo em duplas; selos OTB100, OTB250; categoria B vale 90%, C 80%, D 70%. Campeão de C num OTB250 faz 200, vice 160. Pontos cumulativos com bônus por vitória. Resumo | Média | [On The Beach, Regulamento AVB](https://onthebeach.com.br/regulamento-do-ranking-de-beach-tennis/) |
| Regulamentos de torneio preveem desclassificação sem reembolso para quem se inscreve abaixo do nível técnico. Resumo | Média | [Pró Spin](https://blog.prospin.com.br/torneios/categorias-do-beach-tennis/), [Beach Tennis BRA](https://beachtennisbra.com.br/dicas/quais-sao-as-categorias-do-beach-tennis-disputadas-nos-torneios-oficiais/) |
| Na prática, a categoria é definida pelo professor e por comparação social. Coluna recomenda não usar "a sua bolha" local como parâmetro e jogar fora do clube e do estado. Resumo | Fraca | [Boom na Mídia, "O dilema das categorias no Beach Tennis"](https://boomnamidia.com.br/colunas/o-dilema-das-categorias-no-beach-tennis/) |
| Monetização nos rankings de BT: filiação à federação e inscrição de torneio. Nenhuma assinatura de "nível" de BT foi encontrada. Resumo | Fraca | [CBT, regulamento (seção Filiação)](http://cms.cbtenis.com.br/cms/Arquivos/Download/Upload/3606.pdf) |

### 6.4 Percepção do jogador de BT

Nenhuma reclamação de jogador de BT sobre sistema de *rating* foi encontrada, porque não achei rating de BT em uso no Brasil. A dor visível é outra: **categoria errada** (quem joga abaixo do nível) e **categoria autodeclarada ou definida pelo professor**. As fontes são regulamentos que punem o caso (6.3) e uma coluna de opinião. Evidência **Fraca a Média**.

---

## 7. Comparativo: ranking por pontos × rating

Descritivo. "Resolve" e "dor" vêm das seções anteriores.

| Aspecto | Ranking por pontos (ITF BT, CBT, arenas) | Rating (DUPR, UTR, Playtomic, WTN) |
| --- | --- | --- |
| Pergunta que responde | Quem **acumulou mais resultado** neste circuito, nesta janela | Qual o **nível atual** do jogador, em qualquer lugar |
| Input | Fase alcançada × peso do torneio (6.1, 6.3) | Resultado, placar, força do adversário, confiabilidade (1.1, 2.1, 3.1) |
| Frequência | Premia volume: mais torneios, mais pontos (10 melhores na ITF) | Premia desempenho contra o esperado, com decaimento no tempo |
| Portabilidade | Presa ao circuito: ITF, CBT, CBBT e cada arena têm tabela própria (6.1–6.3) | Pensada para atravessar clubes e eventos (UTR, DUPR, WTN) |
| Duplas | Pontos individuais, mesmos para os dois da dupla (ITF, AVB) | Média do time; ajuste igual (UTR) ou por confiabilidade (Playtomic) |
| O que resolve | Clareza: o jogador entende de onde veio cada ponto; motiva participação | Comparar desconhecidos; montar partidas equilibradas; semear chaves |
| Anti-manipulação | Regra administrativa: proibido descer de categoria, desclassificação (6.2, 6.3) | Regra estatística e de verificação: peso menor ao autodeclarado, eventos verificados, confiabilidade (1.3, 2.3, 3.3) |
| Dor documentada | Categoria errada e autodeclarada; "bolha" local; tabelas diferentes por arena (6.3, 6.4) | "Caiu depois de ganhar"; "caí por culpa do parceiro"; número parado; opacidade (1.4, 3.4) |
| Monetização vista | Filiação e inscrição | Assinatura (DUPR+, UTR Power) e verificação como produto (1.5, 2.5) |

Observação factual: nos três sistemas pagos que exigem verificação (DUPR Verified, UTR Verified), o **selo de confiança é o que se cobra**, não o número em si.

---

## 8. Implicações para as oportunidades

Leitura por evidência. Não é recomendação.

### Oportunidade 2 — "Nível do adversário e perfil em que dá para confiar"

**Ganha força.**
- Todos os sistemas maduros convergiram para exibir **número + medida de confiança** (Reliability 1–100 com corte em 60, Confidence Level, confiabilidade Playtomic). Isso mostra que o número sozinho não é considerado confiável nem pelos donos dos sistemas (1.1, 3.1, 4). Força **Forte**.
- As mesmas empresas separaram placar autodeclarado de placar verificado, e cobram pela camada verificada (1.3, 2.3, 1.5, 2.5). Confiança é tratada como produto. Força **Média**.
- No BT brasileiro não achei rating de nível em uso; a categoria (A–D) é o proxy, definida por regra administrativa, professor ou autodeclaração (6.2–6.4). O vazio existe. Força **Média**.

**Perde força em um ponto.**
- A queixa mais repetida contra ratings é justamente em **duplas**: nenhum algoritmo vê quem ganhou o ponto, e o jogador sente que o número "mente" (1.2, 1.4, 3.4). BT é esporte de duplas. Um número de nível para BT herdaria essa dor. Força **Média**.

### Oportunidade 10 — "Um nível de BT que atravesse arenas e federações"

**Ganha força.**
- Fragmentação documentada: ITF, CBT, CBBT (duas confederações) e rankings de arena com tabelas próprias e pesos por categoria diferentes (6.1–6.3). Força **Média**.
- UTR, DUPR e WTN existem exatamente para "atravessar" clubes e eventos, e UTR-P mostra que o formato foi portado de um esporte para outro (2.2). O WTN não cobre BT (4). Força **Média**.
- O incumbente já hospeda rankings de CBBT e federações estaduais (6.3). Isso é fato; o que ele implica é pergunta aberta.

**Perde força.**
- Os sistemas que atravessam fronteiras cresceram com **patrocínio institucional**: DUPR como rating exclusivo da USA Pickleball, UTR-P como parceiro exclusivo da APP, WTN via ITF e federações nacionais (1.3, 2.2, 4). No BT brasileiro, o poder de definir categoria está nas confederações, e a CBT usa regra administrativa (proibição de descer), não rating. Força **Média**.
- Rating universal gera disputa sobre quem controla os dados e a verificação. As soluções vistas (clubes verificados, eventos de terceiros, treinador certificado) dependem de parceiros físicos (1.3, 2.3, 3.3). Força **Média**.

---

## 9. Perguntas abertas

Só o que o dono do produto responde.

1. No BT, o que o jogador competitivo quer do "nível do adversário": um número, a categoria (A–D), ou o histórico cru (H2H, resultados)?
2. O produto quer ser neutro entre CBT, CBBT e arenas, ou se alinhar a uma delas? Há relação comercial ou institucional com alguma?
3. Um nível próprio do produto entraria em conflito com a categoria oficial de alguma confederação ou regulamento de torneio?
4. O quanto importa, para o jogador de BT, que o nível não caia por culpa do parceiro? É dor vista em campo ou só nos fóruns de outros esportes?
5. Confiança/verificação seria algo que o produto oferece de graça, ou algo que se cobra (como DUPR e UTR fazem)?
6. Os organizadores de ranking de arena que já usam o incumbente aceitariam um número que não depende da tabela de pontos deles?

---

## Nota de método

- **WebSearch:** 34 de 35 permitidas.
- **Firecrawl (coordenador, depois da primeira passada):** 5 leituras na íntegra (help center do DUPR, FAQ de duplas do UTR, help center da Playtomic, página da CBBT no incumbente, regulamento de BT 2026 da CBT em PDF).
- **WebFetch:** 6 tentativas, **6 falharam** (bloqueio de egress do proxy em pickleheads.com, support.universaltennis.com, playerhelp.playtomic.com, worldtennisnumber.com, en.wikipedia.org e dupr.com). Parei de tentar após a sexta falha, porque todos os domínios testados, inclusive Wikipedia, estavam bloqueados.
- Consequência: na primeira passada, **todas as linhas eram Resumo**. As marcadas **Lido** foram confirmadas depois pelo Firecrawl. A classificação **Forte** foi usada só quando várias fontes concordam e ao menos uma é help center ou documento oficial (resumo de doc oficial).
- Não usei Firecrawl, Mobbin, MCP nem curl.
- Buscas específicas por Reddit (DUPR, UTR) não retornaram threads; a percepção de jogador vem de artigos, blogs e Trustpilot. Os trechos citados não identificam autores.
- Lacunas: preço do Playtomic Premium ao jogador; tabela completa de pontos por fase da ITF e da CBT; qualquer rating de nível de BT em uso no Brasil.
