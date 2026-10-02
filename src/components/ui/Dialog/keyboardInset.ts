/** Abaixo disso a diferença é barra do navegador, não teclado (o menor teclado passa de 200px). */
export const MIN_KEYBOARD_HEIGHT = 100;

type ViewportMeasure = {
  layoutHeight: number;
  visualHeight: number;
  visualOffsetTop: number;
  visualScale: number;
};

/**
 * Altura do teclado que cobre a base da tela, em px; 0 com o teclado fechado.
 * É o que sobra entre o fim da área visível (offsetTop + height) e o fim da
 * viewport de layout, onde o painel está preso.
 */
export function computeKeyboardInset(measure: ViewportMeasure): number {
  // Com zoom de pinça o visual viewport também encolhe, mas não há teclado
  if (measure.visualScale > 1) return 0;
  const covered =
    measure.layoutHeight - measure.visualHeight - measure.visualOffsetTop;
  return covered >= MIN_KEYBOARD_HEIGHT ? Math.round(covered) : 0;
}
