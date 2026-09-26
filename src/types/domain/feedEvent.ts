// Evento do feed (docs/DOMAIN.md, R20–R25).
//
// É o registro de domínio: diz o que aconteceu, com quem e quem pode ver. O
// card do feed (`src/types/feed.ts`) é a projeção visual dele, montada a
// partir da origem.

/** Público vai para o feed dos amigos; privado, só para os próprios atores (R21). */
export type EventVisibility = 'public' | 'private';

interface FeedEventBase {
  id: string;
  // Jogadores de quem é o evento. Numa unidade de duplas são os dois, que
  // também são o público do evento privado (R22).
  actor_ids: string[];
  created_at: string; // ISO 8601
}

/** Partida confirmada: ranking, torneio ou amistoso (R16, R24). */
export interface ResultEvent extends FeedEventBase {
  type: 'result';
  visibility: 'public';
  match_id: string;
}

/** Confronto nascido do sorteio (ranking) ou do cadastro (torneio). */
export interface MatchDefinedEvent extends FeedEventBase {
  type: 'match_defined';
  visibility: 'public';
  match_id: string;
}

export interface EnrollmentEvent extends FeedEventBase {
  type: 'enrollment';
  visibility: 'public';
  enrollment_id: string;
}

/** Só a amizade aceita vira evento (R24). */
export interface FriendshipEvent extends FeedEventBase {
  type: 'friendship';
  visibility: 'public';
  friendship_id: string;
}

/**
 * Movimentação no ranking: compara a foto do fim da rodada com a da anterior
 * (R46). Subiu é público; caiu é privado (R22). Variação zero não gera evento.
 */
interface RankingMovementBase extends FeedEventBase {
  enrollment_id: string;
  round_id: string; // a rodada cuja foto gerou o evento
  from_position: number;
  to_position: number;
}

export interface RankingUpEvent extends RankingMovementBase {
  type: 'ranking_up';
  visibility: 'public';
}

export interface RankingDownEvent extends RankingMovementBase {
  type: 'ranking_down';
  visibility: 'private';
}

export interface MilestoneEvent extends FeedEventBase {
  type: 'milestone';
  visibility: 'public';
  milestone_id: string;
}

/** "Classificado para a [nome da final]", depois da data de corte (R28). */
export interface FinalQualificationEvent extends FeedEventBase {
  type: 'final_qualification';
  visibility: 'public';
  enrollment_id: string;
  season_id: string;
}

/** Evento automático do feed (R24). Pendências não são eventos: moram na agenda. */
export type FeedEvent =
  | ResultEvent
  | MatchDefinedEvent
  | EnrollmentEvent
  | FriendshipEvent
  | RankingUpEvent
  | RankingDownEvent
  | MilestoneEvent
  | FinalQualificationEvent;

export type FeedEventType = FeedEvent['type'];
