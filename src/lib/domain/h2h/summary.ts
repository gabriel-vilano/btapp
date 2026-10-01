import type { H2HConfrontation, H2HSummaryData } from './types';

// Resumo (docs/HEAD_TO_HEAD.md, HH10, HH11): sai da mesma lista de
// "Confrontos", para os números e as linhas nunca se contradizerem.

/**
 * Vitórias de cada lado, o total e a data do último confronto.
 * Ex.: `h2hSummary(h2hConfrontations(domain, view))` → `{ left_wins: 3, right_wins: 1, total: 4, … }`.
 */
export function h2hSummary(confrontations: H2HConfrontation[]): H2HSummaryData {
  const leftWins = confrontations.filter((match) => match.outcome === 'win').length;
  const latest = confrontations.reduce<string | null>(
    (last, match) => (last === null || Date.parse(match.played_at) > Date.parse(last) ? match.played_at : last),
    null,
  );
  return {
    left_wins: leftWins,
    right_wins: confrontations.length - leftWins,
    total: confrontations.length,
    last_played_at: latest,
  };
}
