import type { Competition, CompetitionCategory } from '@/src/types/domain';
import type { Score } from '@/src/types/feed';
import type { StandingDelta } from '../competitions-tab';
import type { H2HDomain, H2HForm, H2HPageKind } from '../h2h';

// Página de H2H (docs/HEAD_TO_HEAD.md) no formato da tela: o que `h2h/`
// deriva em ids e números, com nomes, textos e a rota de cada toque. Com a
// integração, forma recente e "No ranking" vêm de consultas próprias e
// falham sozinhas (HH22); por isso têm estado de erro.

/** Tabelas que a página lê: as do domínio do H2H mais os nomes de competição e categoria. */
export interface H2HPageDomain extends H2HDomain {
  competitions: Competition[];
  categories: CompetitionCategory[];
}

/**
 * Rotas que o domínio não sabe montar: a classificação usa o slug da
 * categoria, e o domínio só guarda ids (mesmo papel do `ProfileLinks`).
 */
export interface H2HPageLinks {
  rankingHref: (categoryId: string) => string;
}

/** Seção que carrega sozinha (HH22): pronta, ou com erro e "Tentar de novo". */
export type H2HPageSection<T> = { status: 'ready'; data: T } | { status: 'error' };

/** Um jogador dos lados (HH9): tocar abre o perfil. */
export interface H2HPlayerView {
  id: string;
  name: string;
  /** O que a tela mostra: o primeiro nome em duplas, o nome completo em simples (HH9). */
  shown_name: string;
  avatar_url: string | null;
  href: string;
}

/** Um lado da página, com os nomes que cada bloco usa. */
export interface H2HSideView {
  players: H2HPlayerView[];
  /** Nos textos que falam do lado (HH6): "Você", "Vocês", "Pedro", "Pedro e Thiago". */
  label: string;
  /** No título e na forma recente, sempre pelo nome: "Lucas", "Lucas e Rafael". */
  name: string;
}

/** Uma linha de "Confrontos" (HH14), pronta para o H2HMatchItem. */
export interface H2HMatchView {
  match_id: string;
  outcome: 'win' | 'loss';
  score: Score;
  played_at: string; // ISO 8601
  context: string; // "Ranking Arena Mangaba · Masculino B · Rodada 3", "Amistoso"
  lineup: { partner_name: string; opponent_names: string } | null;
  href: string;
}

/** Uma linha de "No ranking" (HH13): a posição de uma das duplas numa categoria em comum. */
export interface H2HStandingView {
  enrollment_id: string;
  position: number | null;
  delta: StandingDelta | null;
  competition_name: string;
  category_name: string;
  side_name: string; // "Lucas e Rafael": de qual dupla é a linha
  href: string;
}

/** Uma linha de "Jogador contra jogador" (HH2), do lado do jogador da esquerda. */
export interface H2HCrossPairView {
  title: string; // "Lucas × Pedro"
  left_wins: number;
  right_wins: number;
  href: string;
}

export interface H2HPageView {
  kind: H2HPageKind;
  viewer_is_left: boolean;
  /** O `h1`: o confronto por extenso (HH9, seção 7). Ex.: "Lucas e Rafael × Pedro e Thiago". */
  title: string;
  left: H2HSideView;
  right: H2HSideView;
  /** Resumo (HH10); null quando os lados nunca se enfrentaram (§6.1). */
  summary: { left_wins: number; right_wins: number; last_played_at: string } | null;
  form: H2HPageSection<{ left: H2HForm; right: H2HForm }>;
  rankings: H2HPageSection<H2HStandingView[]>; // vazia, a seção some
  confrontations: H2HMatchView[];
  cross_pairs: H2HCrossPairView[]; // vazia, a seção some
}

export type H2HPageViewResult =
  | { status: 'found'; view: H2HPageView; canonical_path: string }
  | { status: 'not_found'; reason: string };
