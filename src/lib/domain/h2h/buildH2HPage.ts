import { h2hConfrontations } from './confrontations';
import { h2hCrossPairs } from './crossPairs';
import { h2hForm } from './form';
import { orientSides } from './perspective';
import { h2hSharedRankings } from './rankings';
import { resolveH2HRoute } from './route';
import { h2hSummary } from './summary';
import type {
  H2HConfrontation,
  H2HCrossPair,
  H2HDomain,
  H2HForm,
  H2HSharedRanking,
  H2HSummaryData,
  OrientedSides,
} from './types';

// Monta a página de H2H (docs/HEAD_TO_HEAD.md) a partir da URL e das
// tabelas: ids e números de cada seção, na ordem da HH8. Os nomes e os
// textos ("Você venceu 3") são da tela.

/** Quem abre qual H2H, e em que momento (para as posições do ranking). */
export interface H2HPageRequest {
  sideA: string; // segmento da URL, ex.: "lucassilva+rafaelcosta"
  sideB: string;
  viewerId: string;
  now: string; // ISO 8601
}

export interface H2HPageData extends OrientedSides {
  canonical_path: string; // a URL única do par; a tela redireciona quando difere da pedida
  summary: H2HSummaryData;
  form: { left: H2HForm; right: H2HForm };
  shared_rankings: H2HSharedRanking[]; // só em duplas (HH13); vazia, a seção some
  confrontations: H2HConfrontation[];
  cross_pairs: H2HCrossPair[]; // só em duplas (HH2); vazia, a seção some
}

export type H2HPageResult = { status: 'found'; page: H2HPageData } | { status: 'not_found'; reason: string };

/**
 * Página de H2H pedida pela URL, ou "H2H não encontrado" (§6.1) com o motivo.
 * Ex.: `buildH2HPage(mockH2HDomain, { sideA: 'lucassilva', sideB: 'pedrohenrique', viewerId, now })`.
 */
export function buildH2HPage(domain: H2HDomain, request: H2HPageRequest): H2HPageResult {
  const route = resolveH2HRoute(domain, request.sideA, request.sideB);
  if (route.status === 'not_found') return route;
  const view = orientSides(route.sides, request.viewerId);
  const confrontations = h2hConfrontations(domain, view);
  const page: H2HPageData = {
    ...view,
    canonical_path: route.canonical_path,
    summary: h2hSummary(confrontations),
    form: { left: h2hForm(domain, view.left), right: h2hForm(domain, view.right) },
    shared_rankings: h2hSharedRankings(domain, view.left, view.right, request.now),
    confrontations,
    cross_pairs: h2hCrossPairs(domain, view, request.viewerId),
  };
  return { status: 'found', page };
}
