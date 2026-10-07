# SINTESE.md — Dores do organizador e o que elas limitam no app do jogador

As dores de quem organiza ranking e torneio de Beach Tennis, ranqueadas por força de evidência, e como cada uma se liga às 10 oportunidades do jogador da pesquisa de mercado (`docs/discovery/SINTESE.md`, do PR da issue de discovery de mercado).

Pesquisa feita em 25/09/2026. Detalhe em [`DORES.md`](DORES.md), [`JORNADA.md`](JORNADA.md), [`FERRAMENTAS.md`](FERRAMENTAS.md) e [`ARENA.md`](ARENA.md). Os códigos de fonte resolvem fora do repo (evidência: documento D5 ("Fontes e ferramentas dos organizadores"), projeto Discovery e estratégia no Linear).

> **Sem decisões de produto nem de escopo.** A visão do organizador está fora do MVP (`docs/PRODUCT.md`). Esta síntese descreve o que a operação do organizador permite ou impede que o app do jogador prometa. O que fazer com isso é decisão do Gabriel.

---

## O que mudou em relação à pesquisa de mercado

A pesquisa de mercado dizia que as dores de organizador e arena "vêm quase só de marketing de fornecedor". Agora há:

| Tipo de fonte | Quantidade | Exemplos |
| --- | --- | --- |
| Primeira pessoa (1P) | 4 fontes | Vlog de organizadoras num torneio de 2 dias; diretor de federação sobre categorias; organizador veterano sobre patrocínio; reviews de organizadores |
| Dois lados (2L) | 7 reclamações lidas, 5 delas com resposta da empresa | Circuito nacional (TF Sports), plataforma (o concorrente principal) |
| Regulamento lido na íntegra (REG) | 4 | FET, FCTBT, ranking Nômades, ranking AVB |
| Acadêmico com visita e entrevista (ACAD) | 2 | Caso de uma arena no interior do CE; 10 arenas em 5 estados |
| Praticante-construtor (PC) | 1 | App de academia escrito em público, com 1.088 commits |
| Demanda publicada (DEM) | 2 | Pedido de planilha no 99Freelas; planilha vendida |

**A lacuna que continua:** nenhum organizador foi entrevistado. O [`ROTEIRO_ENTREVISTA.md`](ROTEIRO_ENTREVISTA.md) está pronto para isso.

---

## As 5 dores mais fortes

| # | Dor | Tipos de fonte | Força | Consequência para o jogador |
| --- | --- | --- | --- | --- |
| 1 | **Garantir a categoria certa e sustentar a decisão quando alguém contesta** | 1P · 2L · REG · PC | Forte | Jogo desequilibrado; desclassificação; vaga em Finals perdida; processo judicial |
| 2 | **Inscrição e pagamento por dupla** (dois pagamentos, comprovante, pendência) | 2L · REG · PC · DOC | Forte | Inscrição cancelada; cobrança errada; pagamento que não chega à arena |
| 3 | **Mudança de última hora** (troca de parceiro, desistência, reembolso) | 2L · REG · PC · DOC | Forte | Pedido sem resposta; dinheiro perdido; regra diferente em cada torneio |
| 4 | **Atendimento e aviso concentrados no WhatsApp** | 2L · REG · PC · ACAD | Forte | Horário e mudança que não chegam; suporte que não responde |
| 5 | **O dia do torneio** (chamada, atraso, W.O., clima, 12–15h de trabalho) | 1P · REG | Forte | W.O. por não saber o horário; jogo tarde da noite |

Logo abaixo, com uma ressalva importante:

| # | Dor | Força | Ressalva |
| --- | --- | --- | --- |
| 6 | **Resultado lançado tarde** | Forte na consequência; **Fraca na causa** | Bem documentada pelo lado do jogador e da plataforma, mas nenhum organizador explicou por que atrasa. É a dor ligada à oportunidade nº 1 do jogador. |
| 7 | Ranking de arena depende do jogador para marcar, jogar e informar | Média | Só regulamento e um elogio de organizador |
| 8 | Conta que fecha no limite (repasse, taxa, nota fiscal, patrocínio) | Média | Um regulamento e duas falas |
| 9 | Ferramenta que não cobre o formato, e a planilha que sobra | Média | Demanda publicada e um construtor |

