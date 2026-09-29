import type { CompetitionMatch } from '@/src/types/domain';
import { playerHeadToHead, type HeadToHeadRecord } from '../match-count/headToHead';
import { hasPlayer, sideUnitsResolver, type MatchCountDomain } from '../match-count/playedMatch';

// Bloco "Vocês" do perfil de outro jogador (docs/PROFILE.md, PF16 e PF17):
// o próximo confronto entre quem vê e o jogador, e o H2H jogador × jogador.
// Sem nenhum dos dois, o bloco some (PF2).

/** O que o bloco "Vocês" mostra, do ponto de vista de quem vê. */
export interface ProfileVersus {
  next_match_id: string | null; // confronto definido entre os dois (R7), o mais próximo
  head_to_head: HeadToHeadRecord | null; // "você venceu 2": vitórias de quem vê (R19)
}

type DefinedMatch = Extract<CompetitionMatch, { status: 'defined' }>;

// Com data acordada primeiro, pela data; sem data, pela ordem do sorteio
function bySchedule(x: DefinedMatch, y: DefinedMatch): number {
  const [sx, sy] = [x.scheduled_at, y.scheduled_at];
  if (sx !== null && sy !== null) return Date.parse(sx) - Date.parse(sy);
  if (sx !== sy) return sx === null ? 1 : -1;
  return Date.parse(x.created_at) - Date.parse(y.created_at);
}

/** Confronto definido (ranking ou torneio) com um jogador de cada lado. */
function nextMatchBetween(domain: MatchCountDomain, xId: string, yId: string): DefinedMatch | null {
  const sidesOf = sideUnitsResolver(domain);
  const faces = (match: DefinedMatch) => {
    const { a, b } = sidesOf(match);
    return (hasPlayer(a, xId) && hasPlayer(b, yId)) || (hasPlayer(a, yId) && hasPlayer(b, xId));
  };
  const defined = domain.matches.filter(
    (match): match is DefinedMatch => match.kind !== 'friendly' && match.status === 'defined',
  );
  return defined.filter(faces).sort(bySchedule)[0] ?? null;
}

/**
 * Bloco "Vocês" de `playerId` visto por `viewerId`, ou null quando o bloco
 * não existe: no próprio perfil, e sem confronto nem H2H entre os dois.
 * Ex.: `profileVersus(mockDomain, players.pedro.id, players.lucas.id)`.
 */
export function profileVersus(domain: MatchCountDomain, playerId: string, viewerId: string): ProfileVersus | null {
  if (playerId === viewerId) return null;
  const next = nextMatchBetween(domain, viewerId, playerId);
  const record = playerHeadToHead(domain, viewerId, playerId);
  const headToHead = record.match_ids.length > 0 ? record : null;
  if (next === null && headToHead === null) return null;
  return { next_match_id: next?.id ?? null, head_to_head: headToHead };
}
