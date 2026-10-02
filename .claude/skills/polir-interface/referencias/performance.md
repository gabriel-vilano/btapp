# Performance

Quais propriedades a transição observa e quando usar `will-change`.

## Transicionar só o que muda

Nunca `transition: all`. Nomear as propriedades que mudam, com os tokens de duração e curva.

Por quê:

- `all` faz o navegador observar todas as propriedades;
- anima o que não devia (padding, cor de borda, sombra) quando outra regra muda;
- atrapalha otimizações do navegador.

```css
/* Bom: só o que muda */
.chip {
  transition:
    background-color var(--motion-duration-short-3) var(--motion-easing-standard),
    color var(--motion-duration-short-3) var(--motion-easing-standard);
}

/* Ruim */
.chip {
  transition: all var(--motion-duration-short-3) var(--motion-easing-standard);
}
```

O padrão do DS já é esse (o state layer transiciona só `background-color`). Achado é qualquer `all`, ou uma propriedade de layout (`width`, `height`, `top`, `padding`) na transição quando `transform` daria o mesmo efeito.

## `will-change` com parcimônia

`will-change` pede ao navegador para promover o elemento a uma camada própria antes da animação. Sem ele, a promoção acontece quando a animação começa e pode engasgar o primeiro quadro.

| Propriedade | Vai para a GPU | Vale `will-change` |
| --- | --- | --- |
| `transform` | Sim | Sim |
| `opacity` | Sim | Sim |
| `filter` | Sim | Sim |
| `clip-path` | Só no Chromium novo | Raramente |
| `top`, `left`, `width`, `height` | Não | Não |
| `background`, `border`, `color` | Não | Não |

```css
/* Bom: propriedade que a GPU compõe */
.sheet {
  will-change: transform;
}

/* Ruim */
.sheet {
  will-change: all;
}
```

Só adicionar quando houver engasgo visível no primeiro quadro (o Safari do iOS é o que mais se beneficia). Cada camada extra custa memória, e num celular de entrada isso pesa: não pôr em todo elemento animado por precaução.
