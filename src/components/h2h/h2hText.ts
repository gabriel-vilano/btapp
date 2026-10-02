// Textos dos blocos do H2H (docs/HEAD_TO_HEAD.md, seções 4 e 7).
// Só formatação: as contagens chegam prontas por props, calculadas pelo domínio.

const TIMEZONE = "America/Sao_Paulo";

/** Resultado de uma partida, do lado de quem a linha ou a forma fala. */
export type H2HOutcome = "win" | "loss";

/**
 * Como os lados são chamados: jogador ("Você venceu", "Pedro venceu") ou dupla
 * ("Vocês venceram", "Pedro e Thiago venceram"). O verbo concorda com o lado.
 */
export type H2HSideKind = "player" | "pair";

export interface H2HSummaryText {
  leftWins: number;
  rightWins: number;
  lastPlayedAt: string;
  leftLabel: string;
  rightLabel: string;
  sideKind: H2HSideKind;
}

// O H2H cobre anos: "há 2 meses" perde a ordem, então a data é sempre completa (HH14)
const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TIMEZONE,
});

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIMEZONE,
});

function parseDate(iso: string): Date {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Data do H2H inválida: recebi '${iso}', esperado data ISO 8601`);
  }
  return date;
}

/** Data da partida na tela. Ex.: "2026-09-12T13:00:00Z" → "12/09/2026". */
export function formatH2HDate(iso: string): string {
  return shortDateFormatter.format(parseDate(iso));
}

/** Data da partida para o leitor de tela. Ex.: "2026-09-12T13:00:00Z" → "12 de setembro de 2026". */
export function formatH2HSpokenDate(iso: string): string {
  return longDateFormatter.format(parseDate(iso));
}

/** Total de jogos, no meio do resumo. Ex.: 1 → "1 jogo", 4 → "4 jogos". */
export function formatGamesCount(total: number): string {
  return total === 1 ? "1 jogo" : `${total} jogos`;
}

function winVerb(sideKind: H2HSideKind): string {
  return sideKind === "pair" ? "venceram" : "venceu";
}

/**
 * Quem lidera, na linha de apoio do resumo (HH10). Tom neutro, sem superlativo.
 * Ex.: "Você venceu 3", "Pedro e Thiago venceram 3", "Empate em 2 a 2".
 */
export function formatLeader({ leftWins, rightWins, leftLabel, rightLabel, sideKind }: H2HSummaryText): string {
  if (leftWins === rightWins) return `Empate em ${leftWins} a ${rightWins}`;
  const leftLeads = leftWins > rightWins;
  const label = leftLeads ? leftLabel : rightLabel;
  return `${label} ${winVerb(sideKind)} ${Math.max(leftWins, rightWins)}`;
}

/** Linha de apoio do resumo. Ex.: "Você venceu 3 · Último: 12/09/2026". */
export function formatSummaryLine(summary: H2HSummaryText): string {
  return `${formatLeader(summary)} · Último: ${formatH2HDate(summary.lastPlayedAt)}`;
}

// "Pedro não venceu nenhum", não "Pedro venceu 0"
function spokenWins(label: string, wins: number, sideKind: H2HSideKind): string {
  if (wins === 0) return `${label} não ${winVerb(sideKind)} nenhum`;
  return `${label} ${winVerb(sideKind)} ${wins}`;
}

/**
 * O resumo inteiro como uma frase, para o leitor de tela (seção 7).
 * Ex.: "Você venceu 3, Pedro venceu 1, em 4 jogos. Último confronto em 12 de setembro de 2026."
 */
export function formatSummarySentence(summary: H2HSummaryText): string {
  const { leftWins, rightWins, leftLabel, rightLabel, sideKind, lastPlayedAt } = summary;
  const left = spokenWins(leftLabel, leftWins, sideKind);
  const right = spokenWins(rightLabel, rightWins, sideKind);
  const total = formatGamesCount(leftWins + rightWins);
  return `${left}, ${right}, em ${total}. Último confronto em ${formatH2HSpokenDate(lastPlayedAt)}.`;
}

const SPOKEN_OUTCOME: Record<H2HOutcome, string> = { win: "vitória", loss: "derrota" };

/**
 * Nome acessível da forma recente, por extenso (seção 7).
 * Ex.: "Últimas 3 de Lucas: vitória, derrota, vitória, da mais antiga para a mais recente".
 */
export function formatFormGuideLabel(results: readonly H2HOutcome[], label: string): string {
  if (results.length === 0) return `${label}: sem partidas`;
  if (results.length === 1) return `Última partida de ${label}: ${SPOKEN_OUTCOME[results[0]]}`;
  const spoken = results.map((result) => SPOKEN_OUTCOME[result]).join(", ");
  return `Últimas ${results.length} de ${label}: ${spoken}, da mais antiga para a mais recente`;
}

/** Os lados de um H2H sem confronto, para o EmptyState (HEAD_TO_HEAD.md §6.1). */
export interface H2HNeverMetText {
  /** Quem vê está num dos lados: o texto fala com ele. */
  viewerIsLeft: boolean;
  sideKind: H2HSideKind;
  leftName: string;
  rightName: string;
}

/**
 * Título do vazio quando os lados nunca se enfrentaram (§6.1).
 * Ex.: "Vocês ainda não se enfrentaram.", "Lucas e Pedro ainda não se enfrentaram.".
 */
export function formatNeverMet({ viewerIsLeft, sideKind, leftName, rightName }: H2HNeverMetText): string {
  if (viewerIsLeft) return "Vocês ainda não se enfrentaram.";
  // "Lucas e Rafael e Pedro e Thiago" não se lê: em duplas, o texto fala das duplas
  if (sideKind === "pair") return "As duplas ainda não se enfrentaram.";
  return `${leftName} e ${rightName} ainda não se enfrentaram.`;
}
