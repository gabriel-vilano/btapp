import type { CompetitionMatch } from '@/src/types/domain';
import type { CurrentRound } from '../competition-page';
import type { AdminPendingKind } from '../competitions-tab';

// Área "Administrar" da competição (docs/NAVIGATION.md N31, docs/RESULTS.md §5),
// já no formato da tela: nomes resolvidos e rotas. Os tipos de decisão são os
// mesmos do bloco "Pendências de admin" da aba Competições (N30), porque os
// dois contam a mesma fila. A derivação a partir das tabelas do domínio vem
// com a integração; até lá, os mocks de `src/mocks/adminArea.ts` preenchem
// este contrato.

/** Uma decisão que espera o admin (RESULTS §5): contestação, partida não realizada ou confronto de torneio. */
export interface AdminDecisionItem {
  id: string;
  kind: AdminPendingKind;
  category_name: string;
  round_label: string; // 'Rodada 4' no ranking; 'Semifinal' no torneio
  sides: string; // 'Bruno e Caio x Diego e Felipe'
  since: string; // ISO 8601; desde quando a decisão espera o admin
}

/** O status da partida é o do domínio: ranking e torneio (o amistoso não tem admin). */
export type AdminMatchStatus = CompetitionMatch['status'];

/** Uma linha da lista de partidas da competição: toque → tela da partida (RESULTS §5.4). */
export interface AdminMatchItem {
  id: string;
  category_name: string;
  sides: string;
  status: AdminMatchStatus;
  corrected: boolean; // o admin corrigiu o placar depois da confirmação (R41)
  href: string; // /jogos/[partida]
}

/** As partidas de uma rodada, na ordem da lista. */
export interface AdminMatchRound {
  label: string; // 'Rodada 4'
  matches: AdminMatchItem[];
}

export interface AdminAreaData {
  slug: string; // o segmento da rota: /competicoes/[slug]/administrar
  competition_name: string;
  competition_href: string; // o "Voltar" da área: a página da competição, a tela pai
  /** Rodada em andamento, para o sorteio. null antes do primeiro sorteio. */
  current_round: CurrentRound | null;
  decisions: AdminDecisionItem[];
  /** Rodadas da mais recente para a mais antiga. */
  match_rounds: AdminMatchRound[];
}
