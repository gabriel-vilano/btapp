import { describe, expect, it } from 'vitest';
import { competitionSituation } from './situation';
import { exploreDomain, NOW, ranking, round, season, tournament } from './explore.test-utils';

const league = ranking('rk', 'Ranking');
const running = season('s', 'rk', '2026-08-01T15:00:00.000Z', '2026-12-20T15:00:00.000Z');

describe('competitionSituation (EX10)', () => {
  it('ranking em andamento: a rodada que já começou, com o total da temporada', () => {
    const domain = exploreDomain({
      seasons: [running],
      rounds: [
        round('s', 1, '2026-08-01T15:00:00.000Z'),
        round('s', 2, '2026-08-25T15:00:00.000Z'),
        round('s', 3, '2026-09-20T15:00:00.000Z'),
        round('s', 4, '2026-10-15T15:00:00.000Z'),
      ],
    });
    expect(competitionSituation(league, domain, NOW)).toBe('Rodada 3 de 4');
  });

  it('temporada começou e o primeiro sorteio ainda não', () => {
    const domain = exploreDomain({ seasons: [running], rounds: [round('s', 1, '2026-10-05T15:00:00.000Z')] });
    expect(competitionSituation(league, domain, NOW)).toBe('Primeira rodada ainda não sorteada');
  });

  it('ranking entre temporadas', () => {
    const domain = exploreDomain({ seasons: [season('s', 'rk', '2026-02-01T15:00:00.000Z', '2026-07-01T15:00:00.000Z')] });
    expect(competitionSituation(league, domain, NOW)).toBe('Entre temporadas');
  });

  it('torneio aberto: a data do TournamentSummaryItem e o local', () => {
    const event = tournament('t', 'Copa', '2026-10-10T12:00:00.000Z', '2026-10-11T21:00:00.000Z');
    expect(competitionSituation(event, exploreDomain({}), NOW)).toBe(
      '10 e 11 de outubro · Quadra Central · Belo Horizonte/MG',
    );
  });

  it('torneio que já aconteceu', () => {
    const event = tournament('t', 'Copa', '2026-08-15T12:00:00.000Z', '2026-08-16T21:00:00.000Z');
    expect(competitionSituation(event, exploreDomain({}), NOW)).toBe('Encerrado');
  });
});
