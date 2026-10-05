# Ícones

Peso, estados, tamanho e direção. O DS usa o Phosphor (`@phosphor-icons/react`) sempre pelo wrapper `<Icon icon={…} size="…" weight="…" />` (`.claude/rules/icones.md`; doc completa no `Icon.mdx`).

## Peso do ícone igual ao do texto

Um ícone ao lado de texto carrega o peso óptico do texto. No Phosphor, o traço é definido pelo `weight`, não por `stroke-width`. Num ícone de 24px, `regular` dá um traço de ~1,5px e `bold` de ~2,25px, o que casa com a tabela da fonte:

| Texto ao lado | `weight` do `<Icon />` |
| --- | --- |
| Regular (`--font-weight-regular`, 400) | `regular` (padrão) |
| Bold (`--font-weight-bold`, 700): rótulo de botão, título | `bold` |
| Estado ativo ou selecionado | `fill` |

O DS só tem os pesos 400 e 700. `thin` e `light` ficam traço fino demais ao lado de qualquer texto do app: são achado quando aparecem junto de texto.

Um `weight` por superfície: num mesmo card ou barra, os ícones de mesmo papel têm o mesmo peso. Ícone de outra biblioteca na mesma superfície é achado; os ícones próprios de `src/components/icons/` são marca e ficam fora dessa regra.

Tamanho: os tamanhos do `<Icon />` (`xs` 12, `sm` 16, `md` 24, `lg` 32, `xl` 64) seguem a grade nativa. Ao lado de texto `label-lg`/`body-md` (14px), `sm`; ao lado de `body-lg` (16px) ou título, `md`. Nada de tamanho fracionado por CSS.

## Um SVG, cor por estado

O `<Icon />` pinta com `currentColor`, e o componente que o contém define a cor. Hover, selecionado e desabilitado mudam a `color` do pai, nunca trocam o arquivo do ícone nem põem cor dentro do `<Icon />`.

```css
.tab {
  color: var(--color-foreground-secondary);
}
.tab[aria-selected="true"] {
  color: var(--color-foreground-primary);
}
.tab:disabled {
  color: var(--color-foreground-disabled);
}
```

## Contorno por padrão, preenchido no ativo

| Variante | Uso |
| --- | --- |
| Contorno (`regular`/`bold`) | Estado padrão: barra, linha de lista, junto de texto |
| Preenchido (`fill`) | Estado ativo: aba marcada, favorito ligado, curtido |

`fill` em todo lugar tira o sinal do ativo. A troca entre as variantes é uma troca de ícone: ver o cross-fade em [movimento.md](movimento.md).

## Desenhar no tamanho em que aparece

- Conferir cada ícone no menor tamanho em que ele aparece (em geral `sm`, 16px).
- Em tamanho pequeno, preferir um glifo mais simples a um detalhado reduzido.
- Sempre SVG.

## Direção (RTL)

O app é só pt-BR (LTR) hoje. Se um dia tiver RTL: setas e chevrons de navegação espelham; logo, check, relógio e controles de mídia não.

## Acessibilidade

Ícone decorativo fica escondido (padrão do `<Icon />`). Ícone com significado ganha `aria-label` e `aria-hidden={false}`. Botão só de ícone leva o `aria-label` no `<button>`, não no `<Icon />`.
