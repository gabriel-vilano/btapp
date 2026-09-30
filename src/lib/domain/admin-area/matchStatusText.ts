import type { AdminMatchItem, AdminMatchStatus } from './types';

// Rótulo do status na lista de partidas da área "Administrar". "Aguardando
// confirmação", "Em arbitragem" e "Corrigido" são os badges da RESULTS §9.

const STATUS_LABEL: Record<AdminMatchStatus, string> = {
  defined: 'A jogar',
  awaiting_confirmation: 'Aguardando confirmação',
  in_arbitration: 'Em arbitragem',
  not_played: 'Não realizada',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

/** O que espera o admin (RESULTS §5) ganha o tom de atenção; o resto fica neutro. */
const NEEDS_ADMIN: ReadonlySet<AdminMatchStatus> = new Set(['in_arbitration', 'not_played']);

/**
 * Rótulo do status de uma partida. A confirmada que o admin corrigiu diz "Corrigido" (R41).
 * Ex.: `adminMatchStatusLabel({ status: 'confirmed', corrected: true })` → `'Corrigido'`.
 */
export function adminMatchStatusLabel(match: Pick<AdminMatchItem, 'status' | 'corrected'>): string {
  if (match.status === 'confirmed' && match.corrected) return 'Corrigido';
  return STATUS_LABEL[match.status];
}

/** A partida espera uma decisão do admin. */
export function matchNeedsAdmin(status: AdminMatchStatus): boolean {
  return NEEDS_ADMIN.has(status);
}
