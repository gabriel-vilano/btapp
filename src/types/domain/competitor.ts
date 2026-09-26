// Quem compete (docs/DOMAIN.md §1, "Quem compete").

/** Jogador de simples: a unidade tem um membro só. */
export interface SinglesUnit {
  id: string;
  modality: 'singles';
  player_ids: [string];
}

/**
 * Dupla. A identidade é o par de jogadores (R2): "Lucas e Rafael" é a mesma
 * unidade em qualquer competição e no amistoso, o que dá o H2H da dupla exata
 * (R19). A ordem dos ids não muda a identidade.
 */
export interface DoublesUnit {
  id: string;
  modality: 'doubles';
  player_ids: [string, string];
}

/** Quem ocupa um lado da partida e uma linha da classificação (R1, R3). */
export type CompetitorUnit = SinglesUnit | DoublesUnit;

interface EnrollmentBase {
  id: string;
  unit_id: string;
  category_id: string;
  // Ranking: a inscrição é de uma temporada. Torneio: do evento, sem temporada.
  season_id: string | null;
  enrolled_at: string; // ISO 8601
}

export interface ActiveEnrollment extends EnrollmentBase {
  status: 'active';
}

/**
 * Inscrição da dupla desfeita (R17, R45): fica congelada na classificação, sem
 * direito à final. Se o jogador volta ao parceiro antigo na mesma temporada, a
 * inscrição é reativada em vez de criar outra.
 */
export interface ClosedEnrollment extends EnrollmentBase {
  status: 'closed';
  closed_at: string; // ISO 8601
  closed_reason: 'partner_change';
}

/** Participação de uma unidade numa categoria. É onde os pontos se acumulam (R8). */
export type Enrollment = ActiveEnrollment | ClosedEnrollment;
