import { describe, expect, it } from 'vitest';
import { checkRoundDeadline, suggestRoundDeadline } from './roundDeadline';
import { NOW, round, season } from './roundDrawScenario.test-utils';

// Prazo da rodada (SR6). Hoje é 12/10/2026, 10h em Brasília; a rodada 2 durou
// 14 dias, de 28/09 a 11/10 às 23h59.

const second = round(2, '2026-09-28T13:00:00.000Z', '2026-10-12T02:59:00.000Z');

describe('suggestRoundDeadline', () => {
  it('a duração da rodada anterior, contada de hoje, às 23h59 de Brasília', () => {
    expect(suggestRoundDeadline(second, NOW)).toEqual({ deadline: '2026-10-27T02:59:00.000Z', duration_days: 14 });
  });

  it('conta o dia de Brasília, não o de UTC: 22h de 12/10 ainda é 12/10', () => {
    const lateNight = new Date('2026-10-13T01:00:00.000Z');
    expect(suggestRoundDeadline(second, lateNight)?.deadline).toBe('2026-10-27T02:59:00.000Z');
  });

  it('na primeira rodada não há sugestão: o campo vem vazio', () => {
    expect(suggestRoundDeadline(null, NOW)).toBeNull();
  });

  it('recusa rodada anterior com data inválida, com o valor recebido', () => {
    const broken = { ...second, deadline: 'amanhã' };
    expect(() => suggestRoundDeadline(broken, NOW)).toThrow("Prazo inválido: recebi 'amanhã', esperado ISO 8601");
  });
});

describe('checkRoundDeadline', () => {
  it('prazo no futuro, dentro da temporada e antes do corte: válido, sem aviso', () => {
    expect(checkRoundDeadline('2026-10-27T02:59:00.000Z', season, NOW)).toEqual({ valid: true, warnings: [] });
  });

  it('prazo depois da data de corte da final: válido, com aviso (R28)', () => {
    expect(checkRoundDeadline('2026-12-06T02:59:00.000Z', season, NOW)).toEqual({
      valid: true,
      warnings: [{ kind: 'after_final_cutoff', cutoff_date: season.final?.cutoff_date }],
    });
  });

  it('temporada sem final não tem aviso de corte', () => {
    const noFinal = { ...season, final: null };
    expect(checkRoundDeadline('2026-12-06T02:59:00.000Z', noFinal, NOW)).toEqual({ valid: true, warnings: [] });
  });

  it('recusa prazo no passado ou agora', () => {
    const check = checkRoundDeadline(NOW.toISOString(), season, NOW);
    expect(check).toMatchObject({ valid: false, error: { code: 'not_in_future' } });
  });

  it('recusa prazo depois do fim da temporada', () => {
    const check = checkRoundDeadline('2026-12-22T02:59:00.000Z', season, NOW);
    expect(check).toMatchObject({ valid: false, error: { code: 'outside_season' } });
    if (!check.valid) expect(check.error.message).toContain(season.ends_on);
  });

  it('recusa prazo que não é data, com o valor recebido e o formato esperado', () => {
    expect(checkRoundDeadline('26/10', season, NOW)).toEqual({
      valid: false,
      error: { code: 'invalid_date', message: "Prazo inválido: recebi '26/10', esperado ISO 8601" },
    });
  });
});
