// Classificação e marcos (docs/DOMAIN.md, R37, R46, R47).
//
// A classificação em si não é guardada: é a soma dos pontos das partidas
// confirmadas de cada inscrição, ordenada pelo desempate (R8, R37). O que se
// guarda é a foto do fim de cada rodada, para o "subiu N" e os marcos.

/** Posição de uma inscrição no fechamento de uma rodada (R46). */
export interface StandingSnapshot {
  round_id: string;
  category_id: string;
  enrollment_id: string;
  position: number; // começa em 1
  points: number;
}

/** Nunca é revogado por rodada seguinte nem por correção de placar (R25, R41). */
interface MilestoneBase {
  id: string;
  enrollment_id: string; // o marco é da unidade, não do jogador (R1, R47)
  season_id: string;
  round_id: string; // os marcos saem no fechamento da rodada
  achieved_at: string; // ISO 8601
}

export interface LeaderMilestone extends MilestoneBase {
  type: 'leader';
}

/** N é a quantidade de classificados da final, ou 10 sem final (R47). */
export interface TopNMilestone extends MilestoneBase {
  type: 'top_n';
  n: number;
}

/** Primeira vez de uma unidade como Líder ou no Top N na temporada (R47). */
export type Milestone = LeaderMilestone | TopNMilestone;

/** N do marco Top N quando a temporada não tem final (R47). */
export const DEFAULT_TOP_N = 10;
