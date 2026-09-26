# MATRIZ_FEATURES.md — LetzPlay

Matriz de features dos concorrentes cruzada com os 5 JTBDs do `CLAUDE.md`. Mostra o que é **table stakes** (quase todos têm) e onde estão as **lacunas** (ninguém faz bem, pela evidência disponível).

Pesquisa feita em 25/09/2026. Consolida `CONCORRENTES.md` e `VOZ_DO_USUARIO.md`: as fontes de cada célula estão lá.

> **Sem decisões de produto.** A matriz descreve o mercado. Não diz o que o LetzPlay deve construir.

---

## Método e limitações

- **Fonte das células.** O que o produto declara no site, na loja ou no help center (`CONCORRENTES.md`), cruzado com o que as reviews dizem que funciona ou quebra (`VOZ_DO_USUARIO.md`). Não houve teste de uso: nenhuma conta foi criada.
- **Ausência não é prova.** "—" quer dizer "não encontrado nas fontes vistas", não "não existe". A maioria das páginas foi vista só pelo resumo de busca.
- **Colunas escolhidas.** Os 4 apps de BT com mais evidência (LetzPlay atual, Tênis Integrado, Meu Ranking, Ranketes), as 3 referências de rating fora do BT (Playtomic, UTR, DUPR) e o canal informal (WhatsApp + planilha + Instagram). SaaS de arena e apps de Super 8 aparecem só na seção de padrões, porque as features declaradas são poucas e parecidas.

**Legenda**

| Marca | Significado |
| --- | --- |
| ✅ | Declarado pelo produto, sem queixa recorrente na amostra de reviews |
| ⚠️ | Declarado, mas reviews apontam que falha ou incomoda |
| ◐ | Parcial: existe só em parte, só em alguns casos, ou só no plano pago |
| — | Não encontrado |

---

## 1. Matriz

### JTBD 1 — Encontrar competição

| Feature | LetzPlay | Tênis Integrado | Meu Ranking | Ranketes | Playtomic | UTR | DUPR | Informal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Lista ou busca de torneios | ✅ | ⚠️ sem filtros | ✅ | ✅ | ⚠️ filtros | ⚠️ filtros | ◐ via parceiros | ◐ Instagram, grupos |
| Filtro por nível e região | — | ⚠️ | — | ◐ atletas por distância | ⚠️ | ⚠️ | ◐ filtro DUPR no CourtReserve | — |
| Inscrição com pagamento | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ◐ via parceiros | ◐ Sympla, Pix direto |
| Notificação de chave, horário e mudança | ⚠️ "perdemos torneios" | ⚠️ W.O. no Brasileiro | ✅ notificação de rodada | ✅ lembrete de desafio | ✅ | ⚠️ aviso tardio | — | ✅ grupo por torneio |
| Programação ao vivo no dia | ◐ | ⚠️ | — | — | — | — | — | ✅ grupo de WhatsApp |
| Achar parceiro ou adversário por nível | — | — | — | ✅ | ✅ partidas abertas | ◐ | ✅ | ✅ grupos |
| Agenda dos meus eventos inscritos | ◐ | ◐ | ◐ | ◐ | ✅ | ⚠️ | — | — |

### JTBD 2 — Saber onde estou no ranking

| Feature | LetzPlay | Tênis Integrado | Meu Ranking | Ranketes | Playtomic | UTR | DUPR | Informal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ranking por competição (arena, liga, circuito) | ✅ | ✅ oficial | ✅ | ✅ | ◐ ligas no Manager | — | — | ◐ planilha |
| Ranking ou rating que atravessa competições | — | ◐ só federativo | — | ◐ pontos próprios | ✅ nível 0–7 | ✅ | ✅ | — |
| Jogador lança o resultado | ◐ só em rankings configurados | — | ◐ | ✅ | ✅ | ◐ só não verificado | ✅ | ✅ post no grupo |
| Adversário confirma, com prazo | ◐ só em rankings configurados | — | — | ✅ | — | — | ✅ validação | ◐ template no grupo |
| Resultado de torneio lançado a tempo pelo organizador | ⚠️ pendente 2 meses | ◐ | ✅ | ? | — | ⚠️ | ⚠️ meses | — |
| Explicação de por que a posição mudou | — | — | ◐ defesa de pontos | ◐ regra pública | ⚠️ | ⚠️ | ⚠️ | — |
| Corrida às Finals com linha de corte | ◐ | ◐ Finals CBT | ◐ | ✅ "formato Finals" | — | — | — | ◐ regulamento |
| Aviso de mudança de posição | ? | — | ? | ? | ◐ | ◐ | ◐ | — |

### JTBD 3 — Preparar-me para um confronto

