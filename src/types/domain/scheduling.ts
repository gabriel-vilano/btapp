// Marcação do confronto (docs/DOMAIN.md R34, R35, R40; docs/SCHEDULING.md).
//
// O histórico da marcação não é uma tabela à parte: são as propostas e as
// datas informadas do confronto, que nunca são apagadas (M16). Cada registro
// guarda autor e momento, e o encerramento de cada proposta diz o que a
// encerrou. É desse conjunto que o admin tira o resumo por lado (M17).

import type { MatchSideKey } from './match';

/** Opção de horário: data e hora, com arena opcional em texto livre (M5, M7). */
export interface ScheduleOption {
  starts_at: string; // ISO 8601
  venue: string | null;
}

/** De 2 a 3 opções distintas (M5). */
export type ScheduleOptions =
  | [ScheduleOption, ScheduleOption]
  | [ScheduleOption, ScheduleOption, ScheduleOption];

interface ScheduleProposalBase {
  id: string;
  match_id: string; // só partida do ranking em "Confronto definido" (M1)
  side: MatchSideKey; // a proposta é do lado (M2)
  proposed_by: string; // player_id: quem do lado enviou
  created_at: string; // ISO 8601
  options: ScheduleOptions;
}

/** Aguardando o outro lado. No máximo uma por confronto (M8). */
export interface PendingScheduleProposal extends ScheduleProposalBase {
  status: 'pending';
}

/**
 * O outro lado aceitou uma opção, que vira a data acordada da partida
 * (`scheduled_at`, M11). Continua aceita mesmo depois de uma remarcação (M13).
 */
export interface AcceptedScheduleProposal extends ScheduleProposalBase {
  status: 'accepted';
  accepted_option_index: 0 | 1 | 2;
  responded_by: string; // player_id do outro lado; vale o primeiro aceite (M3)
  responded_at: string; // ISO 8601
}

/** O que substituiu a proposta: uma contraproposta (M9) ou uma data informada (M15). */
export type ScheduleReplacement =
  | { kind: 'proposal'; proposal_id: string }
  | { kind: 'reported_date'; reported_date_id: string };

export interface SupersededScheduleProposal extends ScheduleProposalBase {
  status: 'superseded';
  superseded_by: ScheduleReplacement;
  closed_at: string; // ISO 8601: momento em que o substituto foi registrado
}

/**
 * Quem retirou a proposta: um jogador do lado que propôs (M10) ou o sistema,
 * quando a partida sai de "Confronto definido" com a proposta pendente.
 */
export type ScheduleWithdrawal =
  | { by: 'player'; player_id: string }
  | { by: 'system'; reason: 'result_reported' | 'round_deadline' };

export interface WithdrawnScheduleProposal extends ScheduleProposalBase {
  status: 'withdrawn';
  withdrawal: ScheduleWithdrawal;
  closed_at: string; // ISO 8601
}

/** Todas as opções passaram sem aceite. Não é consequência para ninguém (M12). */
export interface ExpiredScheduleProposal extends ScheduleProposalBase {
  status: 'expired';
  closed_at: string; // ISO 8601: o horário da última opção
}

/**
 * Proposta de horário de um lado ao outro. O histórico serve de evidência
 * numa partida não realizada (R40), mas não é veredito: o app nunca aplica o
 * W.O. (M17).
 */
export type ScheduleProposal =
  | PendingScheduleProposal
  | AcceptedScheduleProposal
  | SupersededScheduleProposal
  | WithdrawnScheduleProposal
  | ExpiredScheduleProposal;

export type ScheduleProposalStatus = ScheduleProposal['status'];

/**
 * Data combinada fora das propostas (R35, M14), informada por qualquer jogador
 * do confronto, sem aceite do outro lado. Uma nova substitui a anterior, mas as
 * duas ficam no histórico. Como fica registrado quem informou, o admin sabe
 * que a data veio de um lado só.
 */
export interface ReportedScheduleDate {
  id: string;
  match_id: string;
  reported_by: string; // player_id
  reported_at: string; // ISO 8601
  starts_at: string; // ISO 8601
  venue: string | null;
}

/** Histórico da marcação de um confronto: o que o admin vê na partida não realizada (M16, M17). */
export interface ScheduleHistory {
  match_id: string;
  proposals: ScheduleProposal[];
  reported_dates: ReportedScheduleDate[];
}

/**
 * Telefone do jogador para o "Abrir no WhatsApp" (SCHEDULING.md §7). Fica fora
 * do `Player` de propósito: o perfil é público, e o telefone só aparece para
 * adversários e parceiro de um confronto ativo (M23). Separado, a regra de
 * acesso vale para o registro inteiro, e apagar é remover o registro (M25).
 * Não existe telefone sem consentimento (M21).
 */
export interface PlayerPhone {
  player_id: string;
  number: string; // E.164, ex.: '+5531999990001'
  consented_at: string; // ISO 8601
}
