# docs/discovery

Discovery aprofundado de mercado, concorrentes, público e negócio para o jogador competitivo de Beach Tennis. Pesquisa feita em 25/09/2026.

Constrói em cima do mapa de oportunidades em `docs/DISCOVERY.md` (PR da issue de discovery anterior). Aquele doc é o primeiro mapa. Estes aprofundam cada frente e não o substituem.

> **Sem decisões de produto.** Tudo aqui é evidência e oportunidade ranqueada por força de evidência. A priorização é do Gabriel e mora no Linear. Números de mercado e preços envelhecem: confira a data da fonte antes de usar.

## Arquivos

| Arquivo | Frente | Pergunta que responde |
| --- | --- | --- |
| [`SINTESE.md`](SINTESE.md) | Síntese | Quais são as 10 oportunidades com mais evidência, e o que ainda está em aberto? **Comece por aqui** |
| [`CONCORRENTES.md`](CONCORRENTES.md) | Concorrentes | Quem mais atende o jogador e o organizador, e como? |
| no Linear (D1) | Voz do usuário | O que as reviews nas lojas dizem, por JTBD? |
| [`MERCADO.md`](MERCADO.md) | Mercado | Qual o tamanho, o crescimento e a geografia do BT? |
| [`PUBLICO.md`](PUBLICO.md) | Público | Quem é o jogador competitivo e quem são os atores ao redor? |
| no Linear (D3) | Negócio | Como o segmento ganha dinheiro, e o que cada modelo exige do produto? |
| [`MATRIZ_FEATURES.md`](MATRIZ_FEATURES.md) | Features | O que é table stakes, e o que ninguém faz bem, por JTBD? |

A voz do usuário (evidência: documento D1 ("Evidência: voz do usuário e reclamações"), projeto Discovery e estratégia no Linear) e os modelos de negócio (evidência: documento D3 ("Estratégia de negócio: modelos de monetização"), projeto Discovery e estratégia no Linear) saíram do repo.

Referências visuais (Mobbin) ficam em `referencias/`, de outra frente.

## Escala de força da evidência

A mesma do `docs/DISCOVERY.md`, usada em todos os arquivos:

| Nível | Critério |
| --- | --- |
| **Forte** | Várias fontes independentes concordam, e pelo menos uma foi lida na íntegra ou é dado público do próprio concorrente principal |
| **Média** | Uma fonte específica e verificável, ou várias fontes concordantes vistas só pelo resumo de busca |
| **Fraca** | Benchmark genérico fora do BT, opinião, ou inferência sem fonte direta |

## Limitação comum do método

A sessão roda atrás de um proxy que bloqueia boa parte dos sites (lojas de app, o site do concorrente principal, sites de reclamação pública, federações). Parte das páginas foi lida via um serviço de scraping com orçamento limitado. O resto foi visto só pelo resumo do mecanismo de busca, e cada arquivo marca o que foi lido e o que foi só resumo. Não há entrevistas com jogadores: a voz do usuário vem de reviews públicas, que têm viés negativo.
