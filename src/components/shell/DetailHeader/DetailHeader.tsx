"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AppHeader, type AppHeaderProps } from "@/src/components/ui/AppHeader";
import { useShellNavigation } from "@/src/components/shell/AppShell";
import type { MainTab } from "@/src/lib/navigation/mainTabs";

type DetailHeaderProps = Omit<AppHeaderProps, "backHref"> & {
  /**
   * Aba de quem chega sem origem no app, quando só a tela sabe qual é (N28): a
   * competição em que o jogador não está inscrito cai no Explorar. Sem ela, vale a rota.
   */
  arrivalTab?: MainTab;
};

/**
 * Cabeçalho das telas de detalhe (partida, jogador, competição): o "Voltar" leva à
 * raiz da aba marcada, a de origem ou a da N28, como ela estava (NAVIGATION.md, N10).
 * @example <DetailHeader title="Ranking Arena Mangaba" arrivalTab={competitionArrivalTab(isEnrolled)} />
 */
export function DetailHeader({ arrivalTab, ...props }: DetailHeaderProps) {
  const { backHref, declareArrivalTab } = useShellNavigation();
  const pathname = usePathname();

  // Só pesa na chegada sem origem: de dentro do app, vale a aba de origem (N10).
  // O HTML do servidor marca a aba da rota, e a declarada entra na hidratação
  useEffect(() => {
    if (arrivalTab) declareArrivalTab(pathname, arrivalTab);
  }, [arrivalTab, declareArrivalTab, pathname]);

  return <AppHeader {...props} backHref={backHref} />;
}
