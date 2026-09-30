import type { Enrollment, Player, SeasonFinal } from '@/src/types/domain';
import { cutoffLine } from '../roundClose';
import { computeStandings, type StandingRow } from '../standings';
import type { StandingsScope } from '../standingsStats';
import { cutoffDistance, lineRecords, positionDeltas, type LineRecord } from '../ranking-table';
import type { CutoffDivider, RankingLine, RankingPlayer } from './types';
import type { RankingScreenDomain } from './rankingScreen';

// A tabela da classificação (docs/RANKING.md §4): as linhas com jogos,
// vitórias, delta e distância da vaga, e onde passa a linha de corte.

/** Jogadores de uma inscrição, na ordem da unidade. */
export function enrollmentPlayers(domain: RankingScreenDomain, enrollment: Enrollment): RankingPlayer[] {
  const unit = domain.units.find((candidate) => candidate.id === enrollment.unit_id);
  if (unit === undefined) {
    throw new Error(`Classificação: unidade '${enrollment.unit_id}' da inscrição '${enrollment.id}' não existe`);
  }
  return unit.player_ids.map((id) => pickPlayer(domain.players, id));
}

function pickPlayer(players: Player[], id: string): RankingPlayer {
  const player = players.find((candidate) => candidate.id === id);
  if (player === undefined) throw new Error(`Classificação: jogador '${id}' não existe nas tabelas`);
  return { id: player.id, name: player.name, username: player.username, avatar_url: player.avatar_url };
}

/**
 * A inscrição do jogador na categoria: a ativa, se houver. A encerrada por
 * troca de parceiro aparece como as outras encerradas (4.1), a não ser que
 * seja a única dele, como numa temporada antiga aberta pelo perfil (RK21).
 */
export function ownEnrollment(domain: RankingScreenDomain, enrollments: Enrollment[], viewerId: string): Enrollment | null {
  const mine = enrollments.filter((enrollment) =>
    domain.units.some((unit) => unit.id === enrollment.unit_id && unit.player_ids.includes(viewerId)),
  );
  return mine.find((enrollment) => enrollment.status === 'active') ?? mine[0] ?? null;
}

interface LineContext {
  domain: RankingScreenDomain;
  records: Map<string, LineRecord>;
  deltas: Map<string, number>;
  ownId: string | null;
  distanceOf: (enrollmentId: string) => RankingLine['cutoff_distance'];
}

function toLine(row: StandingRow, enrollment: Enrollment, ctx: LineContext): RankingLine {
  const record = ctx.records.get(row.enrollment_id) ?? { played: 0, wins: 0 };
  const isOwn = row.enrollment_id === ctx.ownId;
  return {
    enrollment_id: row.enrollment_id,
    players: enrollmentPlayers(ctx.domain, enrollment),
    position: row.position,
    points: row.points,
    played: record.played,
    wins: record.wins,
    delta: ctx.deltas.get(row.enrollment_id) ?? null,
    status: row.enrollment_status,
    awaiting_admin: row.awaiting_admin,
    is_own: isOwn,
    cutoff_distance: isOwn ? ctx.distanceOf(row.enrollment_id) : null,
  };
}

/** Onde a linha de corte passa, ou null quando a tabela não tem divisor (4.5). */
function cutoffSplit(rows: StandingRow[], final: SeasonFinal | null, afterCutoff: boolean) {
  if (final === null) return null;
  const active = rows.filter((row) => row.enrollment_status === 'active');
  if (active.length <= final.qualifiers) return null;
  const cut = cutoffLine(rows, final.qualifiers);
  const lastIn = rows.findIndex((row) => row.enrollment_id === cut.qualified_ids.at(-1));
  const divider: CutoffDivider = {
    final_name: final.name,
    qualifiers: final.qualifiers,
    after_cutoff: afterCutoff,
    awaiting_admin: cut.awaiting_admin,
  };
  return { index: lastIn + 1, divider };
}

// A linha sai de `computeStandings`, que só devolve inscrições do escopo
function enrollmentOf(scope: StandingsScope, id: string): Enrollment {
  const enrollment = scope.enrollments.find((candidate) => candidate.id === id);
  if (enrollment === undefined) throw new Error(`Classificação: inscrição '${id}' não existe no escopo`);
  return enrollment;
}

export interface RankingTable {
  qualified: RankingLine[];
  outside: RankingLine[];
  divider: CutoffDivider | null;
  has_tie: boolean;
}

/**
 * Linhas da classificação em `now`, partidas na linha de corte da final.
 * Ex.: `rankingTable(domain, scope, season.final, ownId, now, false)`.
 */
export function rankingTable(
  domain: RankingScreenDomain,
  scope: StandingsScope,
  final: SeasonFinal | null,
  ownId: string | null,
  now: string,
  afterCutoff: boolean,
): RankingTable {
  const rows = computeStandings(scope, now);
  const ctx: LineContext = {
    domain,
    records: lineRecords(scope, now),
    deltas: positionDeltas(scope, domain.standingSnapshots, now),
    ownId,
    distanceOf: (id) => cutoffDistance(rows, final, id, now),
  };
  const lines = rows.map((row) => toLine(row, enrollmentOf(scope, row.enrollment_id), ctx));
  const split = cutoffSplit(rows, final, afterCutoff);
  const index = split?.index ?? lines.length;
  return {
    qualified: lines.slice(0, index),
    outside: lines.slice(index),
    divider: split?.divider ?? null,
    has_tie: rows.some((row) => row.awaiting_admin),
  };
}
