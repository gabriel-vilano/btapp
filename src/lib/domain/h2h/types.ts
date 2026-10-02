import type { Player } from '@/src/types/domain';
import type { Score } from '@/src/types/feed';
import type { ProfileDomain } from '../profile';

// Página de H2H (docs/HEAD_TO_HEAD.md) no formato do domínio: ids e números,
// sem nomes nem texto, que são da tela. A contagem vem de `match-count/`
// (R19); aqui ela ganha lados, perspectiva, lista, forma e ranking.

/** Tabelas que a página lê: as do perfil (partidas, inscrições, rodadas, fotos) mais os jogadores. */
export interface H2HDomain extends ProfileDomain {
  players: Player[];
}

/**
 * Um lado da página (HH1, HH4). Na de jogadores, um jogador com qualquer
 * parceiro; na de duplas, a dupla exata (a unidade, R2).
 */
export type H2HSide =
  | { kind: 'player'; player_id: string }
  | { kind: 'unit'; unit_id: string; player_ids: [string, string] };

/** Jogador × jogador ou dupla × dupla: o tipo é dado pelos lados (HH1). */
export type H2HPageKind = 'players' | 'doubles';

/** Os lados na ordem da tela (HH6): quem vê à esquerda quando está num deles. */
export interface OrientedSides {
  kind: H2HPageKind;
  left: H2HSide;
  right: H2HSide;
  viewer_is_left: boolean; // os textos falam com "você" (HH6)
}

/** Resumo (HH10, HH11): só partidas jogadas, do ponto de vista do lado esquerdo. */
export interface H2HSummaryData {
  left_wins: number;
  right_wins: number;
  total: number;
  last_played_at: string | null; // ISO 8601; null sem confronto (§6.1)
}

/** De onde a partida veio (HH14). A tela monta "competição · categoria · rodada". */
export type H2HMatchContext =
  | { kind: 'ranking'; competition_id: string; category_id: string; round_number: number }
  | { kind: 'tournament'; competition_id: string; category_id: string; stage: string | null }
  | { kind: 'friendly' };

/** Quem jogou de cada lado, na página de jogadores em duplas: "com Rafael, contra Pedro e Thiago". */
export interface H2HLineup {
  left_player_ids: string[];
  right_player_ids: string[];
}

/** Uma linha de "Confrontos" (HH14), lida do lado esquerdo. */
export interface H2HConfrontation {
  match_id: string;
  played_at: string; // ISO 8601
  outcome: 'win' | 'loss'; // do lado esquerdo: o Badge "Vitória" ou "Derrota"
  result_type: 'normal' | 'retired'; // W.O. não chega aqui (HH11)
  score: Score; // gravado do lado vencedor, como no card
  perspective: 'winner' | 'loser'; // a `perspective` do ScoreBlock compacto
  context: H2HMatchContext;
  lineup: H2HLineup | null; // só na página de jogadores, em partida de duplas
}

/** Forma recente de um lado (HH12): da mais antiga para a mais recente, até 5. */
export type H2HForm = Array<'win' | 'loss'>;

/** Posição atual de uma dupla numa categoria em comum (HH13). */
export interface H2HStanding {
  enrollment_id: string;
  position: number | null; // null enquanto a categoria não tem jogo confirmado (RK20)
  position_delta: number | null; // positivo: subiu; null sem foto para comparar ou sem mudança
}

/** Uma categoria em comum das duas duplas, com as duas linhas (HH13). */
export interface H2HSharedRanking {
  competition_id: string;
  season_id: string;
  category_id: string;
  left: H2HStanding;
  right: H2HStanding;
}

/** Uma linha de "Jogador contra jogador" (HH2), do lado do jogador da esquerda. */
export interface H2HCrossPair {
  left_player_id: string;
  right_player_id: string;
  left_wins: number;
  right_wins: number;
}
