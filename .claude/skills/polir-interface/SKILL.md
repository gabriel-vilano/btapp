---
name: polir-interface
description: Polimento e revisão visual de componente do DS do LetzPlay (raio concêntrico, alinhamento óptico, peso do ícone, text-wrap, tabular-nums, contorno de imagem, motion contida), com revisão quick ou full. Use ao polir ou revisar o acabamento de um componente de src/components/, ou quando pedirem "/polir-interface". Não é a revisão geral de PR de UI.
---

# /polir-interface

Uma interface boa raramente vem de uma coisa só. Vem de detalhes pequenos que somam. Esta skill aplica esses detalhes a um componente do DS do LetzPlay, ao construir ou ao revisar. Argumento opcional: o modo (`quick` ou `full`) e o escopo (ex.: `quick src/components/ui/Button`).

O DS já decidiu muita coisa. Antes de propor qualquer mudança, ler o que o componente usa em `docs/TOKENS.md` e no MDX ao lado dele. A correção sempre vem escrita em CSS Modules com os tokens (`var(--spacing-*)`, `var(--radius-*)`, `var(--motion-*)`…), nunca em Tailwind, CSS inline ou valor bruto: um polimento que introduz um segundo sistema de estilo piora o código que queria melhorar.

## Referências

Ler a referência do tema quando ele estiver no escopo. Cada uma traz receitas em CSS com os nossos tokens.

| Tema | Quando ler |
| --- | --- |
| [Tipografia](referencias/tipografia.md) | Quebra de linha, números tabulares, suavização de fonte |
| [Superfícies](referencias/superficies.md) | Raio concêntrico, alinhamento óptico, sombra × borda, contorno de imagem, área tocável |
| [Movimento](referencias/movimento.md) | Transição × keyframes, entrada e saída, troca de ícone, press, contenção |
| [Ícones](referencias/icones.md) | `weight` do Phosphor ao lado do texto, estados por `currentColor`, contorno × preenchido |
| [Performance](referencias/performance.md) | Propriedades da transição, `will-change` |

## Princípios

