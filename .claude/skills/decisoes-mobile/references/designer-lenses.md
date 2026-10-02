# Lentes

A skill raciocina por oito lentes com nome, e não por um checklist achatado. Cada uma é uma pessoa (ou instituição) com posições próprias. Aqui estão as posições, onde as lentes discordam e a tabela de peso.

**Por que lentes, e não regras:** design mobile tem poucas verdades universais e muitos trade-offs de contexto. A lente carrega um ponto de vista: diz o que aquele designer contestaria. Passar por várias revela tensões que um checklist esconderia.

## Como usar

1. No início do Plan ou do Audit, leia este arquivo.
2. Identifique o assunto da tela (navegação, formulário, alcance, movimento…).
3. Escolha pela tabela de peso, no fim, as 2 ou 3 lentes que lideram.
4. Quando as lentes discordam, isso é fork para o Gabriel, não escolha silenciosa. Mas antes confira se a spec já decidiu (`SKILL.md`, "Regra central").
5. Atribua: "o ponto do Hoober aqui é…". Raciocínio com nome é mais útil e mais honesto que "boa prática" anônima.

---

## 1. Realista ergonômico: Steven Hoober

Pesquisa de observação na rua (1.333 observações) sobre como as pessoas seguram o celular.

**Os dados, de 2013:** 49% com uma mão, 36% apoiado (duas mãos, uma toca), 15% com as duas mãos; 75% das interações pelo polegar; retrato em 90% do tempo. Em telas grandes, o uso com as duas mãos sobe para ~70%, mas ~60% das interações seguem pelo polegar.

> **Dado de 2013, anterior às telas de 6".** A própria fonte diz "directional, not current": serve de direção, não de número atual. Não cite os percentuais como se fossem de hoje. O princípio, abaixo, continua valendo.

**A posição central, e a mais mal aplicada:**

> "Always accommodate the most constrained grip, so people can use your interface no matter how they choose to hold their device."

Os 49% com uma mão **não** autorizam supor uso com uma mão. A pega muda "a cada poucos segundos" com a tarefa. A interface precisa funcionar na pega **mais difícil** em que a pessoa pode estar. No LetzPlay, isso inclui a raquete ou a garrafa na outra mão.

**O que pega:** layout que supõe pega fixa; ação primária onde só uma mão confortável alcança; "mobile = em movimento e com uma mão".

## 2. Mapa do polegar: Scott Hurff

Transformou a pesquisa de pega num mapa de posição com três zonas.

| Zona | Significado | O que mora ali |
| --- | --- | --- |
| **Natural** | arco do polegar sem esforço | ação primária, navegação, controles frequentes |
| **Esticada** | alcançável com esforço; a pega pode mudar | ações secundárias, ajustes |
| **"Ai"** | precisa mudar a pega ou da outra mão | ações destrutivas ou raras, ou nada importante |

**Posição forte:** tela grande não é tela pequena ampliada. O mapa **não é linear** com o tamanho: a zona "Ai" explode nos celulares grandes, e até a zona esticada faz a pessoa reposicionar o aparelho sem perceber, o que atrasa e aumenta o risco de queda. Refaça o mapa por classe de aparelho.

**É mapa de custo, não grade.** A zona diz o **custo** de um lugar. "Excluir" na zona "Ai" está certo: o custo é proteção. O erro é pôr a ação principal ali.

**O que pega:** ação primária em zona cara; o mesmo layout em todos os tamanhos sem refazer o mapa; tratar o topo como neutro.

## 3. Foco forçado: Luke Wroblewski

*Mobile First*: a tela pequena é vantagem, não limitação a pedir desculpas.

**Posição central:** projetar primeiro para o celular "força o foco e permite inovar". A tela obriga a responder "o que merece este espaço?", e essa resposta é a prioridade certa em **qualquer** tela. Priorizar é o trabalho de design; o layout vem depois.

**Em formulários (ainda a referência):**

- **Coluna única, sempre.**
- **Rótulo visível**, acima do campo; placeholder como rótulo é antipadrão, porque some justo quando a pessoa digita.
- **Tipo de campo igual ao tipo de dado**: e-mail abre o teclado de e-mail.
- **Corte agressivo de campos**: para cada um, "o que acontece se tirarmos?". Valores padrão bons e editáveis deixam as pessoas mais rápidas.

**O que pega:** desktop espremido sem decisão de prioridade; formulário em duas colunas; placeholder como rótulo; formulário que pede mais do que precisa.

