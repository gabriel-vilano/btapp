import type { MatchFormat, ScoringRule } from '@/src/types/domain';
import type { StandingDelta } from '../competitions-tab';

// Página da competição de ranking (docs/RANKING.md §7, RK17 e RK18; NAV N9,
// N31 e N33), já no formato da tela: nomes resolvidos, rotas e a relação de
// quem vê com a competição. A derivação a partir das tabelas do domínio vem
// com a integração; até lá, os mocks de `src/mocks/competitionPage.ts`
// preenchem este contrato. Formato e regra de pontuação são os tipos do
// domínio, porque a página calcula o exemplo com eles (RK18).

/**
 * Contato que o organizador informou para a inscrição (N33). O texto aparece
 * como foi escrito; o link, quando há, vira o botão para falar com ele.
 */
export interface OrganizerContact {
  text: string; // 'WhatsApp da recepção: (31) 99999-0000'
  href: string | null; // 'https://wa.me/…'; null quando o contato é só texto
}

export interface CompetitionOrganizer {
  name: string;
  avatar_url: string | null;
  contact: OrganizerContact | null;
}

/** A posição de quem vê numa categoria em que está inscrito (StandingSummaryItem). */
export interface CategoryStanding {
  // null enquanto a categoria não tem partida confirmada (RANKING.md, RK20)
  position: number | null;
  delta: StandingDelta | null; // 1ª rodada: sem foto para comparar (RK12)
  partner_name: string | null; // em simples, null
}

/** Uma linha do bloco Categorias: toque → classificação (RK17). */
export interface CompetitionCategoryRow {
  category_id: string;
  name: string; // 'Masculino B', 'Mista C 40+'
  modality: 'singles' | 'doubles';
  unit_count: number; // duplas ou jogadores inscritos
  href: string; // a classificação da categoria (RK1)
  standing: CategoryStanding | null; // null quando quem vê não está inscrito nela
}

/** Rodada atual. Sem total quando o ranking não fixa o número de rodadas (RK4). */
export interface CurrentRound {
  number: number;
  total: number | null;
  deadline: string; // ISO 8601
}

export interface SeasonFinalInfo {
  name: string; // 'Saideira'
  qualifiers: number; // vagas por categoria
  cutoff_date: string; // ISO 8601
}

export interface CompetitionSeasonInfo {
  name: string; // '2º semestre de 2026'
  starts_on: string; // ISO 8601
  ends_on: string; // ISO 8601
  current_round: CurrentRound | null; // null entre o início da temporada e o primeiro sorteio
  final: SeasonFinalInfo | null;
}

/** O que a página sabe de quem a vê. */
export interface CompetitionViewer {
  /** Admin desta competição (R15): vê a entrada da área "Administrar" (N31). */
  is_admin: boolean;
  /** Marcou "Tenho interesse" (N33). Privado: só ele vê. */
  interested: boolean;
}

export interface CompetitionPageData {
  slug: string; // o segmento da rota: /competicoes/[slug]
  name: string;
  organizer: CompetitionOrganizer;
  categories: CompetitionCategoryRow[];
  season: CompetitionSeasonInfo | null; // null: competição sem temporada (RK19)
  matches_per_round: number;
  match_format: MatchFormat;
  scoring_rule: ScoringRule;
  response_deadline_hours: number; // R14
  viewer: CompetitionViewer;
}
