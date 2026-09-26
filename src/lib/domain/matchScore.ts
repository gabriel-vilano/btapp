import type {
  MatchFormat,
  MatchSet,
  MatchSideKey,
  NormalResult,
  RetiredResult,
} from '@/src/types/domain';
import {
  completeSet,
  isFinishedSet,
  isInProgressSet,
  setWinner,
  wholeSetFor,
  type SetKind,
} from './setRules';

// Placar da partida pelo formato (docs/DOMAIN.md, R29): valida o placar
// lançado e completa o placar da desistência (R11).

/** Resultado que tem placar. W.O. e W.O. duplo não têm (§1, "Placar"). */
export type ScoredResult = NormalResult | RetiredResult;

/** Motivo de um placar inválido, para a UI escolher a mensagem. */
export type ScoreErrorCode =
  | 'no_sets'
  | 'too_many_sets' // set além do formato ou depois da partida decidida
  | 'set_type' // super tiebreak fora do 3º set do formato de 2 sets, ou set normal no lugar dele
  | 'interrupted_set' // set interrompido fora da desistência ou fora do último set
  | 'set_score'
  | 'undecided' // resultado normal cujo placar não fecha a partida
  | 'winner_mismatch';

export type ScoreValidation =
  | { valid: true }
  | { valid: false; code: ScoreErrorCode; message: string };

const SIX: SetKind = { type: 'games', target: 6 };
const EIGHT: SetKind = { type: 'games', target: 8 };
const SUPER_TIEBREAK: SetKind = { type: 'super_tiebreak' };

const SET_KINDS: Record<MatchFormat, SetKind[]> = {
  one_set_of_6: [SIX],
  one_set_of_8: [EIGHT],
  two_sets_of_6_stb: [SIX, SIX, SUPER_TIEBREAK],
};

// O STB conta como set: no formato de 2 sets, quem fecha 2 vence
const SETS_TO_WIN: Record<MatchFormat, number> = {
  one_set_of_6: 1,
  one_set_of_8: 1,
  two_sets_of_6_stb: 2,
};

type SetTally = Record<MatchSideKey, number>;

function tallySets(sets: MatchSet[]): SetTally {
  const tally: SetTally = { a: 0, b: 0 };
  for (const set of sets) tally[setWinner(set)] += 1;
  return tally;
}

function decidedWinner(tally: SetTally, format: MatchFormat): MatchSideKey | null {
  if (tally.a >= SETS_TO_WIN[format]) return 'a';
  if (tally.b >= SETS_TO_WIN[format]) return 'b';
  return null;
}

function invalid(code: ScoreErrorCode, message: string): ScoreValidation {
  return { valid: false, code, message };
}

const VALID: ScoreValidation = { valid: true };

function describeSet(set: MatchSet, index: number): string {
  return `set ${index + 1} (${set.games_a}/${set.games_b})`;
}

/** Valida o set `index` isolado: tipo, marcação de interrompido e placar. */
function validateSet(result: ScoredResult, format: MatchFormat, index: number): ScoreValidation {
  const set = result.sets[index];
  const kind = SET_KINDS[format][index];
  const isLast = index === result.sets.length - 1;
  if (kind === undefined) return invalid('too_many_sets', `${describeSet(set, index)} não existe no formato ${format}`);
  if (set.super_tiebreak !== (kind.type === 'super_tiebreak')) {
    return invalid('set_type', `${describeSet(set, index)}: super tiebreak só no 3º set do formato de 2 sets`);
  }
  if (set.interrupted && (result.type !== 'retired' || !isLast)) {
    return invalid('interrupted_set', `${describeSet(set, index)}: só o último set da desistência é interrompido`);
  }
  if (result.type === 'retired' && isLast && !set.interrupted) {
    return invalid('interrupted_set', `${describeSet(set, index)}: na desistência, o último set é o interrompido`);
  }
  const scoreOk = set.interrupted ? isInProgressSet(set, kind) : isFinishedSet(set, kind);
  if (scoreOk) return VALID;
  const expected = set.interrupted ? 'um placar parcial alcançável' : 'um placar de set encerrado';
  return invalid('set_score', `${describeSet(set, index)}: esperado ${expected} pela regra do formato ${format}`);
}

/** Valida set a set e confere que nenhum set vem depois da partida decidida. */
function validateSets(result: ScoredResult, format: MatchFormat): ScoreValidation {
  for (let index = 0; index < result.sets.length; index++) {
    if (decidedWinner(tallySets(result.sets.slice(0, index)), format) !== null) {
      return invalid('too_many_sets', `${describeSet(result.sets[index], index)} vem depois da partida decidida`);
    }
    const check = validateSet(result, format, index);
    if (!check.valid) return check;
  }
  return VALID;
}

function validateNormalOutcome(result: NormalResult, format: MatchFormat): ScoreValidation {
  const winner = decidedWinner(tallySets(result.sets), format);
  if (winner === null) return invalid('undecided', `placar ${formatScore(result.sets)} não fecha a partida no formato ${format}`);
  if (winner !== result.winner) {
    return invalid('winner_mismatch', `placar ${formatScore(result.sets)} dá vitória ao lado ${winner}, mas o vencedor lançado é ${result.winner}`);
  }
  return VALID;
}

/**
 * Valida o placar lançado pelo formato da partida (R29). No normal, a partida
 * precisa fechar com o vencedor lançado; na desistência, o último set é o
 * interrompido, com placar parcial, e a partida ainda não estava decidida.
 * Ex.: `validateScore({ type: 'normal', winner: 'a', sets: [gameSet(6, 4)] }, 'one_set_of_6')`.
 */
export function validateScore(result: ScoredResult, format: MatchFormat): ScoreValidation {
  if (result.sets.length === 0) return invalid('no_sets', `resultado ${result.type} sem nenhum set`);
  const setsCheck = validateSets(result, format);
  if (!setsCheck.valid || result.type === 'retired') return setsCheck;
  return validateNormalOutcome(result, format);
}

/** Placar em texto, para mensagens. Ex.: "6/4 3/6 10/7". */
export function formatScore(sets: MatchSet[]): string {
  return sets.map((set) => `${set.games_a}/${set.games_b}`).join(' ');
}

/**
 * Placar da desistência completado pelo formato (R11): o vencedor ganha todos
 * os games seguintes até a partida fechar, e o desistente fica com os que
 * tinha. Se a partida chegaria a 1 set a 1, o STB vai para o vencedor.
 * Lança erro se o placar lançado for inválido.
 */
export function completeRetiredScore(result: RetiredResult, format: MatchFormat): MatchSet[] {
  const check = validateScore(result, format);
  if (!check.valid) throw new Error(`Placar de desistência inválido: ${check.message}`);
  const lastIndex = result.sets.length - 1;
  const lastSet = completeSet(result.sets[lastIndex], SET_KINDS[format][lastIndex], result.winner);
  const completed = [...result.sets.slice(0, lastIndex), lastSet];
  while (decidedWinner(tallySets(completed), format) === null) {
    completed.push(wholeSetFor(SET_KINDS[format][completed.length], result.winner));
  }
  return completed;
}
