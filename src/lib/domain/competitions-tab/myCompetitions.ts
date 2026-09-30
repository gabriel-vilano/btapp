import type { MyCompetitionItem, MyRankingItem, MyTournamentItem } from './types';

// Ordem de "Minhas competições" (docs/NAVIGATION.md, N29): rankings primeiro,
// da inscrição mais recente para a mais antiga; depois torneios, do mais
// próximo ao mais distante.

/**
 * Quando o torneio acontece para o jogador: o próximo jogo, se já há
 * confronto; senão, o início do evento.
 */
export function tournamentMoment(item: MyTournamentItem): string {
  return item.next_match?.starts_at ?? item.starts_on;
}

// No empate, o id deixa a lista estável entre renderizações
function byMostRecentEnrollment(x: MyRankingItem, y: MyRankingItem): number {
  return Date.parse(y.enrolled_at) - Date.parse(x.enrolled_at) || x.enrollment_id.localeCompare(y.enrollment_id);
}

function bySoonest(x: MyTournamentItem, y: MyTournamentItem): number {
  return (
    Date.parse(tournamentMoment(x)) - Date.parse(tournamentMoment(y)) ||
    x.enrollment_id.localeCompare(y.enrollment_id)
  );
}

/**
 * Lista de "Minhas competições" na ordem da N29. Não muda a lista recebida.
 * Ex.: `sortMyCompetitions(tab.competitions)` → rankings, depois torneios.
 */
export function sortMyCompetitions(items: MyCompetitionItem[]): MyCompetitionItem[] {
  const rankings = items.filter((item): item is MyRankingItem => item.kind === 'ranking');
  const tournaments = items.filter((item): item is MyTournamentItem => item.kind === 'tournament');
  return [...rankings.sort(byMostRecentEnrollment), ...tournaments.sort(bySoonest)];
}
