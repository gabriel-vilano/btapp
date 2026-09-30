"use client";

import { TrophyIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import { ListItem } from "@/src/components/ui/ListItem";
import { formatNextMatch, formatTournamentDates, type TournamentNextMatchText } from "@/src/lib/tournamentDates";

interface TournamentSummaryItemProps {
  competitionName: string;
  categoryName: string;
  /** Nome do parceiro como aparece na linha ("Rafael"). Em simples, não passar. */
  partnerName?: string;
  /** Início do evento (ISO 8601). */
  startsOn: string;
  /** Fim do evento (ISO 8601); igual ao início no torneio de 1 dia. */
  endsOn: string;
  /** Próximo confronto já definido. Com ele, a linha mostra o jogo no lugar da data do evento. */
  nextMatch?: TournamentNextMatchText;
  href?: string;
  onClick?: () => void;
}

/**
 * Sua inscrição num torneio: competição · categoria, parceiro e a data do evento ou o próximo jogo.
 * Renderiza um `<li>`: use dentro de `<List>`.
 * @example <TournamentSummaryItem competitionName="Copa Tucum" categoryName="Masculino B" partnerName="Rafael" startsOn="2026-10-10T11:00:00Z" endsOn="2026-10-11T21:00:00Z" href="/competicoes/copa-tucum" />
 */
export function TournamentSummaryItem({
  competitionName,
  categoryName,
  partnerName,
  startsOn,
  endsOn,
  nextMatch,
  href,
  onClick,
}: TournamentSummaryItemProps) {
  const when = nextMatch ? formatNextMatch(nextMatch) : formatTournamentDates(startsOn, endsOn);
  return (
    <ListItem
      href={href}
      onClick={onClick}
      leading={<Icon icon={TrophyIcon} size="md" />}
      title={`${competitionName} · ${categoryName}`}
      supportingText={partnerName ? `com ${partnerName} · ${when}` : when}
    />
  );
}

export type { TournamentSummaryItemProps };
