# Superfícies

Raio concêntrico, alinhamento óptico, sombra × borda, contorno de imagem e área tocável.

## Raio concêntrico

Quando uma superfície arredondada fica dentro de outra, o raio externo é o interno mais a distância entre elas:

```
raio externo = raio interno + distância
```

A regra vale quando a superfície interna tem fundo ou borda próprios **e** encosta no canto da externa, com pouca distância dos dois lados do canto. Conteúdo solto no corpo do card (texto, um botão no meio da coluna) não forma canto aninhado. Com mais de 24px (`--spacing-300`) entre as bordas, são superfícies separadas: cada raio se escolhe sozinho.

Escala de raio do DS: `--radius-sm` 4px, `--radius-md` 8px, `--radius-lg` 16px, `--radius-xl` 24px (semânticos: `--radius-form-input`, `--radius-card`, `--radius-popover`).

```css
/* Bom: 8 + 8 = 16 */
.panel {
  border-radius: var(--radius-lg);
  padding: var(--spacing-100);
}
.panel__inner {
  border-radius: var(--radius-md);
}

/* Ruim: mesmo raio nos dois, o canto de dentro parece espremido */
.panel {
  border-radius: var(--radius-md);
  padding: var(--spacing-100);
}
.panel__inner {
  border-radius: var(--radius-md);
}
```

Quando a conta não cai num token (ex.: 8 + 6 = 14), preferir ajustar a distância a um passo da escala de espaçamento a criar um raio fora da escala.

## Alinhamento óptico

Quando o centro geométrico parece torto, alinhar pelo olho.

### Botão com texto e ícone

O ícone tem menos massa visual que o texto, então o lado dele pede ~2px a menos de padding. O ajuste vai no padding do lado do ícone:

```css
/* Ícone à direita: o lado do ícone perde 2px */
.btn--trailing-icon {
  padding-inline-start: var(--spacing-300);
  padding-inline-end: calc(var(--spacing-300) - var(--spacing-25));
}

/* Ruim: padding igual, o ícone parece empurrado para a borda */
.btn--trailing-icon {
  padding-inline: var(--spacing-300);
}
```

### Ícones assimétricos

Play, setas, chevrons e estrelas têm o centro visual fora do centro geométrico. O melhor ajuste é no SVG (só possível nos ícones próprios de `src/components/icons/`). Num ícone do Phosphor, o ajuste fica num `margin` pequeno no CSS de quem o contém, nunca no `<Icon />`.

```css
.play-button__icon {
  margin-inline-start: var(--spacing-25); /* o triângulo pesa para a esquerda */
}
```

Alinhamento óptico se confirma olhando a tela. Sem a story aberta, o achado fica marcado como **Não verificado**.

## Sombra é elevação; borda é estrutura

No DS do LetzPlay:

- **Sombra** só no que flutua acima do conteúdo: `--shadow-subtle` (linha fixada do ranking, `AvatarUpload`) e `--shadow-strong` (Toast, Dialog).
- **Borda** só em controle e em estado: Button secondary, Chip, Checkbox, FormInput, foco e seleção. Divisores (`--color-border-subtle`) também são borda.
- **Cards** (`CardShell`) são chapados: fundo `--color-background-primary`, sem borda e sem sombra, separados pelo espaço entre eles (decisão D4).

A fonte original recomenda trocar borda por sombra em camadas em cards e botões. Isso resolve um problema que o app não tem: a sombra translúcida se adapta a fundo variado (foto, gradiente, modo escuro), e uma borda sólida não. Por isso:

- não é achado: card sem sombra, controle com borda, falta de modo escuro;
- é achado: sombra num elemento que não flutua (sinal de elevação diluído), borda usada só para fingir profundidade, cor de sombra fora dos tokens `--shadow-*`;
- reabrir a regra só se aparecer superfície sobre foto ou gradiente, ou se o app ganhar modo escuro. Nesse caso, apontar como pergunta ao Gabriel, não como correção.

## Contorno de imagem

Foto de usuário ou logo (Avatar, AvatarUpload, logo de organização) pode sumir no fundo branco quando a imagem tem borda clara. Um contorno de 1px por dentro dá a mesma borda a todas, sem mexer no tamanho:

```css
.avatar {
  outline: var(--border-width-medium) solid var(--color-…); /* token de contorno de imagem */
  outline-offset: calc(-1 * var(--border-width-medium)); /* por dentro: não soma no layout */
}
```

Regras da cor:

- **neutra e translúcida** (preto com opacidade baixa, perto de 0,1), nunca um cinza da paleta sólido nem a cor de marca. Um tom sólido pega a cor do fundo e parece sujeira na borda da foto;
- **vem de token semântico.** Se o `styles/tokens/semantic.css` tiver um token de contorno de imagem, usar. Se não tiver, não escrever `rgba()`/`oklch()` no componente: o achado pede a criação do token (em `semantic.css`, apontando para a escala `--opacity-*`), e a decisão de criar é do Gabriel.

`outline` em vez de `border` porque não altera largura nem altura. Atenção: se o elemento também recebe foco (`:focus-visible` usa `outline`), o contorno vai num pseudo-elemento ou num `box-shadow` inset, para não brigar com o ring de foco.

Placeholder e iniciais (sem foto) não precisam de contorno: o fundo `--color-background-tertiary` já recorta.

## Área tocável de 48px

Todo elemento interativo tem área de 48×48 (`--dimension-tap-target-minimum`, `docs/TOKENS.md` > "Acessibilidade — tap target"), mesmo o botão só de ícone com ícone `sm`. A fonte original aceita 44 ou 40; o DS do LetzPlay é mais rígido e fica com 48.

Se o visível for menor, completar com padding ou com pseudo-elemento:

```css
.checkbox {
  position: relative;
  width: var(--dimension-icon-md);
  height: var(--dimension-icon-md);
}

.checkbox::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--dimension-tap-target-minimum);
  height: var(--dimension-tap-target-minimum);
  transform: translate(-50%, -50%);
}
```

O `::after` costuma estar ocupado pelo state layer (`docs/TOKENS.md` > "State layers"): usar o `::before` para a área.

**Colisão:** se a área estendida sobrepõe outro elemento interativo, diminuir o pseudo-elemento até não colidir, o maior possível. Duas áreas tocáveis nunca se sobrepõem. Se nem assim cabe 48px, o problema é de layout (espaço entre os controles), e o achado vai para o layout.