## 4. Manipulação direta: Josh Clark

*Tapworthy* e *Designing for Touch*: toque pede repensar a interação, não encolher a interface de desktop.

**Posições:**

- **"Buttons are a hack":** o botão é uma abstração inventada para o mouse. No toque, prefira manipular o conteúdo direto: arrastar o card, deslizar a lista.
- **44pt como unidade básica:** o menor alvo tocável com confiança, medida anatômica e não de pixel. No LetzPlay, a unidade é **48px** (`--dimension-tap-target-minimum`).
- **Gestos são os atalhos de teclado do toque:** mais rápidos e expressivos, e invisíveis para o novato do mesmo jeito.
- **Honre a metáfora física por inteiro:** se parece objeto, as pessoas vão tratá-lo como objeto. Metáfora pela metade falha.

**A tensão da descoberta, a posição mais honesta dele:** ele **não** resolve gesto × botão. Gesto escondido custa descoberta; botão visível custa expressividade. A heurística: ensinar o gesto no contexto, na hora em que ele serve, não num tutorial inicial.

**O que pega:** controles em volta do conteúdo quando o conteúdo podia ser o controle; gesto sem pista; alvo menor que o mínimo; aparência física que não se comporta como parece.

## 5. Taxonomia de navegação: Frank Rausch

A taxonomia mais rigorosa e atual de navegação mobile.

- **Estrutural:** Drill-down, Plana (abas), Pirâmide, Hub-and-spoke
- **Sobreposta:** modal de alta fricção (exige decisão), modal de baixa fricção (fecha com gesto), não modal (não bloqueia)
- **Embutida:** mudança de estado, passo a passo, guiada pelo conteúdo

**Posições:** o hambúrguer é "o irmão malvado da tab bar", pouco achado, e a tab bar rende mais; alerta com um botão só deveria virar texto na própria tela; transição de tela cheia é errada para mudança de estado no lugar; voltar pela borda é básico, não extra.

**O que pega:** navegação escolhida pela estética e não pela estrutura do conteúdo; modal onde cabia mudança de estado; fluxo feito de camadas empilhadas.

## 6. Cético empírico: Raluca Budiu / NN/g

Pesquisa mobile do NN/g: a lente que testa a suposição da moda contra a evidência.

- **As plataformas convergiram:** iOS e Android ficaram parecidos o bastante para uma interface quase igual servir aos dois (NN/g, 2023).
- **Formulário deixou de ser o maior atrito:** passkeys, links mágicos, biometria e preenchimento automático resolveram muito. O problema dominante agora é a **proliferação de camadas** (sheets e popups empilhados, que fecham sem querer e desorientam) e o navegador dentro do app.
- **Padrões de varredura:** em F (pouca compreensão), pontilhado (pula para negrito, link, número), bolo em camadas (só os títulos, o mais eficaz para navegar), compromisso (lê tudo; precisa de confiança). No celular é comum o olho fixo e o polegar rolando, então **a estrutura de títulos importa mais que o alinhamento à esquerda**.
- **Bottom sheets (2024):** o pé da tela **não** está garantido ao alcance do polegar (as pegas variam). Sheet vale para tarefa passageira com o fundo ainda relevante; **não** para navegação principal, e **nunca** empilhado.

**O que pega:** escolha justificada por moda; camadas empilhadas; supor que embaixo é alcançável; títulos fracos.

## 7. Ofício moderno: Andy Allen / Sebastiaan de With / Gavin Nelson

Três praticantes que fazem apps tidos hoje como referência de ofício mobile. São pessoas distintas: chame a voz que combina com o trabalho, **pelo nome**, sem misturar numa voz genérica de "ofício".

### Andy Allen: sensação expressiva (Not Boring Software)

- **Minimalismo é lugar para visitar, não para morar.**
- **A tela tira; o designer devolve:** feedback tátil, sonoro e de profundidade nos momentos que o design convencional deixa mudos.
- **Laços de feedback de jogo cabem em app utilitário.**
- **Lidera quando** o assunto é como a interação se *sente*.

### Sebastiaan de With: ofício de nível nativo (Halide)

- **O enquadramento decide tudo depois:** "não dissemos que fizemos um app; dissemos que fizemos uma câmera".
- **Controle total sem perder a simplicidade.**
- **Leve, nativo e rápido como qualidades de design**, não só de engenharia.
- **Lidera quando** o assunto é fidelidade nativa, ferramenta de uso intenso ou desempenho como design.

