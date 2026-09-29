"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

// A própria linha na tabela: de que lado ela saiu da vista (RK9) e como
// rolar até ela. A linha é achada pela ordem na tabela, porque o RankingRow
// não recebe id: a tabela são uma ou duas <ol>, lidas em sequência.

/** Onde está a própria linha: à vista, acima (saiu por cima) ou abaixo. */
export type OwnRowSide = "visible" | "above" | "below";

/** Hash que abre a tela rolada até a própria linha (RK3). Ex.: `/ranking/masculino-b#minha-posicao`. */
export const OWN_ROW_HASH = "#minha-posicao";

// O AppHeader é sticky e cobre 56px do topo: a linha escondida atrás dele
// já saiu da vista
const HEADER_OFFSET = "-56px 0px 0px 0px";

function ownRowElement(table: HTMLElement | null, index: number | null): HTMLElement | null {
  if (table === null || index === null) return null;
  return table.querySelectorAll<HTMLElement>("ol > li").item(index) ?? null;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Acompanha a própria linha e devolve o lado em que ela está e a função que
 * rola até ela. Sem linha própria (`index` null), o lado é null.
 * Ex.: `const { side, scrollToOwnRow } = useOwnRow(tableRef, 8, false)`.
 */
export function useOwnRow(tableRef: RefObject<HTMLElement | null>, index: number | null, scrollOnOpen: boolean) {
  const [side, setSide] = useState<OwnRowSide | null>(null);

  useEffect(() => {
    const row = ownRowElement(tableRef.current, index);
    if (row === null) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSide("visible");
        else setSide(entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0) ? "above" : "below");
      },
      { rootMargin: HEADER_OFFSET },
    );
    observer.observe(row);
    return () => observer.disconnect();
  }, [tableRef, index]);

  const scrollToOwnRow = useCallback(
    (focus: boolean) => {
      const row = ownRowElement(tableRef.current, index);
      if (row === null) return;
      row.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
      if (focus) row.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
    },
    [tableRef, index],
  );

  useEffect(() => {
    if (scrollOnOpen || window.location.hash === OWN_ROW_HASH) {
      ownRowElement(tableRef.current, index)?.scrollIntoView({ block: "center" });
    }
  }, [tableRef, index, scrollOnOpen]);

  return { side: index === null ? null : side, scrollToOwnRow };
}
