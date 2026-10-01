# Navegação

Escolher e revisar a navegação mobile, a maior fonte de forks. Lentes: **Rausch**, **HIG/M3**, **Budiu**.

> **No LetzPlay, a navegação principal está decidida** em `docs/NAVIGATION.md`: 5 abas (N1), sem menu lateral nem "Mais" (N5), tab bar visível também nas telas de detalhe e escondida só nos fluxos modais de tarefa (N4), aba de origem marcada (N10), uma busca só, no Explorar (N6), e rail a partir de 600px (N27). Use este arquivo para julgar a navegação **dentro** de uma tela ou de uma feature nova, e para dar fonte a uma observação, não para reabrir essas regras.

## A taxonomia do Rausch

Escolha a navegação pela **estrutura do conteúdo**, não pela estética.

**Estrutural**, como o conteúdo de primeiro nível se organiza:

| Padrão | Forma | Quando |
| --- | --- | --- |
| **Plana (abas)** | 3 a 5 seções pares, troca livre | seções independentes e de peso parecido |
| **Drill-down** | pilha de telas | conteúdo pai → filho (configurações, detalhe) |
| **Hub-and-spoke** | uma base para onde se volta entre tarefas | tarefas distintas lançadas de um centro |
| **Pirâmide** | irmãos acessíveis de dentro do detalhe | navegar uma sequência (próxima foto, próxima rodada) |

**Sobreposta**, conteúdo temporário sobre a tela:

| Padrão | Bloqueia? | Quando |
| --- | --- | --- |
| **Modal de alta fricção** | sim, exige decisão | a pessoa precisa escolher ou terminar antes de seguir |
| **Modal de baixa fricção** | sim, mas fecha com gesto | tarefa delimitada; sair é barato |
| **Não modal** | não, o fundo segue vivo | a camada se relaciona com um fundo ainda relevante |

**Embutida:** mudança de estado, passo a passo, guiada pelo conteúdo.

**Posições:** hambúrguer é pouco achado; alerta de um botão vira texto na tela; transição de tela cheia é errada para mudança de estado no lugar; voltar pela borda é básico.

## Tab bar e seus limites

- **Serve a** 3 a 5 destinos independentes e de peso parecido; destinos **visíveis**, ao alcance, padrão nos dois sistemas.
- **Limites:** teto de ~5; não expressa profundidade; as abas precisam ser **estáveis** (não mudam por papel ou experimento); **aba é para navegar entre modos, não para ação** como "Criar" ou "Registrar". O LetzPlay segue isso: registrar resultado e amistoso não são abas (N2).
- **Mais de 5 destinos** é achado em si: sinal de que a arquitetura de informação precisa de trabalho, não o componente de navegação.

> **A falha padrão do Claude:** pegar o hambúrguer porque parece arrumado. Visível e cheio vence arrumado e escondido.

## Sheet × modal × tela cheia

O bottom sheet é o padrão mais usado em excesso no design mobile atual. Decida de propósito.

| Superfície | Fundo | Quando | Não |
| --- | --- | --- | --- |
| **Sheet modal** | escurecido, bloqueado | tarefa curta e delimitada; uma escolha focada; substitui menu ou diálogo simples | usar como página; empilhar dois |
| **Sheet não modal** | vivo, interativo | a tarefa se relaciona com o fundo (filtro sobre mapa) | usar quando o fundo não importa |
| **Modal de tela cheia** | coberto | tarefa autocontida que se termina ou cancela | usar para algo rápido |
| **Alerta / diálogo** | bloqueado | informação crítica que pede decisão imediata; no máximo 2 botões | usar para aviso não crítico ou "OK" sozinho |

**A pergunta que decide é o bloqueio, não o tamanho:** a pessoa precisa ver ou usar o fundo? Sim → não modal. Não, e precisa resolver isto antes → modal ou tela cheia.

**Regras do NN/g para sheets (2024):**

- Sheet é para tarefa **passageira**, não destino. Sheet não é página.
- **Nunca empilhar sheets** para montar um fluxo: destrói a noção de onde se está.
- Fechar precisa ser óbvio. Puxar para baixo conflita com gestos do sistema e do navegador: sempre um botão de fechar visível também.
- "O pé da tela é alcançável" não é garantido (Hoober). Não justifique um sheet só pelo alcance.

No DS, o `Dialog` tem a variante sheet; o seu MDX diz quando usar cada uma.

## Cânone de plataforma, situação atual

**Estável:**

- Tab bar com 3 a 5 itens, navegação principal no celular nos dois sistemas.
- Gestos reservados: borda de baixo = início e apps recentes; borda de cima = notificações e central de controle; borda lateral = voltar. O app não intercepta.
- Voltar: no iOS, swipe da borda esquerda (no iOS 26, de qualquer ponto). No Android, o Predictive Back do sistema, que mostra a prévia do destino. Na web, os dois caem no histórico do navegador: cada tela com rota (N10) precisa voltar para o lugar certo.

**Em transição, nomeie, não canonize:**

- **iOS 26 (Liquid Glass):** tab bar como cápsula flutuante e translúcida que encolhe ao rolar; camada "acessória" acima dela. O NN/g publicou revisão crítica.
- **Material 3 Expressive (2025):** drawer descontinuado; barra mais baixa e "flexível"; em telas maiores, o rail substitui o drawer.

Quando a recomendação depender desses padrões, diga que são alvo em movimento.

## Checklist

- [ ] O padrão vem da **estrutura do conteúdo**, não da estética?
- [ ] Os destinos estão **visíveis**?
- [ ] Algum sheet serve como **página** ou está **empilhado**?
- [ ] O bloqueio de cada modal é **deliberado**?
- [ ] Fechar **não depende só de gesto**?
- [ ] Os **gestos reservados** ficaram intocados?
- [ ] Voltar (borda, botão do sistema, histórico do navegador) leva ao lugar esperado?
- [ ] Algo depende de **iOS 26 / M3 Expressive**? Está marcado?
