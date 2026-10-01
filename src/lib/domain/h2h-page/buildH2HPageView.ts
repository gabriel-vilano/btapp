import { buildH2HPage, type H2HPageData, type H2HPageRequest } from '../h2h';
import { crossPairViews, h2hNames, matchViews, sideView, standingViews } from './sections';
import type { H2HPageDomain, H2HPageLinks, H2HPageView, H2HPageViewResult } from './types';

// Monta a página de H2H no formato da tela: o `buildH2HPage` do domínio com
// os nomes, os textos que falam com quem vê (HH6) e as rotas.

function summaryOf({ summary }: H2HPageData): H2HPageView['summary'] {
  if (summary.last_played_at === null) return null;
  return { left_wins: summary.left_wins, right_wins: summary.right_wins, last_played_at: summary.last_played_at };
}

function toView(domain: H2HPageDomain, page: H2HPageData, links: H2HPageLinks): H2HPageView {
  const names = h2hNames(domain);
  const left = sideView(names, page.left, page.viewer_is_left);
  const right = sideView(names, page.right, false);
  return {
    kind: page.kind,
    viewer_is_left: page.viewer_is_left,
    title: `${left.name} × ${right.name}`,
    left,
    right,
    summary: summaryOf(page),
    form: { status: 'ready', data: page.form },
    rankings: { status: 'ready', data: standingViews(names, page.shared_rankings, { left, right }, links) },
    confrontations: matchViews(names, page.confrontations, page.left),
    cross_pairs: crossPairViews(names, page.cross_pairs),
  };
}

/**
 * Página de H2H pedida pela URL, pronta para a tela, ou "H2H não encontrado" (§6.1).
 * Ex.: `buildH2HPageView(mockH2HDomain, { sideA: 'pedrohenrique', sideB: 'lucassilva', viewerId, now }, links)`
 * → Lucas à esquerda, com "Você".
 */
export function buildH2HPageView(domain: H2HPageDomain, request: H2HPageRequest, links: H2HPageLinks): H2HPageViewResult {
  const result = buildH2HPage(domain, request);
  if (result.status === 'not_found') return result;
  return { status: 'found', view: toView(domain, result.page, links), canonical_path: result.page.canonical_path };
}