1. **Raio concêntrico.** Raio externo = raio interno + distância entre as bordas. Vale quando a superfície interna (com fundo ou borda própria) encosta no canto da externa. Com mais de `--spacing-300` (24px) entre elas, são superfícies separadas e cada raio se escolhe sozinho.
2. **Alinhamento óptico antes do geométrico.** Botão com texto e ícone: o lado do ícone fica com ~2px a menos de padding que o lado do texto. Ícones assimétricos (play, seta, estrela) pedem ajuste à mão.
3. **Sombra é elevação; borda é estrutura ou estado.** No DS, sombra só no que flutua (`--shadow-subtle` na linha fixada, `--shadow-strong` no Toast e no Dialog). Os cards (`CardShell`) são chapados, sem borda e sem sombra, por decisão do Gabriel (D4). Borda de controle (Button secondary, Chip, Checkbox, FormInput) e divisor ficam. Sombra no lugar de borda só faria sentido numa superfície sobre fundo variado (foto, gradiente), que hoje o app não tem.
4. **Transição para mudança de estado.** Transição CSS pode ser interrompida no meio; keyframes recomeçam. Keyframes só em sequência que roda uma vez ou em loop (Spinner, Skeleton).
5. **Motion pelas regras do DS.** Curvas e durações vêm dos tokens `--motion-*` e das regras do Emil Kowalski adotadas pelo DS (D2): nada de ease-in em UI, transição de UI abaixo de 300ms, sem bounce em ação utilitária. Não usar os valores do Krehel (blur na entrada, `scale(0.96)`).
6. **Press é state layer, sem escala.** O DS dá o feedback de toque com o `::after` em `--color-state-layer-pressed` (D3). A falta de `scale()` no `:active` não é achado.
7. **Troca de ícone em cross-fade.** Os dois ícones ficam no DOM, um sobre o outro, e trocam por `opacity` e `transform` com transição. Nada de mostrar e esconder seco.
8. **Números que mudam são tabulares.** `font-variant-numeric: tabular-nums` em placar, posição, contador e timer. Número estático não precisa.
9. **Quebra de linha.** `text-wrap: balance` em títulos curtos; `text-wrap: pretty` em texto curto e médio (descrição, legenda, item de lista).
10. **Contorno de imagem.** Foto (avatar, logo de organização) ganha contorno de 1px por dentro (`outline-offset: -1px`), neutro e translúcido, para não sumir sobre fundo claro. A cor vem de token semântico: se `styles/tokens/semantic.css` não tiver um token para isso, o achado pede o token, sem escrever cor bruta.
11. **Área tocável de 48px.** Todo elemento interativo tem 48×48 (`--dimension-tap-target-minimum`), mesmo com ícone de 16px; o `padding` ou um pseudo-elemento completa a área. Duas áreas tocáveis nunca se sobrepõem.
12. **Peso do ícone igual ao do texto.** No `<Icon />`, `weight="regular"` ao lado de texto regular (400) e `weight="bold"` ao lado de texto bold (700). Um peso por superfície; `fill` só para o estado ativo.
13. **Um SVG por ícone, cor por estado.** O ícone usa `currentColor`; hover, selecionado e desabilitado mudam a cor no CSS de quem o contém, nunca outro arquivo.
14. **Nunca `transition: all`.** Nomear as propriedades que mudam.
15. **`will-change` com parcimônia.** Só `transform`, `opacity` ou `filter`, e só se houver engasgo no primeiro quadro.
16. **Contenção.** Interação frequente (hover de linha, digitação, troca de aba) tem resposta imediata ou uma transição de cor ou opacidade curta (até `--motion-duration-short-3`). O movimento nunca é o único sinal: cor, ícone ou texto também mudam. Com `prefers-reduced-motion`, menos movimento e mais suave, sem perder o sinal estático.

## O que já está resolvido no DS

Conferir, mas não repetir como achado se estiver certo: `-webkit-font-smoothing` no `styles/reset.css`; `:hover` dentro de `@media (hover: hover)`; foco por `:focus-visible` com `--color-state-focus-ring`; ícone sempre pelo `<Icon />` com `currentColor`; família Arimo.

## Erros comuns

| Erro | Correção |
| --- | --- |
| Mesmo raio no pai e no filho que encosta no canto | Raio externo = interno + distância |
| Ícone parece fora do centro | Ajuste óptico com padding, ou corrigir o SVG |
| Sombra em card chapado ou borda trocada por sombra num controle | Manter o DS: card chapado, borda no controle |
| `scale()` no `:active` | Tirar; o press é o state layer |
| Ease-in, bounce ou mais de 300ms numa transição de UI | Token de curva de entrada/saída e duração curta |
| Número que muda empurra o layout | `tabular-nums` |
| Título com uma palavra sozinha na última linha | `text-wrap: balance` |
| `transition: all` | Propriedades nomeadas |
| Controle pequeno com área menor que 48px | Pseudo-elemento ou padding até 48×48 |
| Ícone `light` ao lado de texto bold | `weight` igual ao peso do texto |
| Animação de entrada em hover ou tecla | Resposta imediata ou cor/opacidade curta |

## Formato da revisão

Sem modo informado, usar `full`. A saída vai para a conversa (e dali para o PR ou o Linear): nada de arquivo de relatório no repo, nada de abrir navegador.

| Modo | Cobertura | Limite de achados |
| --- | --- | --- |
| `quick` | O caminho principal e os estados mais usados; só `ALTA` e `MÉDIA` | 5 |
| `full` | O escopo inteiro, nos cinco temas | 15 |

### Escopo e cobertura

Dizer o modo, o escopo exato (arquivos) e os limites da revisão. Depois, o que foi de fato olhado:

| Tema | O que olhei | Resultado |
| --- | --- | --- |
| Tipografia | arquivos, estados ou checagens | n achados, `Ok`, ou `Não revisado` com o motivo |

As cinco linhas sempre aparecem (Tipografia, Superfícies, Movimento, Ícones, Performance). Nunca dar a entender que algo não olhado foi revisado.

### Achados

Agrupar por princípio, em tabela com **Severidade**, **Local**, **Antes**, **Depois** e **Por quê**. Toda mudança feita ou proposta entra, não um recorte.

- **Severidade:** `ALTA` torna uma interação inacessível, enganosa, ilegível ou repetidamente incômoda; `MÉDIA` cria um problema perceptível de uso ou de consistência; `BAIXA` é polimento isolado e só aparece no `full`.
- **Local:** `caminho/arquivo:linha`.
- **Antes / Depois:** o código atual e a troca, em CSS Modules com tokens.
- **Por quê:** o princípio e o efeito para o jogador.

Problema sistêmico vira uma linha só, com todos os locais. Princípio sem achado não aparece, e não se enche o relatório para chegar ao limite.

A skill é de polimento, não auditoria completa de acessibilidade, layout, cor ou texto. Um problema desses que aparecer de passagem (ex.: ring de foco cortado por `overflow: hidden`) vai numa seção **Fora do escopo** depois dos achados, em uma linha com local e motivo, sem contar no limite e sem entrar no veredito.

Exemplo:

#### Números tabulares
| Severidade | Local | Antes | Depois | Por quê |
| --- | --- | --- | --- | --- |
| MÉDIA | `src/components/ui/Exemplo/Exemplo.module.css:12` | `.score` sem `font-variant-numeric` | `font-variant-numeric: tabular-nums;` | O placar muda de largura a cada ponto e empurra o resto da linha |

### Considerados e rejeitados

De 1 a 3 candidatos reais no `quick` e de 2 a 5 no `full`:

| Local | Candidato | Rejeitado porque |
| --- | --- | --- |
| `…/CardShell.module.css:1` | Sombra em camadas no card | D4: cards chapados, sombra só para elevação |

Sem enchimento: se houver menos candidatos, listar os que existem e dizer isso.

### Verificação e veredito

1. **Verificação:** os comandos ou interações feitos e o que se viu (ex.: leitura do CSS, `npm run test:stories` no arquivo da story). O que depende de olhar a tela rodando (alinhamento óptico, motion em câmera lenta) e não foi visto fica como **Não verificado**, dizendo o que falta.
2. **Veredito:** `Bloquear` se sobrar achado `ALTA`, `Pedir mudanças` se sobrarem só `MÉDIA` ou `BAIXA`, `Aprovar` só sem achado acionável. Listar as checagens não verificadas ao lado.

Sem achados: omitir a tabela, escrever "Nenhum achado de polimento", e trazer a verificação, os rejeitados e o `Aprovar`.

## Origem e licença

Adaptada de [`jakubkrehel/make-interfaces-feel-better`](https://github.com/jakubkrehel/make-interfaces-feel-better), commit `35545ea1512ad59fa463e6b1f95ca9c052981fe6`, MIT © 2026 Jakub Krehel. Texto completo da licença em [`LICENSE.md`](LICENSE.md).

O que mudou em relação à fonte: tradução; exemplos em Tailwind e Motion trocados por CSS Modules com os tokens do DS; área tocável de 48px (a fonte pede 44/40); press só com state layer, sem `scale(0.96)` (D3); cards chapados e sombra só para elevação (D4); curvas e durações pelas regras de motion do DS (D2), sem blur na entrada; traço do ícone mapeado para o `weight` do Phosphor; contorno de imagem por token semântico em vez de `oklch(0 0 0 / 0.1)`; sem modo escuro; `description` restrita a componente do DS; verificação sem abrir navegador. A decisão de avaliar e adaptar a fonte está no documento "Avaliação de skills de mercado" do Linear.
