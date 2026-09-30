import { describe, expect, it } from 'vitest';
import { currentSeason, isCompetitionOpen } from './competitionStatus';
import { exploreDomain, NOW, ranking, season, tournament } from './explore.test-utils';

const league = ranking('rk', 'Ranking');

describe('isCompetitionOpen (EXPLORE.md §1, "Termos")', () => {
  it('ranking com temporada em andamento é aberto', () => {
    const domain = exploreDomain({ seasons: [season('s', 'rk', '2026-08-01T15:00:00.000Z', '2026-12-20T15:00:00.000Z')] });
    expect(isCompetitionOpen(league, domain, NOW)).toBe(true);
  });

  it('entre temporadas (a última terminou e a próxima não começou) é encerrado', () => {
    const domain = exploreDomain({
      seasons: [
        season('passada', 'rk', '2026-02-01T15:00:00.000Z', '2026-07-01T15:00:00.000Z'),
        season('proxima', 'rk', '2026-10-15T15:00:00.000Z', '2027-02-01T15:00:00.000Z'),
      ],
    });
    expect(isCompetitionOpen(league, domain, NOW)).toBe(false);
    expect(currentSeason(league, domain, NOW)).toBeNull();
  });

  it('a temporada de outro ranking não conta', () => {
    const domain = exploreDomain({ seasons: [season('s', 'outro', '2026-08-01T15:00:00.000Z', '2026-12-20T15:00:00.000Z')] });
    expect(isCompetitionOpen(league, domain, NOW)).toBe(false);
  });

  it('a temporada que termina hoje ainda está em andamento', () => {
    const domain = exploreDomain({ seasons: [season('s', 'rk', '2026-08-01T15:00:00.000Z', '2026-09-30T13:00:00.000Z')] });
    expect(currentSeason(league, domain, NOW)?.id).toBe('s');
  });

  it('torneio futuro é aberto', () => {
    const event = tournament('t', 'Torneio', '2026-10-10T12:00:00.000Z', '2026-10-11T21:00:00.000Z');
    expect(isCompetitionOpen(event, exploreDomain({}), NOW)).toBe(true);
  });

  it('torneio que termina hoje é aberto, mesmo depois do último jogo', () => {
    const event = tournament('t', 'Torneio', '2026-09-29T12:00:00.000Z', '2026-09-30T13:00:00.000Z');
    expect(isCompetitionOpen(event, exploreDomain({}), NOW)).toBe(true);
  });

  it('usa o dia de Brasília: 1h UTC de hoje ainda é ontem na quadra', () => {
    const event = tournament('t', 'Torneio', '2026-09-29T12:00:00.000Z', '2026-09-30T01:00:00.000Z');
    expect(isCompetitionOpen(event, exploreDomain({}), NOW)).toBe(false);
  });

  it('torneio que já aconteceu é encerrado', () => {
    const event = tournament('t', 'Torneio', '2026-08-15T12:00:00.000Z', '2026-08-16T21:00:00.000Z');
    expect(isCompetitionOpen(event, exploreDomain({}), NOW)).toBe(false);
  });
});
