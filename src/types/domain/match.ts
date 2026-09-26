// Partida, placar e resultado (docs/DOMAIN.md §1, "Jogo", e §3).
//
// A partida é uma união discriminada em dois níveis: `kind` diz de onde ela
// vem (ranking, torneio ou amistoso) e `status` diz em que ponto da máquina de
// estados ela está. Cada combinação só tem os campos que fazem sentido nela:
// partida "Confronto definido" não tem resultado, amistoso não tem W.O.,
// torneio não tem pontos. Estado inválido não compila.

import type { MatchFormat } from './competition';

export type MatchSideKey = 'a' | 'b';

/**
 * Um set do placar. No super tiebreak, `games_*` são os pontos do tiebreak
 * (ex.: 10/7), e a pontuação conta o STB como 1 game para o vencedor (R9).
 */
export interface MatchSet {
  games_a: number;
  games_b: number;
  super_tiebreak: boolean;
  interrupted: boolean; // set em que houve a desistência (R11)
}

export interface NormalResult {
  type: 'normal';
  winner: MatchSideKey;
  sets: MatchSet[];
}

/** W.O. para um lado: sem placar; quem compareceu leva 100, o ausente 0 (R10). */
export interface WoResult {
  type: 'wo';
  winner: MatchSideKey;
}

/** W.O. duplo: 0 e 0, sem vencedor. Só o admin aplica (R36, R40). */
export interface DoubleWoResult {
  type: 'double_wo';
}

/**
 * Desistência ou lesão (R11). `sets` guarda os games jogados, com o set
 * interrompido; o placar completado pelo formato, que é o que pontua, é
 * derivado. O vencedor é o adversário de quem desistiu, e é ele quem lança.
 */
export interface RetiredResult {
  type: 'retired';
  winner: MatchSideKey;
  sets: MatchSet[];
}

/** Tipo de resultado (R12). */
export type ResultType = CompetitionResult['type'];

/** O que um jogador pode lançar numa partida de competição. */
export type ReportableResult = NormalResult | WoResult | RetiredResult;

/** O que uma partida de competição confirmada pode ter: inclui a decisão do admin. */
export type CompetitionResult = ReportableResult | DoubleWoResult;

/** O amistoso só termina em normal ou desistência (R44). */
export type FriendlyResult = NormalResult | RetiredResult;

/** Lançamento de um resultado. No torneio, quem lança é o admin (R38). */
export interface ResultReport<R extends CompetitionResult = ReportableResult> {
  result: R;
  reported_by: string; // player_id
  reported_at: string; // ISO 8601
}

/** Resposta do lado adversário ao lançamento: vale a primeira (R13). */
export interface ReportResponse {
  responded_by: string; // player_id
  responded_at: string; // ISO 8601
}

/** Ato de um admin da competição. Fica registrado quem fez (R39). */
export interface AdminAction {
  admin_id: string; // player_id
  acted_at: string; // ISO 8601
}

/** Como a partida foi confirmada (R16). */
export type MatchConfirmation =
  | ({ via: 'opponent' } & ReportResponse)
  | { via: 'deadline'; confirmed_at: string } // prazo do ranking sem resposta (R14)
  | ({ via: 'admin' } & AdminAction); // arbitragem, partida não realizada ou lançamento do torneio

/** Pontos que cada lado ganhou numa partida confirmada de ranking (R8–R11, R36). */
export interface SidePoints {
  a: number;
  b: number;
}

// --- Estados da partida de competição (§3, "Partida de competição") ---

export interface DefinedState {
  status: 'defined';
}

export interface AwaitingConfirmationState {
  status: 'awaiting_confirmation';
  report: ResultReport;
}

export interface InArbitrationState {
  status: 'in_arbitration';
  report: ResultReport;
  contest: ReportResponse;
}

/** Prazo da rodada passou sem resultado: vai para o admin (R40). */
export interface NotPlayedState {
  status: 'not_played';
}

export interface ConfirmedState<P extends SidePoints | null> {
  status: 'confirmed';
  result: CompetitionResult;
  // null só quando o admin decidiu uma partida não realizada, sem lançamento
  report: ResultReport | null;
  confirmation: MatchConfirmation;
  correction: AdminAction | null; // última correção depois da confirmação (R41)
  points: P;
}

