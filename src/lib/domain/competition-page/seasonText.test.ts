import { describe, expect, it } from 'vitest';
import {
  formatFinalLine,
  formatRoundDeadline,
  formatRoundLine,
  formatSeasonDates,
} from './seasonText';

// Meio-dia em Brasília (15h UTC), longe da virada do dia nos dois fusos
const NOW = '2026-09-29T15:00:00.000Z';

describe('formatSeasonDates', () => {
  it('mostra dia e mês no fuso de Brasília', () => {
    // 01h UTC do dia 11 ainda é dia 10 em Brasília
    expect(formatSeasonDates('2026-08-11T01:00:00.000Z', '2026-12-20T15:00:00.000Z')).toBe('10/08 a 20/12');
  });

  it('recusa data inválida com o valor recebido', () => {
    expect(() => formatSeasonDates('ontem', NOW)).toThrow("recebi 'ontem'");
  });
});

describe('formatRoundDeadline', () => {
  it('conta dias de calendário até o prazo (RK4)', () => {
    expect(formatRoundDeadline('2026-10-04T15:00:00.000Z', NOW)).toBe('fecha em 5 dias');
  });

  it('prazo amanhã à noite fecha amanhã, mesmo com menos de 24h', () => {
    expect(formatRoundDeadline('2026-09-30T13:00:00.000Z', NOW)).toBe('fecha amanhã');
  });

  it('prazo ainda hoje fecha hoje', () => {
    expect(formatRoundDeadline('2026-09-29T22:00:00.000Z', NOW)).toBe('fecha hoje');
  });

  it('prazo passado aparece como encerrado', () => {
    expect(formatRoundDeadline('2026-09-29T14:00:00.000Z', NOW)).toBe('prazo encerrado');
  });
});

describe('formatRoundLine', () => {
  const deadline = '2026-10-04T15:00:00.000Z';

  it('com total fixo, mostra "de N" (RK4)', () => {
    expect(formatRoundLine({ number: 3, total: 4, deadline }, NOW)).toBe('Rodada 3 de 4 · fecha em 5 dias');
  });

  it('sem total fixo, só o número', () => {
    expect(formatRoundLine({ number: 3, total: null, deadline }, NOW)).toBe('Rodada 3 · fecha em 5 dias');
  });

  it('antes do primeiro sorteio, diz que não há rodada', () => {
    expect(formatRoundLine(null, NOW)).toBe('Primeira rodada ainda não sorteada');
  });
});

describe('formatFinalLine', () => {
  const final = { name: 'Saideira', qualifiers: 8, cutoff_date: '2026-11-30T15:00:00.000Z' };

  it('antes do corte, mostra as vagas e a data de corte (R27, R28)', () => {
    expect(formatFinalLine(final, NOW)).toBe('Saideira · 8 vagas por categoria · corte em 30/11');
  });

  it('com uma vaga, singular', () => {
    expect(formatFinalLine({ ...final, qualifiers: 1 }, NOW)).toContain('1 vaga por categoria');
  });

  it('depois do corte, a classificação está definida', () => {
    expect(formatFinalLine(final, '2026-12-01T15:00:00.000Z')).toBe('Saideira · classificação definida em 30/11');
  });
});
