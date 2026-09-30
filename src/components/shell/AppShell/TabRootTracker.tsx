"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type TabRootTrackerProps = {
  onVisit: (pathname: string, search: string) => void;
};

/**
 * Avisa a casca de cada URL visitada, com a query, para o "Voltar" levar à raiz
 * da aba como ela estava (N10). Não renderiza nada.
 * Fica num componente próprio, dentro de um `<Suspense>`: o `useSearchParams`
 * tira do pré-render tudo até o `<Suspense>` mais próximo, e aqui isso é só ele
 * (docs do Next, `use-search-params.md`, "Prerendering").
 */
export function TabRootTracker({ onVisit }: TabRootTrackerProps) {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    onVisit(pathname, search);
  }, [onVisit, pathname, search]);

  return null;
}
