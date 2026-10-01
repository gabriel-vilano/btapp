import { isPlayedMatch, resultOf, sideUnitsResolver, type ConfirmedMatch } from '../match-count/playedMatch';
import { playedAt } from '../profile/recentMatches';
import { isOnSide } from './perspective';
import type { H2HDomain, H2HForm, H2HSide } from './types';

// Forma recente (docs/HEAD_TO_HEAD.md, HH12): as últimas partidas jogadas de
// um lado, contra qualquer adversário. Na página de duplas, da dupla (a
// unidade); na de jogadores, do jogador com qualquer parceiro. W.O. não é
// partida jogada (R18) e fica fora, como no resto da página (HH11).

export const H2H_FORM_LIMIT = 5;

type FormEntry = { played_at: string; match_id: string; outcome: 'win' | 'loss' };

function entryOf(match: ConfirmedMatch, sidesOf: ReturnType<typeof sideUnitsResolver>, side: H2HSide): FormEntry | null {
  const { a, b } = sidesOf(match);
  const key = isOnSide(a, side) ? 'a' : isOnSide(b, side) ? 'b' : null;
  const result = resultOf(match);
  if (key === null || result.type === 'double_wo') return null;
  return { played_at: playedAt(match), match_id: match.id, outcome: result.winner === key ? 'win' : 'loss' };
}

function byOldest(x: FormEntry, y: FormEntry): number {
  return Date.parse(x.played_at) - Date.parse(y.played_at) || x.match_id.localeCompare(y.match_id);
}

/**
 * Até `limit` resultados do lado, da mais antiga para a mais recente (a mais
 * recente fica à direita no FormGuide). Sem partidas, a lista vem vazia.
 * Ex.: `h2hForm(mockH2HDomain, { kind: 'player', player_id: 'player-lucas' })` → `['win', …]`.
 */
export function h2hForm(domain: H2HDomain, side: H2HSide, limit = H2H_FORM_LIMIT): H2HForm {
  const sidesOf = sideUnitsResolver(domain);
  return domain.matches
    .filter(isPlayedMatch)
    .map((match) => entryOf(match, sidesOf, side))
    .filter((entry): entry is FormEntry => entry !== null)
    .sort(byOldest)
    .slice(-limit)
    .map((entry) => entry.outcome);
}
