# Tipografia

Detalhes de renderização de texto. Nenhum deles troca a escala tipográfica: tamanho, altura de linha e tracking vêm sempre dos tokens `--text-*` (`docs/TOKENS.md` > "Escala tipográfica semântica"), e a família é a Arimo.

## Quebra de linha

### `text-wrap: balance`

Distribui o texto por igual entre as linhas e evita a palavra sozinha no fim de um título. Só funciona em blocos curtos (até 6 linhas no Chromium, 10 no Firefox): o algoritmo é caro, e o navegador ignora em texto longo.

```css
/* Bom: título de seção ou de card */
.section__title {
  font-size: var(--text-title-sm-size);
  line-height: var(--text-title-sm-line-height);
  text-wrap: balance;
}
```

```css
/* Ruim: balance num parágrafo longo é ignorado em silêncio */
.description {
  text-wrap: balance;
}
```

### `text-wrap: pretty`

Evita a palavra sozinha na última linha sem tentar igualar as linhas. Funciona em texto de qualquer tamanho. É o padrão para texto curto e médio: descrição, legenda, item de lista, texto de card, mensagem de estado vazio.

```css
.empty-state__text {
  font-size: var(--text-body-md-size);
  line-height: var(--text-body-md-line-height);
  text-wrap: pretty;
}
```

### Qual usar

| Caso | Usar |
| --- | --- |
| Título curto, onde a distribuição igual importa | `balance` |
| Texto curto e médio de interface | `pretty` |
| Texto longo (10+ linhas), código | nenhum |

Rótulo de botão, chip ou aba é uma linha só: `text-wrap` não muda nada ali e não é achado.

## Números tabulares

Quando o número muda (placar, posição no ranking, delta, contador, timer), `tabular-nums` deixa todos os dígitos com a mesma largura, e o layout não pula quando o valor muda.

```css
.score__value {
  font-variant-numeric: tabular-nums;
}
```

| Usar | Não precisa |
| --- | --- |
| Placar, games, sets | Número estático decorativo |
| Posição e delta do ranking | Telefone, CEP |
| Contador, timer (reenviar código) | Ano, versão |
| Colunas numéricas alinhadas | |

Na Arimo, o `1` tabular fica mais largo e centralizado. É o esperado: conferir na story que o resultado está bom.

## Suavização de fonte (macOS)

O `styles/reset.css` já aplica `-webkit-font-smoothing: antialiased` e `-moz-osx-font-smoothing: grayscale` na raiz. Não repetir em componente: suavização por elemento deixa uns textos mais pesados que outros. Só é achado se alguém sobrescrever no componente.

## Família

A skill não troca a fonte. Suavização, quebra de linha e números tabulares são detalhes de renderização e não justificam mexer na família ou na escala.
