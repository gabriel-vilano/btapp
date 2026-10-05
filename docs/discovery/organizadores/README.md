# docs/discovery/organizadores

Discovery do **lado de quem organiza** ranking e torneio de Beach Tennis: organizador de torneio (federação, circuito, independente), organizador de ranking de arena, dono e gestor de arena, professor que organiza. Pesquisa feita em 25/09/2026 (issue PRD-16 no Linear).

A visão do organizador está fora do MVP (`docs/PRODUCT.md`). Esta pesquisa existe porque a operação dele limita o que o app do jogador consegue prometer: resultado rápido, horário confiável e regra visível dependem de quem lança o resultado e opera a competição.

> **Sem decisões de produto nem de escopo.** Tudo aqui é evidência, com a dor ranqueada pela força da evidência. A escolha do que fazer com ela é do Gabriel.

## Arquivos

| Arquivo | Pergunta que responde |
| --- | --- |
| [`SINTESE.md`](SINTESE.md) | Quais são as dores mais fortes, como se ligam às oportunidades do jogador, e o que ficou em aberto? **Comece por aqui** |
| [`JORNADA.md`](JORNADA.md) | O que o organizador faz antes, durante e depois do torneio, e no ciclo do ranking de arena? |
| [`DORES.md`](DORES.md) | Onde ele perde tempo, dinheiro e paciência? Quais gambiarras usa? O que o jogador cobra dele? |
| [`FERRAMENTAS.md`](FERRAMENTAS.md) | O que ele usa e por que troca? (os preços estão fora do repo, no documento D5) |
| [`ARENA.md`](ARENA.md) | Como a competição se encaixa no negócio da arena? |
| [`ROTEIRO_ENTREVISTA.md`](ROTEIRO_ENTREVISTA.md) | Roteiro pronto para entrevistar organizadores e donos de arena |
| Fontes (fora do repo: evidência: documento D5 ("Fontes e ferramentas dos organizadores"), projeto Discovery e estratégia no Linear) | Lista de fontes com o código usado nos outros arquivos (YT1, RA3, REG1...): os códigos resolvem lá |

Constrói em cima da pesquisa de mercado (`docs/discovery/*.md`, PR da issue de discovery de mercado) e da pesquisa de regras de ranking (comentários da issue de pesquisa de regras no Linear). Onde este diretório cita `CONCORRENTES.md`, é o arquivo daquela pesquisa. A voz do usuário e o negócio daquela pesquisa saíram do repo (evidência: documento D1 ("Evidência: voz do usuário e reclamações") e documento D3 ("Estratégia de negócio: modelos de monetização"), projeto Discovery e estratégia no Linear).

## Tipos de fonte

O critério da issue é **dor real, dita por quem vive o problema**. Cada fonte recebe um tipo, do mais para o menos confiável para esse fim:

| Código | Tipo | Exemplo |
| --- | --- | --- |
| **1P** | Primeira pessoa: organizador, dono de arena, árbitro ou diretor de federação falando do próprio trabalho | Vlog de organizadoras (YT1), diretor de federação em podcast (YT2), review de organizador na loja (AS1) |
| **2L** | Dois lados: reclamação de atleta **com resposta** do organizador ou da plataforma | Reclamação pública com resposta (RA1–RA7) |
| **REG** | Regulamento lido na íntegra. Mostra a regra que o organizador precisou escrever, e por isso o conflito que ele tenta evitar | FET, Nômades, AVB (REG1–REG3) |
| **ACAD** | Pesquisa acadêmica feita com visita e entrevista a donos e gestores (a fala chega filtrada pelos autores) | Caso da Arena SandPlay (ACAD1), 10 arenas visitadas (ACAD2) |
| **PC** | Praticante-construtor: alguém que opera ou atende uma academia e escreve o próprio software em público | Pull requests do ArenaHub (GH) |
| **DEM** | Demanda publicada: pedido de freelancer, produto vendido para o organizador | 99Freelas, Hotmart |
| **N** | Notícia com fala de dono de arena ou organizador | O Tempo 2021 |
| **DOC** | Documentação de fornecedor: mostra o fluxo de trabalho na ferramenta e as perguntas frequentes dos gestores | Central de ajuda do incumbente (DOC1) |
| **MKT** | Marketing de fornecedor. **Só fonte secundária** | Blogs de Tecnofit, Atletis, Tornfy |

## Escala de força

A mesma da pesquisa de mercado, com um ajuste para o critério desta issue:

| Nível | Critério |
| --- | --- |
| **Forte** | Duas ou mais fontes independentes concordam, e pelo menos uma é **1P, 2L, REG ou ACAD lida na íntegra** |
| **Média** | Uma fonte 1P, 2L, REG ou ACAD lida na íntegra; ou várias fontes concordantes de tipo PC, DEM, N |
| **Fraca** | Só marketing, só resumo de busca, fonte de outro esporte, ou inferência |

"Lido" = página ou transcrição lida inteira. "Resumo" = só o resumo do mecanismo de busca.

## Limitação do método

- **Não há entrevista.** Nenhum organizador foi ouvido diretamente. O [`ROTEIRO_ENTREVISTA.md`](ROTEIRO_ENTREVISTA.md) existe para fechar essa lacuna.
- **YouTube:** as transcrições vêm do scraping e são automáticas (erros de palavra). Vídeos longos (podcast de 2h50) voltaram sem transcrição. A busca por vídeos de organizador trouxe muito ruído: poucos organizadores falam da operação em vídeo.
- **Instagram, Facebook e grupos de WhatsApp**, onde organizadores mais falam, não são acessíveis.
- **Reddit e fóruns** não trouxeram nada de BT; o que há de outros esportes quase não apareceu na busca.
- **A reclamação pública tem viés de conflito:** só aparece o que deu errado, e quase sempre com circuitos grandes. O organizador pequeno de arena não aparece lá.
- **Nome de pessoa física não aparece** nos trechos citados, mesmo quando a fonte é pública. Empresas, arenas e marcas são nomeadas.