| Feature | LetzPlay | Tênis Integrado | Meu Ranking | Ranketes | Playtomic | UTR | DUPR | Informal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H2H entre jogadores | ✅ | — | ✅ | ✅ da temporada | — lista de rivais | ✅ | ◐ | — |
| Perfil público com histórico | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Nível comparável entre adversários | ◐ categoria | ◐ categoria | ◐ posição | ◐ categoria + pontos | ⚠️ "such a lie" | ⚠️ | ⚠️ | ◐ boca a boca |
| Confiabilidade do nível (verificado, peso por origem) | — | ◐ só eventos oficiais | — | — | — | ✅ Verified UTR | ✅ Reliability Score | — |
| Adversários em comum, ranking na data do jogo | — | — | — | — | — | ◐ | — | — |
| Perfil único e categoria verdadeira (anti-sandbagging) | ⚠️ perfis duplicados | ⚠️ CPF preso | — | — | ⚠️ | ◐ | ⚠️ ID duplicado | — |
| Histórico de W.O. e no-show do adversário | — | ◐ check-in e no-show | — | — | ⚠️ pedido em review | ◐ W.O. no perfil | — | — |

### JTBD 4 — Acompanhar amigos no BT

| Feature | LetzPlay | Tênis Integrado | Meu Ranking | Ranketes | Playtomic | UTR | DUPR | Informal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Seguir jogadores ou amigos | ✅ | — | — | ✅ | ✅ | ✅ | ✅ | ✅ grupos |
| Feed de atividade automática | ✅ | — | — | ✅ | ◐ | ◐ | ◐ | — |
| Torcer, curtir, comentar | ✅ | — | — | ✅ | ◐ | — | — | ✅ grupo |
| Gestão de parceiros frequentes | ⚠️ não dá para remover | — | — | ◐ | ✅ lista de parceiros | — | — | ✅ grupo |

### JTBD 5 — Sentir que estou evoluindo

| Feature | LetzPlay | Tênis Integrado | Meu Ranking | Ranketes | Playtomic | UTR | DUPR | Informal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Estatística V/D e histórico | ⚠️ esvaziada por pendentes | ✅ | ✅ | ✅ | ✅ | ⚠️ pago e incompleto | ✅ | — |
| Gráfico de evolução no tempo | ◐ painel de desempenho | — | — | — | ◐ Premium | ◐ Power | ◐ DUPR+ | — |
| Marcos e badges | — | — | — | ✅ selo top 10 | — | — | — | — |
| Promoção de categoria como evento | — | ◐ regra federativa | — | ◐ | ⚠️ nível "preso" | ⚠️ | ⚠️ | ◐ regulamento |
| Retrospectiva do ano | — | — | — | — | — | — | — | — |

---

## 2. Table stakes

O que quase todos têm. Descritivo: indica o que o jogador já encontra em qualquer alternativa.

| Feature | JTBD | Quem tem | Força |
| --- | --- | --- | --- |
| Inscrição em torneio com pagamento online | 1 | Todos os apps de BT, Playtomic, UTR, Sympla | Forte |
| Ranking dentro de uma competição (arena, liga, circuito) | 2 | Todos os apps de BT e SaaS de arena | Forte |
| Perfil com histórico de jogos | 3, 5 | Todos os apps lidos | Forte |
| Estatística básica de vitória e derrota | 5 | LetzPlay, Tênis Integrado, Meu Ranking, Ranketes, Playtomic, DUPR | Forte |
| H2H entre jogadores | 3 | LetzPlay, Meu Ranking, Ranketes, UTR (e StudyPadel, Match! Tennis) | Forte |
| Chave e programação geradas automaticamente | 1 | Todos os apps de torneio, inclusive os de Super 8 gratuitos | Forte |
| O jogador não paga pelo app de BT | — | Todos os apps de BT no Brasil | Forte |

---

## 3. Lacunas

O que ninguém faz bem, pela evidência disponível. Ordenadas pela força da evidência. A coluna "Sinal" separa o que a oferta mostra (feature ausente) do que a demanda mostra (queixa em review).

