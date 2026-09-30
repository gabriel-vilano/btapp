import type { CompetitionCategory, Player } from '@/src/types/domain';
import type { CutoffDistance } from '../ranking-table';

// O que a tela de classificação (docs/RANKING.md) mostra, já decidido a
// partir das tabelas: números e estados, sem texto. As frases ("Faltam 12 pts
// para o 8º", "Rodada 3 de 4") são da tela, em `rankingScreenText.ts`.

/** Jogador de uma linha: o que o avatar, o nome e o link do perfil pedem. */
export type RankingPlayer = Pick<Player, 'id' | 'name' | 'username' | 'avatar_url'>;

/** Em que momento a temporada está (RK4, RK15). */
export type SeasonPhase = 'open' | 'after_cutoff' | 'ended';

/** Cabeçalho da classificação (RK4, RK15). */
export interface SeasonHeader {
  season_name: string;
  phase: SeasonPhase;
  ends_on: string; // ISO 8601
  /** Rodada em curso; null entre rodadas ou depois do fim. */
  current_round: { number: number; total: number; deadline: string } | null;
  final: { name: string; qualifiers: number; cutoff_date: string } | null;
  /** Menos ou tantas inscrições ativas quanto vagas: todas se classificam (4.5). */
  all_qualify: boolean;
  /** Temporada encerrada anterior, oferecida enquanto a atual não termina (RK15). */
  previous_season_id: string | null;
}

/** Uma linha da tabela (RK8), na ordem da classificação. */
export interface RankingLine {
  enrollment_id: string;
  players: RankingPlayer[]; // 1 em simples, 2 em duplas
  position: number;
  points: number;
  played: number;
  wins: number;
  delta: number | null; // null: posição igual, 1ª rodada ou entrou depois da foto (RK12)
  status: 'active' | 'closed';
  awaiting_admin: boolean;
  is_own: boolean;
  cutoff_distance: CutoffDistance | null; // só na própria linha, fora da zona (RK11)
}

/** A linha de corte da final (RK13). */
export interface CutoffDivider {
  final_name: string;
  qualifiers: number;
  after_cutoff: boolean;
  awaiting_admin: boolean; // empate atravessando a linha
}

/** Inscrição da temporada ainda sem jogo confirmado (RK20): sem posição nem pontos. */
export interface UnrankedEntry {
  enrollment_id: string;
  players: RankingPlayer[];
  is_own: boolean;
}

export type RankingScreenContent =
  | { kind: 'no_season' } // RK19
  | { kind: 'unranked'; header: SeasonHeader; entries: UnrankedEntry[] } // RK20
  | {
      kind: 'table';
      header: SeasonHeader;
      /** Até a última vaga; sem final ou sem corte, a tabela inteira. */
      qualified: RankingLine[];
      outside: RankingLine[];
      divider: CutoffDivider | null;
      has_tie: boolean; // alguma linha espera o admin (4.4)
      own_enrollment_id: string | null;
    };

/** A tela de uma categoria numa temporada. */
export interface RankingScreenModel {
  competition_id: string;
  competition_name: string;
  category: CompetitionCategory;
  season_id: string | null;
  content: RankingScreenContent;
}
