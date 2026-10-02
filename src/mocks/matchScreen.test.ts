import { describe, expect, it } from 'vitest';
import { buildH2HPage } from '@/src/lib/domain/h2h';
import { rankingImpactOf } from '@/src/lib/domain/rankingImpact';
import { scheduleViewOf } from '@/src/lib/domain/schedule-state';
import { computeStandings } from '@/src/lib/domain/standings';
import { mockDomain, mockH2HDomain } from './domain';
import { MOCK_VIEWER_ID, matchScreenDataOf } from './matchScreen';

const NOW = new Date().toISOString();

describe('dados da tela do confronto nos mocks', () => {
  it('resolve os lados, os nomes e a rodada do confronto', () => {
    const data = matchScreenDataOf('match-arena-mangaba-mb-r3-1');
    expect(data?.sideNames).toEqual({ a: 'Lucas e Rafael', b: 'Caio e Diego' });
    expect(data?.categoryName).toBe('Masculino B');
    expect(data?.roundNumber).toBe(3);
    expect(data?.viewerId).toBe(MOCK_VIEWER_ID);
    expect(data?.playerNames['player-diego']).toBe('Diego');
  });

  it('traz o prazo de resposta, a pontuação e os admins do ranking (R14, RG11)', () => {
    const data = matchScreenDataOf('match-arena-mangaba-mb-r3-4');
    expect(data?.match.status).toBe('awaiting_confirmation');
    expect(data?.responseDeadlineHours).toBe(48);
    expect(Object.values(data?.adminNames ?? {})).toContain('Marina');
  });

  it('o confronto sem data do Lucas é "sem data": a última proposta foi retirada (M10)', () => {
    const data = matchScreenDataOf('match-arena-mangaba-mb-r3-1');
    if (data === null) throw new Error('mock da r3-1 ausente');
    expect(scheduleViewOf({ ...data, now: NOW }).kind).toBe('no_date');
  });

  it('traz a categoria na temporada e o link do ranking para o impacto da confirmação (RG18)', () => {
    const data = matchScreenDataOf('match-arena-mangaba-mb-r3-6');
    if (data === null || data.match.status !== 'confirmed') throw new Error('mock da r3-6 confirmada ausente');
    const { standings, match } = data;
    // A rota da classificação é pelo slug, como a da aba Competições (RK1, RK21)
    expect(data.rankingHref).toBe('/ranking/masculino-b?temporada=2026-2#minha-posicao');
    // A mesma tabela da tela de ranking: a posição do impacto é a da classificação ao vivo
    const live = computeStandings({ ...mockDomain, season_id: standings.season_id, category_id: match.category_id });
    const own = live.find((row) => row.enrollment_id === match.side_a_enrollment_id);
    expect(rankingImpactOf(standings, match, match.side_a_enrollment_id)?.position).toBe(own?.position);
  });

  it('H2H das duas duplas: a rota de duplas e o mesmo total do resumo da página (HH16, HH17)', () => {
    const h2h = matchScreenDataOf('match-arena-mangaba-mb-r3-4')?.h2h;
    expect(h2h?.href).toBe('/h2h/lucassilva+rafaelcosta/pedrohenrique+thiagomendes');
    const [sideA, sideB] = ['lucassilva+rafaelcosta', 'pedrohenrique+thiagomendes'];
    const page = buildH2HPage(mockH2HDomain, { sideA, sideB, viewerId: MOCK_VIEWER_ID, now: NOW });
    if (page.status !== 'found') throw new Error(`H2H dos mocks não encontrado: ${page.reason}`);
    expect(h2h?.count).toBe(page.page.summary.total);
    expect(h2h?.count).toBeGreaterThan(1);
  });

  it('sem confronto jogado entre as duplas, sem H2H', () => {
    expect(matchScreenDataOf('match-arena-mangaba-mb-r3-1')?.h2h).toBeNull();
  });

  it('partida que não existe ou não é do ranking não tem tela de marcação (M1)', () => {
    expect(matchScreenDataOf('match-inexistente')).toBeNull();
    for (const kind of ['friendly', 'tournament'] as const) {
      const match = mockDomain.matches.find((candidate) => candidate.kind === kind);
      expect(match && matchScreenDataOf(match.id)).toBeNull();
    }
  });
});