| # | Lacuna | JTBD | Sinal de oferta | Sinal de demanda | Força |
| --- | --- | --- | --- | --- | --- |
| L1 | **Horário e notificação confiáveis no dia do torneio** | 1 | Só o WhatsApp cumpre o papel de forma consistente. LiveBT existe desde 2019 para isso | 6 menções em 3 apps, com perda de torneio e W.O. | Forte |
| L2 | **Resultado que entra rápido e é confiável**: lançamento pelo jogador, confirmação do adversário e prazo | 2 | Ranketes, DUPR, Playtomic (automático em 24h) e LetzPlay (em ranking configurado, automático em 24h) validam pelo adversário. Nenhum arbitra a recusa: no DUPR a recusa apaga a partida, na Playtomic o resultado fica "suspenso", no LetzPlay vira "caso omisso" do organizador (correção do `aprofundamento/`) | 4 menções em 2 apps + 4 threads no Reddit | Forte |
| L3 | **Nível do adversário em que dá para confiar** | 3 | Só UTR e DUPR separam verificado de autodeclarado. Nenhum app de BT faz isso | Rating "mente": 7 menções em 3 apps + 15 threads. Sandbagging e perfis duplicados: 6 menções em 4 apps + 3 threads | Forte |
| L4 | **Um nível de BT que atravesse arenas e federações** | 2, 3 | UTR, DUPR, WTN e Playtomic não cobrem BT. No Brasil cada arena, circuito, CBT e CBBT tem seu ranking | 1 pedido explícito ("can you add … beach tennis?"). No BT, a demanda é inferida | Forte (oferta); Fraca (demanda) |
| L5 | **Explicar por que subi ou desci** | 2, 5 | Nenhum app mostra a conta. Regras publicadas só em regulamento ou FAQ | Queda após vitória sem explicação: 2 menções + 5 threads | Forte |
| L6 | **Navegação simples para a tarefa do dia** (ver meu jogo, meu ranking) | Fundação | — | 15 menções em 5 apps, a dor mais citada da amostra | Forte |
| L7 | **Descoberta de competição por nível e região num lugar só** | 1 | Ao menos 8 plataformas de inscrição BR + Sympla + Instagram. Nenhum agregador nacional | Filtros ruins: 9 menções em 5 apps + 2 threads | Forte |
| L8 | **Rating de dupla com parceiro variável** | 3, 5 | UTR aplica o mesmo delta aos dois; DUPR usa confiabilidade; Playtomic é criticado. Problema aberto fora do BT | 1 menção + 3 threads | Média |
| L9 | **Evolução visível para quem não paga** | 5 | Gráfico de evolução existe só no plano pago (Playtomic, UTR, DUPR). No BT, só o "painel de desempenho" do LetzPlay | "Rating preso": 2 menções + 3 threads. Estatística paga que não entrega: 1 | Média |
| L10 | **Marcação de jogo de ranking dentro do app** | 2 | Só Ranketes declara desafio com data e lembrete. Meu Ranking passou a exibir o link do grupo de WhatsApp | Nenhuma review pede isso | Média (oferta); sem sinal de demanda |
| L11 | **Marcos de ranking e de categoria** (promoção, top 10, Finals) | 5 | Só Ranketes (selo top 10). A promoção de categoria é regra formal nas federações | Nenhuma review pede isso | Média (regra); sem sinal de demanda |
| L12 | **Retrospectiva do ano** | 5 | Nenhum app de raquete lido. Rivals tem "retrospectiva do ano"; Strava tem Year in Sport pago | Nenhuma review | Fraca |

---

## 4. Padrões que atravessam a matriz

| Padrão | Evidência | Força |
| --- | --- | --- |
| **As células ⚠️ se concentram em confiabilidade, não em ausência de feature.** O LetzPlay declara quase tudo do JTBD 1 ao 4, e as queixas são de notificação, pendência, perfil duplicado e navegação | Matriz acima; `VOZ_DO_USUARIO.md`, recorte LetzPlay | Forte |
| **O WhatsApp é o concorrente mais completo no JTBD 1 e no dia do torneio**, e o mais fraco em tudo que precisa de histórico (JTBDs 2, 3 e 5) | Coluna "Informal"; regulamentos de arena citam o grupo como canal oficial | Média |
| **O JTBD 4 é o mais coberto pela oferta e o menos citado pela demanda.** Seguir, feed e torcida existem no LetzPlay e no Ranketes; nenhuma review do LetzPlay fala deles | Matriz; `VOZ_DO_USUARIO.md`, JTBD 4 | Média (ausência em review não prova ausência de valor) |
| **Rating algorítmico gera a maior discussão pública**, positiva e negativa. Ranking por pontos gera menos discussão, e a queixa muda de natureza: pendência e regra do organizador | UTR, DUPR, Playtomic × LetzPlay, Meu Ranking | Forte |
| **O jogador muitas vezes não escolhe o app**: a federação, a arena ou o circuito escolhe | 4 reviews em 3 apps; white-label por arena (TPC Matchpoint) | Forte |
| **O entrante novo (Ranketes) já cobre as lacunas L2, L10 e L11 no discurso.** O uso é quase nulo (1 avaliação iOS, 50+ downloads Android). Desde 26/09 é referência pontual, não concorrente a monitorar | Site lido em 25/09/2026; lojas lidas no aprofundamento | Forte (declarado); uso quase nulo |
