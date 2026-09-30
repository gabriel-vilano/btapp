"use client";

import { AppHeader, type AppHeaderProps } from "@/src/components/ui/AppHeader";
import { useShellNavigation } from "@/src/components/shell/AppShell";

type DetailHeaderProps = Omit<AppHeaderProps, "backHref">;

/**
 * Cabeçalho das telas de detalhe (partida, jogador, competição): o "Voltar" leva à
 * aba marcada, a de origem ou a da N28 (NAVIGATION.md, N10).
 * @example <DetailHeader title="Lucas e Rafael × Pedro e João" />
 */
export function DetailHeader(props: DetailHeaderProps) {
  const { backHref } = useShellNavigation();
  return <AppHeader {...props} backHref={backHref} />;
}
