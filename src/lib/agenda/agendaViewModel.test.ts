import { describe, expect, it } from 'vitest';
import { MOCK_AGENDA_LINKS } from '@/src/mocks/agendaViewer';
import { mockDomain, mockEntities } from '@/src/mocks/domain';
import { mockRankingRoutes } from '@/src/mocks/rankingRoutes';
import { daysFromNow } from '@/src/mocks/relativeTime';
import type { AgendaScreenDomain } from './agendaItemModel';
import { agendaViewModel } from './agendaViewModel';

// Regressão: a agenda montava `/ranking/<id-da-categoria>?temporada=<id>`, e a
// rota da classificação só aceita os slugs. O link da temporada encerrada
// caía no 404.

const { players, rankingCategories, season } = mockEntities;

// Depois do fim da temporada, só com as partidas confirmadas: nada aberto.
const endedDomain: AgendaScreenDomain = {
  ...mockDomain,
  matches: mockDomain.matches.filter((match) => match.status === 'confirmed'),
};
const viewer = { playerId: players.lucas.id, now: daysFromNow(45) };

describe('agendaViewModel: temporada encerrada (9.2)', () => {
  it('monta o link pela rota recebida, com a categoria e a temporada', () => {
    const links = { rankingHref: (categoryId: string, seasonId?: string) => `rota:${categoryId}:${seasonId}` };
    const empty = agendaViewModel(endedDomain, viewer, links).empty;
    expect(empty?.kind).toBe('season_ended');
    if (empty?.kind !== 'season_ended') return;
    expect(empty.href).toBe(`rota:${rankingCategories.masculinoB.id}:${season.id}`);
  });

  it('nos mocks, leva à classificação da temporada pelo slug (RK21)', () => {
    const empty = agendaViewModel(endedDomain, viewer, MOCK_AGENDA_LINKS).empty;
    if (empty?.kind !== 'season_ended') throw new Error(`Teste: esperado season_ended, recebi ${empty?.kind}`);
    expect(empty.href).toBe('/ranking/masculino-b?temporada=2026-2');
    // O que a página `app/(app)/ranking/[categoria]` faz com o href: slug → id
    const url = new URL(empty.href, 'https://letzplay.test');
    expect(mockRankingRoutes.categoryId(url.pathname.split('/')[2])).toBe(rankingCategories.masculinoB.id);
    expect(mockRankingRoutes.seasonId(url.searchParams.get('temporada') ?? '')).toBe(season.id);
  });
});
