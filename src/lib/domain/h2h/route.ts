import type { DoublesUnit, Player } from '@/src/types/domain';
import type { H2HDomain, H2HSide } from './types';

// Rota da página de H2H (docs/HEAD_TO_HEAD.md, HH5): `/h2h/[ladoA]/[ladoB]`.
// O lado é o @username do jogador ou os dois da dupla unidos por `+`, em
// ordem alfabética, para cada dupla ter uma URL só (N10). A ordem dos lados
// é a perspectiva (HH6), não a identidade.

export const H2H_PATH = '/h2h';

const PAIR_SEPARATOR = '+';
const SEGMENT_FORMAT = "'username' ou dois unidos por '+' (ex.: 'lucassilva+rafaelcosta')";

/** Lados lidos da URL, ou o motivo do "H2H não encontrado" (§6.1). */
export type H2HRouteResult =
  | { status: 'found'; sides: [H2HSide, H2HSide]; canonical_path: string }
  | { status: 'not_found'; reason: string };

function sideSegment(usernames: string[]): string {
  return [...usernames].sort().map(encodeURIComponent).join(PAIR_SEPARATOR);
}

/**
 * URL da página de H2H; a dupla entra em ordem alfabética, seja qual for a ordem recebida.
 * Ex.: `h2hPath(['rafaelcosta', 'lucassilva'], ['pedrohenrique', 'thiagomendes'])`
 * → "/h2h/lucassilva+rafaelcosta/pedrohenrique+thiagomendes".
 */
export function h2hPath(left: string[], right: string[]): string {
  return `${H2H_PATH}/${sideSegment(left)}/${sideSegment(right)}`;
}

function notFound(reason: string): H2HRouteResult {
  return { status: 'not_found', reason };
}

function safeDecode(raw: string): string | null {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

/** Os @usernames de um lado da URL, ou null quando o segmento não tem o formato. */
export function parseSideSegment(raw: string): string[] | null {
  const usernames = safeDecode(raw)?.split(PAIR_SEPARATOR);
  if (usernames === undefined || usernames.length > 2) return null;
  if (usernames.some((username) => username.trim() === '')) return null;
  return usernames;
}

// O mesmo jogador duas vezes ('lucassilva+lucassilva') não é dupla
function findDoubles(domain: H2HDomain, [x, y]: Player[]): DoublesUnit | null {
  if (x.id === y.id) return null;
  const unit = domain.units.find(
    (candidate): candidate is DoublesUnit =>
      candidate.modality === 'doubles' && candidate.player_ids.includes(x.id) && candidate.player_ids.includes(y.id),
  );
  return unit ?? null;
}

type SideLookup = { side: H2HSide } | { reason: string };

function lookupSide(domain: H2HDomain, raw: string): SideLookup {
  const usernames = parseSideSegment(raw);
  if (usernames === null) return { reason: `Lado do H2H inválido: recebi '${raw}', esperado ${SEGMENT_FORMAT}` };
  const found = usernames.map((username) => domain.players.find((player) => player.username === username));
  const missing = usernames.find((_, index) => found[index] === undefined);
  if (missing !== undefined) return { reason: `H2H: o @username '${missing}' não existe, esperado o @username de um jogador` };
  const players = found.filter((player): player is Player => player !== undefined);
  if (players.length === 1) return { side: { kind: 'player', player_id: players[0].id } };
  const unit = findDoubles(domain, players);
  if (unit === null) return { reason: `H2H: '${raw}' nunca formaram uma dupla, esperado dois jogadores de uma mesma dupla` };
  return { side: { kind: 'unit', unit_id: unit.id, player_ids: unit.player_ids } };
}

function sidePlayers(side: H2HSide): string[] {
  return side.kind === 'player' ? [side.player_id] : side.player_ids;
}

// Os dois lados são do mesmo tipo e não têm jogador em comum: sem isso, não houve confronto possível
function sidesMismatch(a: H2HSide, b: H2HSide, raw: string): string | null {
  if (a.kind !== b.kind) return `H2H: recebi um jogador e uma dupla em '${raw}', esperado dois jogadores ou duas duplas`;
  const shared = sidePlayers(a).some((id) => sidePlayers(b).includes(id));
  return shared ? `H2H: os lados de '${raw}' têm jogador em comum, esperado dois lados diferentes` : null;
}

/**
 * Lê `/h2h/[ladoA]/[ladoB]`. @username inexistente, lados iguais e dupla
 * que nunca existiu dão "H2H não encontrado" (§6.1). A dupla fora da ordem
 * alfabética é encontrada, e `canonical_path` diz a URL única dela.
 * Ex.: `resolveH2HRoute(mockH2HDomain, 'lucassilva', 'pedrohenrique')`.
 */
export function resolveH2HRoute(domain: H2HDomain, rawA: string, rawB: string): H2HRouteResult {
  const [a, b] = [lookupSide(domain, rawA), lookupSide(domain, rawB)];
  if ('reason' in a) return notFound(a.reason);
  if ('reason' in b) return notFound(b.reason);
  const mismatch = sidesMismatch(a.side, b.side, `${rawA}/${rawB}`);
  if (mismatch !== null) return notFound(mismatch);
  const canonical = h2hPath(parseSideSegment(rawA) ?? [], parseSideSegment(rawB) ?? []);
  return { status: 'found', sides: [a.side, b.side], canonical_path: canonical };
}
