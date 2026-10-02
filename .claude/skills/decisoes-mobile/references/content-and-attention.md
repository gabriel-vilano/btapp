# Conteúdo e atenção

O que vai na tela, em que prioridade, e como isso sobrevive a um jogador distraído, que olha de relance. Lentes: **Wroblewski**, **Budiu**, com **Hurff**.

## Priorizar é o trabalho de design

O ponto central do Wroblewski: a tela pequena é uma **função de forçar**. Obriga a responder o que toda tela deveria responder: *o que merece este espaço?*

1. **Liste tudo** o que a tela mostra ou poderia mostrar.
2. **Ordene sem dó:** qual é a **única** coisa para que serve? Depois a segunda, a terceira.
3. **Corte, adie ou rebaixe** o resto. Adiar = atrás de um toque, mais abaixo, outra tela. Cortar = some.
4. **Monte o layout a partir da ordem.** O layout vem depois da prioridade.

A prioridade achada no celular é a certa em **qualquer** tamanho: "mobile first" é disciplina de prioridade, não breakpoint de CSS.

> **A falha do Claude:** pegar a tela de desktop e encolher, com todos os elementos preservados e empilhados. Se nada foi cortado nem rebaixado, nenhuma decisão de prioridade foi tomada.

## Como se lê no celular (Budiu / NN/g)

No celular, mais se varre do que se lê:

| Padrão | O que o olho faz | O que isso pede |
| --- | --- | --- |
| **Bolo em camadas** | pula de título em título | a varredura mais eficaz: títulos que carregam o sentido sozinhos |
| **Pontilhado** | caça negrito, link, número | destaque nas palavras importantes, não nas decorativas |
| **Em F** | lê as primeiras palavras das linhas | palavra com informação primeiro |
| **Compromisso** | lê tudo | só com confiança ou motivação alta; nunca suponha |
| **Marcação** | olho fixo, polegar rola | comum no celular: ritmo e blocos importam |

**Consequências:**

- **Títulos fazem o trabalho pesado.** Quem lê só os títulos deve entender a tela. Título vago ("Visão geral", "Mais") desperdiça a varredura.
- **Comece pelo que importa.** A resposta em cima, o detalhe embaixo.
- **Blocos curtos**, grupos claros, espaço entre eles.
- **Destaque é orçamento.** Se tudo é negrito, nada é.

## Leitura de relance: atenção interrompida

O uso mobile é interrompido por padrão. No LetzPlay, mais ainda: na quadra, entre games, ao sol. Ler de relance é decisão de design.

- **Estado por posição, cor, forma e tamanho**, não por uma frase que obriga a parar. Primeiro se sabe o estado, depois, se quiser, lê-se o detalhe. Cor nunca sozinha: o estado também é texto (WCAG 1.4.1).
- **Uma coisa principal por tela.** Focos concorrentes pedem um estudo que a pessoa interrompida não dá.
- **Sobreviver ao retorno.** Quando a pessoa volta depois de uma distração, a tela a reorienta na hora: título claro, layout estável, "onde estou" óbvio.
- **Legível na periferia**, com tamanho e contraste para o estado importante. Contraste por WCAG 2.1 AA (`docs/TOKENS.md`).

## Camadas empilhadas: a falha número 1 de hoje (Budiu)

O achado recente do NN/g: o problema dominante do mobile é **camada demais**. Sheets empilhados, popup sobre modal, banner sobre toast sobre diálogo. A pessoa perde onde está e o que fecha o quê; o fechamento acidental perde trabalho.

- **Uma camada por vez.** Resolva a atual antes de abrir outra. Fluxo que parece pedir camadas empilhadas precisa ser uma sequência de **telas**.
- **Toda camada fecha de forma óbvia e consistente**, e não só por gesto.
- **Tela em vez de camada** para o que não é passageiro.

## Estados: vazio, carregando e erro

Uma tela não está desenhada até os estados fora do ideal estarem. São decisões de conteúdo, não casos de borda. No LetzPlay, a spec de cada tela costuma decidir (ex.: `NAVIGATION.md`, N14, N22 a N24): confira antes de propor.

- **Vazio:** nunca beco sem saída. Diga por que está vazio, em linguagem simples, e dê o próximo passo óbvio.
- **Carregando:** esqueleto com o formato do conteúdo para carga de conteúdo; barra determinada quando a duração é conhecida; spinner só para espera curta e desconhecida. Sem pulo de layout quando o conteúdo chega.
- **Erro:** onde, o quê e como sair, em linguagem simples. "Algo deu errado" sem próximo passo não é estado de erro.

## Checklist

- [ ] Houve **decisão de prioridade**, com algo cortado ou rebaixado?
- [ ] A tela tem **um foco principal** óbvio?
- [ ] Os **títulos sozinhos** contam a tela?
- [ ] O que importa vem **primeiro**?
- [ ] Conteúdo em **blocos**, não parede de texto?
- [ ] Destaque gasto nas palavras que **carregam sentido**?
- [ ] O estado principal se lê **de relance**, e não só por cor?
- [ ] Alguma vez há **mais de uma camada** empilhada? (Defeito.)
- [ ] Toda camada **fecha de forma óbvia**, não só por gesto?
- [ ] **Vazio, carregando e erro** desenhados, cada um com saída?
