import type { StandingSnapshot } from '@/src/types/domain';
import { computeStandings } from '../standings';
import { countedMatches } from '../standingsStats';
import {
  hasSeasonEnded,
  partnerOf,
  playerSeasonEnrollments,
  scopeOf,
  seasonOf,
  unitOf,
  type ProfileDomain,
  type SeasonEnrollment,
} from './profileDomain';

// Seção "Rankings" do perfil (docs/PROFILE.md, PF10–PF15): uma linha por
// inscrição ativa do jogador em temporada que ainda não terminou. A variação
// de posição (PF13) é a da tabela (RANKING.md, RK12) e vem da função dela.

/** Uma linha de "Rankings": o dado do StandingSummaryItem, sem os nomes. */
export interface ProfileRankingRow {
  enrollment_id: string;
  competition_id: string;
  category_id: string;
  season_id: string;
  partner_id: string | null; // em simples, null
  // null enquanto a categoria não tem partida confirmada: a tabela ainda não
  // tem posição (RANKING.md, RK20)
  position: number | null;
  // "Melhor: 3º" (PF14): só no próprio perfil, e só quando é melhor que a atual
  best_position: number | null;
}

/** Quem vê o perfil de quem, e em que momento. */
export interface ProfileViewer {
  playerId: string; // dono do perfil
  viewerId: string; // quem está vendo; igual ao dono no próprio perfil
  now: string; // ISO 8601
}

/**
 * Melhor posição da inscrição na temporada (PF14): a menor entre as fotos de
 * fim de rodada (R46) e a posição ao vivo. Devolve null quando não é melhor
 * que a atual, porque aí a linha não mostra o complemento.
 * Ex.: `bestPosition(mockDomain.standingSnapshots, masculinoB.t1.id, 2)` → `1`.
 */
export function bestPosition(snapshots: StandingSnapshot[], enrollmentId: string, live: number | null): number | null {
  const photos = snapshots.filter((s) => s.enrollment_id === enrollmentId).map((s) => s.position);
  if (live === null || photos.length === 0) return null;
  const best = Math.min(live, ...photos);
  return best < live ? best : null;
}

/** Posição ao vivo da inscrição, ou null quando a categoria ainda não tem jogo confirmado. */
export function livePosition(domain: ProfileDomain, enrollment: SeasonEnrollment): number | null {
  const scope = scopeOf(domain, enrollment);
  if (countedMatches(scope).length === 0) return null;
  const row = computeStandings(scope).find((candidate) => candidate.enrollment_id === enrollment.id);
  return row?.position ?? null;
}

/**
 * Inscrições de "Rankings": ativas (a encerrada por troca de parceiro fica
 * de fora, PF15) e em temporada ainda aberta (a encerrada vai para
 * "Temporadas", PF19).
 */
export function currentEnrollments(domain: ProfileDomain, playerId: string, now: string): SeasonEnrollment[] {
  return playerSeasonEnrollments(domain, playerId).filter(
    (enrollment) => enrollment.status === 'active' && !hasSeasonEnded(seasonOf(domain, enrollment), now),
  );
}

function toRow(domain: ProfileDomain, enrollment: SeasonEnrollment, view: ProfileViewer): ProfileRankingRow {
  const position = livePosition(domain, enrollment);
  const isOwn = view.viewerId === view.playerId;
  return {
    enrollment_id: enrollment.id,
    competition_id: seasonOf(domain, enrollment).ranking_id,
    category_id: enrollment.category_id,
    season_id: enrollment.season_id,
    partner_id: partnerOf(unitOf(domain, enrollment), view.playerId),
    position,
    best_position: isOwn ? bestPosition(domain.standingSnapshots, enrollment.id, position) : null,
  };
}

// Sem posição vai para o fim; no empate, a ordem do id deixa a lista estável
function byPosition(x: ProfileRankingRow, y: ProfileRankingRow): number {
  const [px, py] = [x.position ?? Infinity, y.position ?? Infinity];
  return px - py || x.enrollment_id.localeCompare(y.enrollment_id);
}

/**
 * Linhas de "Rankings" na ordem da PF12: no perfil de outro jogador, as
 * categorias em que quem vê também está inscrito vêm primeiro; dentro de cada
 * grupo, e no próprio perfil, a melhor posição primeiro.
 * Ex.: `profileRankings(mockDomain, { playerId, viewerId, now: new Date().toISOString() })`.
 */
export function profileRankings(domain: ProfileDomain, view: ProfileViewer): ProfileRankingRow[] {
  const rows = currentEnrollments(domain, view.playerId, view.now).map((e) => toRow(domain, e, view));
  if (view.viewerId === view.playerId) return rows.sort(byPosition);
  const viewerCategories = new Set(
    currentEnrollments(domain, view.viewerId, view.now).map((e) => `${e.season_id}|${e.category_id}`),
  );
  const isShared = (row: ProfileRankingRow) => viewerCategories.has(`${row.season_id}|${row.category_id}`);
  return rows.sort((x, y) => Number(isShared(y)) - Number(isShared(x)) || byPosition(x, y));
}
