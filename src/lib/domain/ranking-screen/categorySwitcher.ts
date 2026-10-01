import type { CompetitionCategory } from '@/src/types/domain';
import { profileRankings, type ProfileRankingRow } from '../profile';
import { positionDeltas } from '../ranking-table';
import { enrollmentPlayers } from './table';
import type { RankingScreenDomain } from './rankingScreen';
import type { RankingPlayer } from './types';

// A folha do seletor de categoria (docs/RANKING.md, RK6): "Suas categorias",
// com a posição e o delta de cada inscrição ativa do jogador, e "Outras
// categorias", as da competição da tela em que ele não está inscrito.

/** Um item de "Suas categorias": o dado do StandingSummaryItem. */
export interface OwnCategoryOption {
  enrollment_id: string;
  competition_name: string;
  category: CompetitionCategory;
  partner: RankingPlayer | null; // em simples, null
  position: number | null; // null: a categoria ainda não tem jogo confirmado (RK20)
  delta: number | null; // o mesmo da linha da tabela (RK12)
  href: string;
  is_current: boolean; // é a classificação aberta agora
}

/** Um item de "Outras categorias": nome e número de inscritos. */
export interface OtherCategoryOption {
  category: CompetitionCategory;
  unit_count: number | null; // inscrições ativas na temporada da tela; null sem temporada
  href: string;
  is_current: boolean;
}

export interface CategorySwitcher {
  own: OwnCategoryOption[];
  others: OtherCategoryOption[];
  /** Há para onde trocar. Sem isso, o seletor vira texto (RK6). */
  can_switch: boolean;
}

/** O que a tela aberta é, para marcar o item dela e contar os inscritos. */
export interface CategorySwitcherRequest {
  competition_id: string;
  category_id: string;
  /** Temporada que a tela mostra; null quando a competição não tem temporada (RK19). */
  season_id: string | null;
  /** A tela é a temporada padrão da categoria (sem `?temporada=`): o mesmo destino do item. */
  is_default_season: boolean;
  viewer_id: string;
  now: string; // ISO 8601
}

function findById<T extends { id: string }>(items: T[], id: string, what: string): T {
  const found = items.find((item) => item.id === id);
  if (found === undefined) throw new Error(`Seletor de categoria: ${what} '${id}' não existe nas tabelas`);
  return found;
}

type HrefOf = (categoryId: string) => string;

function toOwnOption(
  domain: RankingScreenDomain,
  request: CategorySwitcherRequest,
  hrefOf: HrefOf,
  row: ProfileRankingRow,
): OwnCategoryOption {
  const enrollment = findById(domain.enrollments, row.enrollment_id, 'inscrição');
  const scope = { ...domain, season_id: row.season_id, category_id: row.category_id };
  return {
    enrollment_id: row.enrollment_id,
    competition_name: findById(domain.competitions, row.competition_id, 'competição').name,
    category: findById(domain.categories, row.category_id, 'categoria'),
    partner: enrollmentPlayers(domain, enrollment).find((player) => player.id === row.partner_id) ?? null,
    position: row.position,
    delta: positionDeltas(scope, domain.standingSnapshots, request.now).get(row.enrollment_id) ?? null,
    href: hrefOf(row.category_id),
    is_current: request.is_default_season && row.category_id === request.category_id,
  };
}

// Mesma ordem de "Minhas competições" (NAV N29), de onde o jogador chegou: a
// inscrição mais recente primeiro; no empate, o id deixa a lista estável
function byMostRecentEnrollment(domain: RankingScreenDomain): (x: ProfileRankingRow, y: ProfileRankingRow) => number {
  const enrolledAt = (row: ProfileRankingRow): number =>
    Date.parse(findById(domain.enrollments, row.enrollment_id, 'inscrição').enrolled_at);
  return (x: ProfileRankingRow, y: ProfileRankingRow) =>
    enrolledAt(y) - enrolledAt(x) || x.enrollment_id.localeCompare(y.enrollment_id);
}

/** Inscrições ativas do jogador em temporada aberta, as mesmas da seção "Rankings" do perfil (PF10). */
function ownOptions(domain: RankingScreenDomain, request: CategorySwitcherRequest, hrefOf: HrefOf): OwnCategoryOption[] {
  const view = { playerId: request.viewer_id, viewerId: request.viewer_id, now: request.now };
  return profileRankings(domain, view)
    .sort(byMostRecentEnrollment(domain))
    .map((row) => toOwnOption(domain, request, hrefOf, row));
}

function activeCount(domain: RankingScreenDomain, categoryId: string, seasonId: string | null): number | null {
  if (seasonId === null) return null;
  return domain.enrollments.filter(
    (enrollment) =>
      enrollment.season_id === seasonId && enrollment.category_id === categoryId && enrollment.status === 'active',
  ).length;
}

/**
 * A folha do seletor de categoria da tela aberta. `hrefOf` dá a classificação
 * da categoria na temporada padrão (os slugs são da rota).
 * Ex.: `categorySwitcher(mockProfileDomain, { competition_id, category_id, season_id, is_default_season: true, viewer_id, now }, hrefOf)`.
 */
export function categorySwitcher(
  domain: RankingScreenDomain,
  request: CategorySwitcherRequest,
  hrefOf: HrefOf,
): CategorySwitcher {
  const own = ownOptions(domain, request, hrefOf);
  const ownCategories = new Set(own.map((option) => option.category.id));
  const others = domain.categories
    .filter((category) => category.competition_id === request.competition_id && !ownCategories.has(category.id))
    .map((category) => ({
      category,
      unit_count: activeCount(domain, category.id, request.season_id),
      href: hrefOf(category.id),
      is_current: request.is_default_season && category.id === request.category_id,
    }));
  const can_switch = [...own, ...others].some((option) => !option.is_current);
  return { own, others, can_switch };
}