### Gavin Nelson: complexidade feita nativa (Linear Mobile)

- **Destilar, não encolher:** tornar a densidade de desktop acessível no toque, sem espremer.
- **A régua é "uma extensão natural de si":** parecer algo que nunca precisou ser aprendido.
- **Lidera quando** o assunto é levar software denso para o celular ou arquitetura de informação.

**A tensão interna:** Allen (expressivo) e de With (contido, nativo e quieto) discordam sobre quanta personalidade a interface carrega. Num app de competição usado na quadra, o padrão é a contenção de de With e Nelson, com a expressividade de Allen reservada a momentos raros (ex.: subir no ranking). Se a tela pedir outra coisa, é fork.

**O que pega:** movimento posto no fim e sem significado; transição que não diz para onde a coisa foi; lentidão desculpada como "problema de engenharia"; tela densa encolhida em vez de repensada.

## 8. Cânone de plataforma: Apple HIG / Material 3

Não é uma pessoa, mas uma lente: "o que a plataforma espera, e ela está estável aqui?"

**Estável:** alvo mínimo (Apple 44pt, Material 48dp com 8dp entre alvos; LetzPlay 48px); gestos reservados ao sistema (início, voltar, notificações); tab bar para 3 a 5 destinos iguais; distinção entre sheet, modal e alerta.

**Em transição (marque, não canonize):**

- **iOS 26 (Liquid Glass):** tab bar flutuante que encolhe ao rolar, camada "acessória", voltar com swipe em qualquer ponto da tela. O NN/g publicou avaliação crítica.
- **Material 3 Expressive (2025):** navigation drawer descontinuado; barra de navegação mais baixa e "flexível". Sem substituto limpo para 5+ destinos no celular.

O LetzPlay é web: o navegador desenha a própria interface por cima, e os gestos do sistema e do navegador (voltar pela borda, puxar para recarregar) valem nos dois sistemas.

**O que pega:** mistura de convenções de plataforma; app que intercepta gesto reservado; padrão em transição apresentado como estável.

---

## Onde as lentes discordam

Tensões reais: viram fork, a não ser que a spec já tenha decidido.

- **Hoober × Hurff na posição.** As zonas convidam a "pôr a ação primária embaixo". Hoober lembra que boa parte das pessoas não está na pega que deixa essa zona fácil. *Saída:* zona como mapa de custo; embaixo é **preferível**, não **garantido**.
- **Clark × lentes ergonômicas.** Hoober e Hurff ligam para onde fica o *controle*. Clark diz que, quando o conteúdo é o controle, a pergunta em parte some. *Saída:* primeiro o modelo de interação (Clark), depois a posição do que restar (Hoober e Hurff).
- **Allen × de With na expressividade.** *Saída:* é fork por tipo de produto; decida de propósito, sem meio-termo sem personalidade.
- **Ofício moderno × Cético empírico.** As vozes de ofício empurram movimento expressivo e interação nova; Budiu avisa que novidade costuma reprovar em teste de usabilidade. *Saída:* expressivo **e** descobrível; movimento comunica, gesto novo tem pista.
- **"Sheet para tudo" × NN/g.** *Saída:* sheet para tarefa curta e dispensável, com fundo relevante; nunca como página, nunca empilhado.

## Tabela de peso

| O assunto é… | Lideram | Apoiam |
| --- | --- | --- |
| Onde ficam ações e botões | Hoober, Hurff | HIG/M3 |
| Estrutura de navegação | Rausch, HIG/M3 | Budiu |
| Formulário ou entrada de dados | Wroblewski | Clark, HIG/M3 |
| Gesto e toque | Clark, HIG/M3 | Allen |
| Transição, movimento, "sensação" | Allen | Clark |
| Layout e hierarquia de conteúdo | Wroblewski, Budiu | Hurff |
| Sheet ou modal | Rausch, Budiu | HIG/M3 |
| Tela grande, uso com uma mão | Hurff, Hoober | — |
| "Isto está bom?", qualidade nativa | de With, HIG/M3 | Budiu |
| Tela densa levada ao celular | Nelson, Wroblewski | Budiu |
| Validar uma escolha da moda | Budiu | Rausch |

Na dúvida, as duas lentes do assunto mais o Budiu: o cético empírico é a proteção mais barata contra conselho mobile confiante e errado.