---

## Ligação com as oportunidades do jogador

O top 10 da pesquisa de mercado, visto pelo lado de quem opera a competição.

| Oportunidade do jogador | Dores do organizador que a limitam | O que a evidência sugere (descritivo) |
| --- | --- | --- |
| **1. Resultado que entra rápido e em que dá para confiar** | 6, 7, 5 | Em torneio, o resultado passa pela súmula do árbitro ou pela mão do organizador, e a plataforma diz que isso é responsabilidade dele (RA1). Em ranking de desafio, depende do jogador informar no grupo ou no formulário (REG2, REG3). O app do jogador só entrega "rápido" se alguém da operação fizer a sua parte. A causa do atraso não foi observada. |
| **2. Nível do adversário e perfil em que dá para confiar** | 1 | É a dor com mais tipos de fonte **dos dois lados**: o jogador reclama de *sandbagging*, e o diretor de federação diz que é o maior estresse do torneio e que não tem método. Hoje a checagem é manual: foto no WhatsApp, consulta a outra plataforma, impugnação depois do evento. A validação por CPF existe no concorrente principal, mas como opção do gestor (RA2). |
| **3. Horário e notificação confiáveis no dia do torneio** | 4, 5 | A programação é responsabilidade do árbitro geral e da organização; a chamada é por som ou voz; o aviso de mudança vai pelo grupo de WhatsApp. Um construtor precisou tornar o WhatsApp obrigatório no cadastro para conseguir avisar horário (GH #72). |
| **4. Explicar por que a posição mudou** | 1, 7 | Cada organizador escreve a sua tabela (W.O. vale 0 na FET; ranking de arena mistura torneio com "selo" e desafio). Desclassificação e impugnação mudam posição **depois** do evento (RA4). |
| **5. Regra do organizador visível e previsível** | 3, 1 | As regras que mais geram conflito são justamente as de troca, reembolso, W.O. e categoria. Elas estão no regulamento em PDF ou na página do torneio, e cada organizador tem a sua. Organizadores elogiam o app que explica bem as regras (AS1). |
| **6. Navegação direta para a tarefa do dia** | 4, 5 | No dia do torneio, o organizador lida com chamada e W.O. em tempo real. O jogador precisa do próximo jogo; o organizador precisa que ele apareça em 15 min. |
| **7. Conta, sessão e desempenho que não atrapalham** | 2 | Cobrança por dupla, comprovante e pendência manual (o inadimplente não sai sozinho, DOC1) geram as queixas de cobrança que aparecem nas reclamações públicas. |
| **8. Descobrir competição por nível e região** | 1, 8 | O organizador define categoria e limite de vagas; a arena usa o torneio para trazer gente nova (ACAD1, ACAD2). |
| **9. Progressão de categoria e evolução visíveis** | 1 | Federações usam promoção obrigatória como remédio contra *sandbagging* (top 4 sobe na FPT; campeão da iniciante sobe na FCTBT). A progressão é regra do organizador, não só marco emocional do jogador. |
| **10. Um nível de BT que atravesse arenas e federações** | 1 | A dor aparece do lado do organizador: impugnação por ranking em outra federação (RA4), federação que não conhece o nível de quem vem de fora (REG4), circuito que confere ranking em outra plataforma (RA3). É a primeira evidência de **demanda do lado do organizador** para essa oportunidade, que na pesquisa de mercado tinha demanda "quase nula" do lado do jogador. |

### Leitura transversal

- **A cadeia de responsabilidade se fecha sobre o jogador.** O jogador reclama com o app; o app diz que é do organizador (RA1); o organizador diz que é do atleta (RA3). As oportunidades 1, 3 e 5 estão exatamente nos pontos em que essa cadeia termina no jogador.
- **Organizador e jogador querem a mesma coisa em três pontos:** categoria justa (1), menos pendência (6) e um canal só (4). Nos outros, os interesses se opõem: o organizador precisa de regra fechada (sem troca, sem reembolso, W.O. em 15 min) e o jogador pede flexibilidade.
- **Para o dono de arena, a competição serve ao resto do negócio** (marketing, fidelização, placa de publicidade, bar). O que ele espera de uma ferramenta de torneio pode ser diferente do que espera um organizador de circuito. É inferência, a confirmar em entrevista.

---

## Riscos que a evidência levanta

Descritivos, não recomendações.

| # | Risco | Evidência | Força |
| --- | --- | --- | --- |
| RO1 | **O app do jogador promete o que depende do organizador.** Resultado, horário e regra dependem de quem opera a competição, que está fora do MVP | RA1, REG1, REG2, REG3 | Forte |
| RO2 | **O organizador federado não escolhe a ferramenta.** Federação usa Tênis Integrado; CBBT usa o concorrente principal; circuitos usam app próprio | REG1, REG4, LP2, RA3 | Forte |
| RO3 | **O WhatsApp continua sendo a camada de comunicação** mesmo de quem tem sistema próprio | RA3, REG2, GH #72, ACAD2 | Forte |
| RO4 | **A arena pequena está sob pressão** (preço caindo, 40–50% de ocupação numa cidade saturada) e usa torneio como marketing, não como receita | ACAD1, ACAD2 | Média |
| RO5 | **Surgem sistemas feitos por quem opera academia**, com escopo de torneio + aula + day use | GH | Fraca (um caso) |

---

## Perguntas abertas

Só o Gabriel responde. Cada uma muda a leitura acima.

1. **O app do jogador vai prometer resultado rápido e horário confiável mesmo sem controlar a operação do organizador?** Ligada ao risco RO1 e à pergunta 3 da pesquisa de mercado (a visão do organizador continua fora do MVP?).
2. **O produto trata o organizador como alguém que usa o concorrente principal** (e então a operação dele é a do concorrente principal) **ou como alguém que pode usar outras ferramentas?** Muda a leitura de RO2 e da oportunidade 5.
3. **Integridade de categoria (dor 1) é problema do app do jogador?** É a dor com mais evidência dos dois lados, e também a oportunidade 2. Mas a decisão de categoria é do organizador e da federação.
4. **Qual formato de ranking o MVP representa?** (pergunta que continua aberta desde a pesquisa de regras de ranking). No ranking de desafio, o jogador informa o resultado; no torneio, o árbitro ou o organizador. As dores 6 e 7 dependem disso.
5. **Dá para fazer de 4 a 6 entrevistas com o roteiro antes de fechar o escopo do MVP?** A causa do atraso de resultado (dor 6) e o motivo de troca de ferramenta só aparecem em entrevista.
6. **O professor-organizador é um público à parte?** Ele organiza, dá aula, compete e é disputado entre arenas (`ARENA.md`). Nenhum JTBD atual o descreve.
7. **O WhatsApp é para substituir, integrar ou ignorar?** Pergunta que já estava aberta na pesquisa de mercado; esta frente acrescenta que o organizador depende dele mais do que o jogador.

---

## Nota de método: uso de ferramentas

| Ferramenta | Chamadas | Limite | Observação |
| --- | --- | --- | --- |
| Busca nativa (`WebSearch`) | 57 | ~200 | — |
| Firecrawl | 46 | 80 | 2 recusadas por limite de requisição por minuto (as sessões em paralelo compartilham a cota) e cerca de 13 voltaram vazias, fora do tema ou sem conteúdo útil (buscas vazias, vídeo removido, podcast de 2h50 sem transcrição, página redirecionada, texto de outro esporte). Todas entraram na conta. Nenhuma usou o modo Alexandria nem `firecrawl_find_tools` |
| `WebFetch` | 16 | — | 5 bloqueadas pelo proxy (YouTube, blogs, periódico). Funcionou para PDFs no S3 da Tênis Integrado e para o GitHub |
| Mobbin | 0 | — | Não usado, conforme a instrução |

- **O que funcionou:** transcrição de YouTube pelo Firecrawl (vídeos curtos e médios); reclamação pública com resposta pelo modo de citação literal; PDFs de regulamento no S3.
- **O que não funcionou:** descoberta de vídeos de organizador (muito ruído); Reddit e fóruns (nada de BT); podcasts em áudio (sem transcrição); Instagram, Facebook e grupos de WhatsApp (inacessíveis).
