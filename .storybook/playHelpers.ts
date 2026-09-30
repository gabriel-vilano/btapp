// Utilitários para o `play` das stories. Regra de escrita em CLAUDE.md > "Testes"

/**
 * Resolve na primeira entrega de IntersectionObserver do documento.
 *
 * Todos os observers são calculados no mesmo passo de renderização e avisados
 * na ordem em que nasceram: quando este é avisado, os observers que o
 * componente criou antes (ao montar) já foram. Rolar antes disso pode perder a
 * rolagem no Chromium sob carga, porque o primeiro cálculo sai com a posição de
 * antes e o observer não recalcula mais (ENG-127).
 *
 * @example
 * await firstIntersectionDelivered(await canvas.findByRole("list"));
 * view.scrollTo({ top: 9999, behavior: "instant" });
 */
export function firstIntersectionDelivered(target: Element): Promise<void> {
  return new Promise((resolve) => {
    const probe = new IntersectionObserver(() => {
      probe.disconnect();
      resolve();
    });
    probe.observe(target);
  });
}
