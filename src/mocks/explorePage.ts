import {
  exploreShowcase,
  organizationPageView,
  type ExploreShowcaseView,
  type OrganizationPageView,
} from '@/src/lib/domain/explore';
import { mockExploreDomain } from './domain';
import { mockExploreRoutes } from './exploreRoutes';
import { MOCK_VIEWER_ID } from './rankingRoutes';

// Vitrine e página da organização do Explorar (docs/EXPLORE.md §3 e §5) sobre
// o cenário do `mockExploreDomain`, vistas pelo Lucas, até a integração com o
// Supabase. `now` vem de quem chama: a página lê a cada acesso.

/** A vitrine do Lucas: o selo "Você participa" no Ranking Arena Mangaba e na Copa Tucum. */
export function mockExploreShowcase(now: string): ExploreShowcaseView {
  return exploreShowcase(mockExploreDomain, { playerId: MOCK_VIEWER_ID, now }, mockExploreRoutes);
}

/** Página da organização pelo @username (EX22), ou null quando ele não existe nos mocks. */
export function mockOrganizationPage(username: string, now: string): OrganizationPageView | null {
  return organizationPageView(username, mockExploreDomain, { playerId: MOCK_VIEWER_ID, now }, mockExploreRoutes);
}
