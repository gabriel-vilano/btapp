import type { Competition, MatchFormat, Organization, ScoringRule } from '@/src/types/domain';
import type { StandingDelta } from '../competitions-tab';

// Página da competição (docs/RANKING.md §7, RK17 e RK18; NAV N9, N31 e N33;
// EXPLORE.md, EX34), já no formato da tela: nomes resolvidos, rotas e a relação
// de quem vê com a competição. A derivação a partir das tabelas do domínio vem
// com a integração; até lá, os mocks de `src/mocks/competitionPage.ts`
// preenchem este contrato. No ranking, formato e regra de pontuação são os
// tipos do domínio, porque a página calcula o exemplo com eles (RK18). O
// torneio ainda não tem spec (NAV N9): leva só o mínimo do Explorar (EX34).

/**
 * A organização que promove a competição, como a página a mostra: avatar e
 * nome levam à página dela (/organizacoes/[username], EX23), e o contato
 * aparece em "Como se inscrever" (EXPLORE.md, EX28). O contato é o campo da
 * `Organization`, texto ou link, lido por `readOrganizationContact`.
 */
export type CompetitionOrganizer = Pick<Organization, 'name' | 'username' | 'avatar_url' | 'contact'>;

/** A posição de quem vê numa categoria em que está inscrito (StandingSummaryItem). */
export interface CategoryStanding {
  // null enquanto a categoria não tem partida confirmada (RANKING.md, RK20)
  position: number | null;
  delta: StandingDelta | null; // 1ª rodada: sem foto para comparar (RK12)
  partner_name: string | null; // em simples, null
}

/** Uma linha do bloco Categorias: no ranking, toque → classificação (RK17). */
export interface CompetitionCategoryRow {
  category_id: string;
  name: string; // 'Masculino B', 'Mista C 40+'
  modality: 'singles' | 'doubles';
  unit_count: number; // duplas ou jogadores inscritos
  // A classificação da categoria (RK1). No torneio, null: a chave é da spec do torneio
  href: string | null;
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

interface CompetitionPageBase {
  slug: string; // o segmento da rota: /competicoes/[slug]
  name: string;
  organizer: CompetitionOrganizer;
  categories: CompetitionCategoryRow[];
  viewer: CompetitionViewer;
}

/** O tipo é escrito no cabeçalho, abaixo da organização: "Ranking". */
export interface RankingPageData extends CompetitionPageBase {
  type: Extract<Competition['type'], 'ranking'>;
  season: CompetitionSeasonInfo | null; // null: competição sem temporada (RK19)
  matches_per_round: number;
  match_format: MatchFormat;
  scoring_rule: ScoringRule;
  response_deadline_hours: number; // R14
}

/** Torneio, no mínimo da EX34: cabeçalho, data e local, categorias e os blocos de inscrição. */
export interface TournamentPageData extends CompetitionPageBase {
  type: Extract<Competition['type'], 'tournament'>;
  starts_on: string; // ISO 8601
  ends_on: string; // ISO 8601; igual ao início no torneio de 1 dia
  venue: string; // texto, sem link para a organização (EX25)
}

export type CompetitionPageData = RankingPageData | TournamentPageData;

/** Resposta do registro do "Tenho interesse" (EX33): sem `ok`, o botão volta ao estado anterior. */
export interface InterestRegistration {
  ok: boolean;
}

/** Registra (`true`) ou desfaz (`false`) o interesse de quem vê na competição da página. */
export type RegisterInterest = (interested: boolean) => Promise<InterestRegistration>;
