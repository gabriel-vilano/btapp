import type {
  Competition,
  CompetitionCategory,
  Friendship,
  Player,
} from '@/src/types/domain';
import type { Score } from '@/src/types/feed';
import type { StandingDelta } from '../competitions-tab';
import type { ProfileDomain, SeasonMilestone } from '../profile';

// Página do perfil (docs/PROFILE.md) no formato da tela: as derivações de
// `profile/` com os nomes resolvidos e a rota de cada toque. Com a
// integração, cada seção vem de uma consulta própria; por isso cada uma tem
// o próprio estado de erro (PF22).

/** Tabelas que a página lê: as das derivações mais pessoas, amizades e nomes. */
export interface ProfilePageDomain extends ProfileDomain {
  players: Player[];
  friendships: Friendship[];
  competitions: Competition[];
  categories: CompetitionCategory[];
}

/**
 * Quem vê em relação ao dono do perfil. Decide a ação do cabeçalho (PF7) e
 * o que muda entre o próprio perfil e o de outro jogador (PF3).
 */
export type ProfileRelation = 'self' | 'none' | 'request_sent' | 'request_received' | 'friends';

/** Uma seção carregada ou com erro. O erro fica só nela (PF22, N24). */
export type ProfileSection<T> = { status: 'ready'; data: T } | { status: 'error' };

export type ProfilePagePlayer = Pick<Player, 'id' | 'name' | 'username' | 'avatar_url' | 'total_matches'>;

/** Bloco "Vocês" (PF16, PF17), do ponto de vista de quem vê. */
export interface ProfileVersusView {
  next_match: {
    href: string;
    stage: string; // "Rodada 3" no ranking; a fase ou o nome da competição no torneio
    scheduled_at: string | null; // ISO 8601; null enquanto a data não foi acordada
  } | null;
  head_to_head: {
    href: string;
    matches: number;
    viewer_wins: number; // "você venceu 2"
  } | null;
}

/** Uma linha de "Rankings": o StandingSummaryItem com os nomes (PF10). */
export interface ProfileRankingItem {
  enrollment_id: string;
  position: number | null; // null enquanto a categoria não tem jogo confirmado (RK20)
  delta: StandingDelta | null; // sem foto para comparar ou sem mudança: nada
  best_position: number | null; // "Melhor: 3º", só no próprio perfil (PF14)
  competition_name: string;
  category_name: string;
  partner_name: string | null; // em simples, null
  href: string;
}

/** Uma linha de "Partidas recentes" (PF18), do lado do dono do perfil. */
export interface ProfileMatchItem {
  match_id: string;
  outcome: 'win' | 'loss';
  result_type: 'normal' | 'retired' | 'wo';
  score: Score; // gravado do lado vencedor, como no card
  opponents: string; // "Pedro e Thiago" ou "Thiago Mendes"
  context: string; // "Ranking Arena Mangaba 2026 · Masculino B" ou "Amistoso"
  played_at: string; // ISO 8601
  href: string;
}

/** Uma linha de "Temporadas" (PF19). */
export interface ProfileSeasonItem {
  enrollment_id: string;
  season_name: string;
  competition_name: string;
  category_name: string;
  partner_name: string | null;
  final_position: number | null;
  milestones: SeasonMilestone[];
  final_name: string | null; // "★ Saideira": a final em que a dupla se classificou
  href: string;
}

export interface ProfilePageData {
  relation: ProfileRelation;
  player: ProfilePagePlayer;
  friends_count: number;
  record: { wins: number; losses: number };
  versus: ProfileSection<ProfileVersusView | null>; // null: o bloco some (PF2)
  rankings: ProfileSection<ProfileRankingItem[]>;
  recent_matches: ProfileSection<ProfileMatchItem[]>;
  seasons: ProfileSection<ProfileSeasonItem[]>;
}
