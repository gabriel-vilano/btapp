import { describe, expect, it } from 'vitest';
import { DEFAULT_SCORING_RULE, type ScoringRule } from '@/src/types/domain';
import {
  confirmationDeadlineText,
  formatMatchFormatRule,
  formatPoints,
  gameBonusPhrase,
  scoringExample,
  scoringLines,
  superTiebreakNote,
} from './rulesText';

const customRule: ScoringRule = {
  win: 60,
  loss: 20,
  per_game_won: 1,
  per_game_lost: -1,
  wo_winner: 60,
  wo_absent: 0,
  retirement_winner: 60,
  retirement_retiree: 20,
};

const noGamesRule: ScoringRule = { ...customRule, per_game_won: 0, per_game_lost: 0 };

describe('scoringLines', () => {
  it('descreve a regra padrão em linguagem de jogador (R9–R11, R36)', () => {
    expect(scoringLines(DEFAULT_SCORING_RULE)).toEqual([
      { label: 'Vitória', text: '100 pontos, mais 2 por game vencido e menos 2 por game perdido' },
      { label: 'Derrota', text: '50 pontos, mais 2 por game vencido e menos 2 por game perdido' },
      { label: 'W.O.', text: '100 pontos para quem compareceu e 0 pontos para quem faltou' },
      {
        label: 'Desistência',
        text: 'o placar é completado pelo formato; quem venceu leva 100 pontos e quem desistiu, 50 pontos, com os games do placar completo',
      },
      { label: 'W.O. duplo', text: '0 pontos para os dois lados' },
    ]);
  });

  it('usa os valores do próprio ranking, não os padrões (RK18)', () => {
    const [win, loss] = scoringLines(customRule);
    expect(win.text).toBe('60 pontos, mais 1 por game vencido e menos 1 por game perdido');
    expect(loss.text).toBe('20 pontos, mais 1 por game vencido e menos 1 por game perdido');
  });

  it('sem bônus de games, a frase para no valor base', () => {
    const lines = scoringLines(noGamesRule);
    expect(lines[0].text).toBe('60 pontos');
    expect(lines[3].text).not.toContain('games do placar');
  });
});

describe('gameBonusPhrase', () => {
  it('omite o lado que vale zero', () => {
    expect(gameBonusPhrase({ ...customRule, per_game_lost: 0 })).toBe('mais 1 por game vencido');
  });

  it('devolve null quando a regra não conta games', () => {
    expect(gameBonusPhrase(noGamesRule)).toBeNull();
  });
});

describe('formatPoints', () => {
  it('concorda com o número', () => {
    expect(formatPoints(1)).toBe('1 ponto');
    expect(formatPoints(0)).toBe('0 pontos');
    expect(formatPoints(110)).toBe('110 pontos');
  });
});

describe('scoringExample', () => {
  it('calcula o 6/4 6/3 com a regra padrão pelo matchPoints (RK18)', () => {
    expect(scoringExample('two_sets_of_6_stb', DEFAULT_SCORING_RULE)).toEqual({
      score: '6/4 6/3',
      winner_points: 110,
      loser_points: 40,
    });
  });

  it('calcula o exemplo com a regra do ranking', () => {
    // 60 + 12 − 7 = 65; 20 + 7 − 12 = 15
    expect(scoringExample('two_sets_of_6_stb', customRule)).toEqual({
      score: '6/4 6/3',
      winner_points: 65,
      loser_points: 15,
    });
  });

  it('no set único, usa um placar válido para o formato', () => {
    expect(scoringExample('one_set_of_6', DEFAULT_SCORING_RULE)).toEqual({
      score: '6/4',
      winner_points: 104,
      loser_points: 46,
    });
    expect(scoringExample('one_set_of_8', DEFAULT_SCORING_RULE).score).toBe('8/5');
  });
});

describe('superTiebreakNote', () => {
  it('só aparece no formato com super tiebreak e com bônus de games', () => {
    expect(superTiebreakNote('two_sets_of_6_stb', DEFAULT_SCORING_RULE)).toContain('1 game');
    expect(superTiebreakNote('one_set_of_6', DEFAULT_SCORING_RULE)).toBeNull();
    expect(superTiebreakNote('two_sets_of_6_stb', noGamesRule)).toBeNull();
  });
});

describe('textos fixos', () => {
  it('descreve cada formato da R29', () => {
    expect(formatMatchFormatRule('one_set_of_8')).toMatch(/^1 set de 8 games/);
    expect(formatMatchFormatRule('two_sets_of_6_stb')).toContain('super tiebreak');
  });

  it('usa o prazo de resposta do ranking (R14)', () => {
    expect(confirmationDeadlineText(72)).toContain('72h');
  });
});
