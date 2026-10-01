import { describe, expect, it } from 'vitest';
import { pendingItem, rankingItem, tabData, tournamentItem } from './competitionsTab.test-utils';
import { competitionsTabContent } from './tabContent';
import type { PastSeasonItem } from './types';

const lastSeason: PastSeasonItem = {
  enrollment_id: 'past-1',
  competition_name: 'Ranking Bacuri',
  category_name: 'Masculino B',
  season_name: '1º semestre 2026',
  partner_name: 'Rafael',
  final_position: 4,
  href: '/ranking/masculino-b?temporada=2026-1',
};

describe('competitionsTabContent', () => {
  it('mostra a lista ordenada quando há inscrição ativa', () => {
    const tab = tabData({ competitions: [tournamentItem('t1', '2026-10-01'), rankingItem('r1', '2026-03-01')] });
    const { myCompetitions } = competitionsTabContent(tab);
    expect(myCompetitions.kind).toBe('list');
    if (myCompetitions.kind !== 'list') return;
    expect(myCompetitions.items.map((item) => item.enrollment_id)).toEqual(['r1', 't1']);
  });

  it('com inscrição ativa, ignora a temporada passada', () => {
    const tab = tabData({ competitions: [rankingItem('r1', '2026-03-01')], last_season: lastSeason });
    expect(competitionsTabContent(tab).myCompetitions.kind).toBe('list');
  });

  it('sem inscrição ativa, mostra a última temporada (9.2)', () => {
    const { myCompetitions } = competitionsTabContent(tabData({ last_season: lastSeason }));
    expect(myCompetitions).toEqual({ kind: 'past_season', season: lastSeason });
  });

  it('jogador novo, sem nenhuma inscrição, cai no vazio de nunca inscrito (9.2)', () => {
    expect(competitionsTabContent(tabData({})).myCompetitions).toEqual({ kind: 'never_enrolled' });
  });

  it('traz as pendências do admin na ordem de exibição', () => {
    const tab = tabData({
      is_admin: true,
      admin_pendings: [pendingItem('nova', '2026-09-25'), pendingItem('velha', '2026-09-18')],
    });
    expect(competitionsTabContent(tab).adminPendings.map((pending) => pending.id)).toEqual(['velha', 'nova']);
  });

  it('admin sem pendência: o bloco some (N30)', () => {
    expect(competitionsTabContent(tabData({ is_admin: true })).adminPendings).toEqual([]);
  });

  it('quem não é admin nunca recebe o bloco (N30)', () => {
    const tab = tabData({ admin_pendings: [pendingItem('p1', '2026-09-20')] });
    expect(competitionsTabContent(tab).adminPendings).toEqual([]);
  });
});
