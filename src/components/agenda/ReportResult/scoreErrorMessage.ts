import { setKindsOf, type ScoreErrorCode } from "@/src/lib/domain/matchScore";
import { isFinishedSet, isInProgressSet, setWinner, type SetKind } from "@/src/lib/domain/setRules";
import type { MatchFormat, MatchSet } from "@/src/types/domain";

// Mensagem ao jogador quando o placar é recusado pelo `validateScore`
// (docs/RESULTS.md §3.7). Diz qual set e por quê, com o valor recebido e o
// formato esperado. Com a entrada da RG12, quase nunca aparece: o servidor
// valida de novo, e o set interrompido e o STB usam campos numéricos.

/**
 * Mensagem de um `code` do `validateScore`, com o set que falhou quando dá para achar.
 * @example scoreErrorMessage("set_score", "one_set_of_6", [set(6, 5)]) // "6/5 não fecha o set de 6. …"
 */
export function scoreErrorMessage(code: ScoreErrorCode, format: MatchFormat, sets: readonly MatchSet[]): string {
  switch (code) {
    case "no_sets":
      return "Informe o placar do set 1.";
    case "set_score":
      return setScoreMessage(format, sets);
    case "undecided":
      return undecidedMessage(sets);
    case "too_many_sets":
      return tooManySetsMessage(format, sets);
    case "set_type":
      return "O super tiebreak só existe no 3º set do formato de 2 sets.";
    case "interrupted_set":
      return "Na desistência, informe o placar do set em que ela aconteceu.";
    case "winner_mismatch":
      return "O vencedor não bate com o placar. Confira quem venceu cada set.";
  }
}

function scoreText(set: MatchSet): string {
  return `${Math.max(set.games_a, set.games_b)}/${Math.min(set.games_a, set.games_b)}`;
}

function setName(kind: SetKind): string {
  return kind.type === "games" ? `set de ${kind.target}` : "super tiebreak";
}

/** Placares que fecham o set. Ex.: set de 6 → "6/0 a 6/4, 7/5 e 7/6". */
function validScores(kind: SetKind): string {
  if (kind.type === "super_tiebreak") return "a 10, com 2 de vantagem (ex.: 10/8, 12/10)";
  const n = kind.target;
  return `${n}/0 a ${n}/${n - 2}, ${n + 1}/${n - 1} e ${n + 1}/${n}`;
}

function isValidSet(set: MatchSet, kind: SetKind): boolean {
  return set.interrupted ? isInProgressSet(set, kind) : isFinishedSet(set, kind);
}

function setScoreMessage(format: MatchFormat, sets: readonly MatchSet[]): string {
  const kinds = setKindsOf(format);
  const index = sets.findIndex((set, i) => kinds[i] !== undefined && !isValidSet(set, kinds[i]));
  if (index === -1) return "Um dos sets tem um placar que o formato não fecha. Confira os games de cada lado.";
  const set = sets[index];
  if (set.interrupted) {
    return `${scoreText(set)} não é um placar parcial no ${setName(kinds[index])}. Confira os games de cada lado.`;
  }
  return `${scoreText(set)} não fecha o ${setName(kinds[index])}. Placares válidos: ${validScores(kinds[index])}.`;
}

function undecidedMessage(sets: readonly MatchSet[]): string {
  const won = sets.filter((set) => !set.interrupted).map(setWinner);
  const isTied = won.length === 2 && won[0] !== won[1];
  if (isTied) return "Com 1 set para cada lado, falta o super tiebreak.";
  return "O placar não fecha a partida. Informe todos os sets.";
}

function tooManySetsMessage(format: MatchFormat, sets: readonly MatchSet[]): string {
  const toWin = Math.ceil(setKindsOf(format).length / 2);
  const tally = { a: 0, b: 0 };
  for (const [index, set] of sets.entries()) {
    tally[setWinner(set)] += 1;
    const isDecided = tally.a >= toWin || tally.b >= toWin;
    if (isDecided && index < sets.length - 1) {
      return `A partida já estava decidida no set ${index + 1}. Remova o set ${index + 2}.`;
    }
  }
  const limit = setKindsOf(format).length;
  return `O formato tem ${limit === 1 ? "1 set" : `${limit} sets`}. Remova o set ${limit + 1}.`;
}
