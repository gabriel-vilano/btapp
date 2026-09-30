import type { MatchFormat, MatchSet, NormalResult, ScoringRule } from '@/src/types/domain';
import { matchPoints } from '../matchPoints';

// Bloco Regras da página da competição (docs/RANKING.md, RK17 e RK18) em
// linguagem de jogador. Os valores vêm da regra do próprio ranking (R9), nunca
// dos padrões do app: um ranking com vitória de 60 mostra 60.

/** Um item da tabela de pontos: "Vitória" → "100 pontos, mais 2 por game vencido…". */
export interface ScoringLine {
  label: string;
  text: string;
}

/** Placar do exemplo e os pontos de cada lado, pela regra do ranking. */
export interface ScoringExample {
  score: string; // '6/4 6/3'
  winner_points: number;
  loser_points: number;
}

const FORMAT_TEXT: Record<MatchFormat, string> = {
  one_set_of_8: '1 set de 8 games. No 7/7, vai a 9; no 8/8, tie-break a 7.',
  one_set_of_6: '1 set de 6 games. No 5/5, vai a 7; no 6/6, tie-break a 7.',
  two_sets_of_6_stb:
    '2 sets de 6 games. No 1 set a 1, a partida se decide no super tiebreak: 10 pontos, com 2 de vantagem.',
};

/** Formato da partida (R29). Ex.: `one_set_of_6` → "1 set de 6 games. No 5/5, vai a 7; …". */
export function formatMatchFormatRule(format: MatchFormat): string {
  return FORMAT_TEXT[format];
}

/** "1 ponto", "0 pontos", "110 pontos". */
export function formatPoints(points: number): string {
  return points === 1 ? '1 ponto' : `${points} pontos`;
}

// Um valor por game com sinal vira "mais 2" ou "menos 2"; zero some da frase
function perGamePhrase(value: number, what: string): string | null {
  if (value === 0) return null;
  return `${value > 0 ? 'mais' : 'menos'} ${Math.abs(value)} por game ${what}`;
}

/**
 * Bônus de games da regra, ou null quando ela não conta games.
 * Ex.: padrão → "mais 2 por game vencido e menos 2 por game perdido".
 */
export function gameBonusPhrase(rule: ScoringRule): string | null {
  const parts = [perGamePhrase(rule.per_game_won, 'vencido'), perGamePhrase(rule.per_game_lost, 'perdido')];
  const present = parts.filter((part): part is string => part !== null);
  return present.length > 0 ? present.join(' e ') : null;
}

function withBonus(base: number, bonus: string | null): string {
  return bonus ? `${formatPoints(base)}, ${bonus}` : formatPoints(base);
}

function retirementText(rule: ScoringRule, bonus: string | null): string {
  const bases = `quem venceu leva ${formatPoints(rule.retirement_winner)} e quem desistiu, ${formatPoints(rule.retirement_retiree)}`;
  const games = bonus ? ', com os games do placar completo' : '';
  return `o placar é completado pelo formato; ${bases}${games}`;
}

/**
 * Tabela de pontos do ranking (R9–R11, R36), um item por tipo de resultado.
 * Ex.: `scoringLines(DEFAULT_SCORING_RULE)[0]` → `{ label: 'Vitória', text: '100 pontos, mais 2 …' }`.
 */
export function scoringLines(rule: ScoringRule): ScoringLine[] {
  const bonus = gameBonusPhrase(rule);
  return [
    { label: 'Vitória', text: withBonus(rule.win, bonus) },
    { label: 'Derrota', text: withBonus(rule.loss, bonus) },
    {
      label: 'W.O.',
      text: `${formatPoints(rule.wo_winner)} para quem compareceu e ${formatPoints(rule.wo_absent)} para quem faltou`,
    },
    { label: 'Desistência', text: retirementText(rule, bonus) },
    { label: 'W.O. duplo', text: `${formatPoints(0)} para os dois lados` }, // R36: fixo, sem campo na regra
  ];
}

// Um placar comum em cada formato. O 6/4 6/3 da spec (RK17) só vale em 2 sets:
// no set único, o exemplo é o primeiro set dele, para o cálculo não quebrar
const EXAMPLE_SETS: Record<MatchFormat, MatchSet[]> = {
  two_sets_of_6_stb: [gamesSet(6, 4), gamesSet(6, 3)],
  one_set_of_6: [gamesSet(6, 4)],
  one_set_of_8: [gamesSet(8, 5)],
};

function gamesSet(winnerGames: number, loserGames: number): MatchSet {
  return { games_a: winnerGames, games_b: loserGames, super_tiebreak: false, interrupted: false };
}

/**
 * Exemplo calculado com a regra do ranking pelo `matchPoints` (RK18).
 * Ex.: 2 sets com a regra padrão → `{ score: '6/4 6/3', winner_points: 110, loser_points: 40 }`.
 */
export function scoringExample(format: MatchFormat, rule: ScoringRule): ScoringExample {
  const sets = EXAMPLE_SETS[format];
  const result: NormalResult = { type: 'normal', winner: 'a', sets };
  const points = matchPoints(result, format, rule);
  return {
    score: sets.map((set) => `${set.games_a}/${set.games_b}`).join(' '),
    winner_points: points.a,
    loser_points: points.b,
  };
}

/** O super tiebreak vale 1 game (R9): só faz sentido explicar no formato que tem STB. */
export function superTiebreakNote(format: MatchFormat, rule: ScoringRule): string | null {
  if (format !== 'two_sets_of_6_stb' || gameBonusPhrase(rule) === null) return null;
  return 'O super tiebreak conta como 1 game para quem o vence.';
}

/** Ordem de desempate (R37). A lista é fixa no MVP. */
export const TIEBREAK_ORDER: readonly string[] = [
  'Pontos',
  'Confronto direto, quando o empate é entre dois e eles já se enfrentaram',
  'Vitórias, contando as por W.O.',
  'Saldo de games',
  'Decisão do admin',
];

// A linha da tabela conta só jogo disputado (RK8); o desempate conta o W.O.
// vencido (R37). Sem a nota, a mesma palavra teria dois números na tela
export const TIEBREAK_WO_NOTE =
  'No desempate, a vitória por W.O. conta. Na linha da classificação, "vitórias" conta só os jogos disputados.';

/** Prazo para confirmar (R14). Ex.: 48 → "Depois do lançamento, o adversário tem 48h …". */
export function confirmationDeadlineText(hours: number): string {
  return `Depois do lançamento, o adversário tem ${hours}h para confirmar ou contestar. Sem resposta, o resultado é confirmado sozinho.`;
}

/** O que acontece com a partida sem jogo no prazo da rodada (R40). */
export const NOT_PLAYED_TEXT =
  'Partida sem resultado até o fim da rodada vai para o admin. Ele decide entre W.O. para um lado, W.O. duplo ou cancelamento, olhando o histórico de propostas de horário. O app nunca aplica W.O. sozinho.';