export interface CancelledState {
  status: 'cancelled';
  // not_played: o admin cancelou a partida não realizada (R40).
  // annulled: o admin anulou uma partida confirmada (R41).
  reason: 'not_played' | 'annulled';
  cancellation: AdminAction;
}

interface CompetitionMatchBase {
  id: string;
  competition_id: string;
  category_id: string;
  side_a_enrollment_id: string;
  side_b_enrollment_id: string;
  format: MatchFormat;
  scheduled_at: string | null; // data acordada (R34, R35)
  venue: string | null; // arena é texto, não entidade
  created_at: string; // ISO 8601: sorteio (ranking) ou cadastro (torneio)
}

interface RankingMatchBase extends CompetitionMatchBase {
  kind: 'ranking';
  round_id: string; // a rodada cujo sorteio criou a partida
}

interface TournamentMatchBase extends CompetitionMatchBase {
  kind: 'tournament';
  stage: string | null; // fase da chave externa ("Quartas", "Final"), só rótulo (R31)
}

export type RankingMatch = RankingMatchBase &
  (
    | DefinedState
    | AwaitingConfirmationState
    | InArbitrationState
    | NotPlayedState
    | ConfirmedState<SidePoints>
    | CancelledState
  );

/** No torneio o admin lança já confirmado: não há espera, arbitragem nem prazo (R38). */
export type TournamentMatch = TournamentMatchBase &
  (DefinedState | ConfirmedState<null> | CancelledState);

export type CompetitionMatch = RankingMatch | TournamentMatch;

// --- Amistoso (§3, "Amistoso") ---

interface FriendlyMatchBase {
  id: string;
  kind: 'friendly';
  side_a_unit_id: string; // sem competição, o lado é a unidade (não há inscrição)
  side_b_unit_id: string;
  format: MatchFormat; // quem lança escolhe (R29)
  played_at: string; // ISO 8601
  venue: string | null;
  created_at: string; // ISO 8601: o amistoso nasce do lançamento (R42)
  report: ResultReport<FriendlyResult>;
}

/** Sem prazo: fica pendente até a resposta, não confirma sozinho (R43). */
export interface FriendlyAwaitingState {
  status: 'awaiting_confirmation';
}

export interface FriendlyConfirmedState {
  status: 'confirmed';
  response: ReportResponse;
}

/** Contestação sem admin: o resultado é descartado (R43). */
export interface FriendlyDiscardedState {
  status: 'discarded';
  response: ReportResponse;
}

/** Só quem lançou cancela, e só enquanto está pendente (R43). */
export interface FriendlyCancelledState {
  status: 'cancelled';
  cancelled_at: string; // ISO 8601
}

export type FriendlyMatch = FriendlyMatchBase &
  (FriendlyAwaitingState | FriendlyConfirmedState | FriendlyDiscardedState | FriendlyCancelledState);

export type Match = CompetitionMatch | FriendlyMatch;

export type MatchKind = Match['kind'];

export type MatchStatus = Match['status'];

// --- Marcação do confronto (R34) ---

export interface ScheduleOption {
  starts_at: string; // ISO 8601
  venue: string | null;
}

interface ScheduleProposalBase {
  id: string;
  match_id: string;
  proposed_by: string; // player_id
  created_at: string; // ISO 8601
  options: [ScheduleOption, ScheduleOption] | [ScheduleOption, ScheduleOption, ScheduleOption];
}

export interface PendingScheduleProposal extends ScheduleProposalBase {
  status: 'pending';
}

/** A opção aceita vira a data acordada da partida (`scheduled_at`). */
export interface AcceptedScheduleProposal extends ScheduleProposalBase {
  status: 'accepted';
  accepted_option_index: 0 | 1 | 2;
  responded_by: string; // player_id
  responded_at: string; // ISO 8601
}

/**
 * Proposta de horário de um lado ao outro, ligada a uma partida de competição.
 * O histórico serve de evidência numa disputa de W.O. (R40).
 */
export type ScheduleProposal = PendingScheduleProposal | AcceptedScheduleProposal;
