/** Jogador de uma linha do ranking. Em duplas, a linha recebe dois. */
export interface RankingRowPlayer {
  id: string;
  name: string;
  avatarUrl: string | null;
  /** O jogador logado: aparece como "Você" e vai para a frente do nome da dupla. */
  isViewer?: boolean;
}

export type RankingRowPlayers = [RankingRowPlayer] | [RankingRowPlayer, RankingRowPlayer];

/** O que o nome acessível da linha precisa saber. */
export interface RankingRowSummary {
  position: number;
  players: RankingRowPlayers;
  points: number;
  matches: number;
  wins: number;
  /** Posições ganhas (positivo) ou perdidas (negativo) desde a foto da rodada. */
  delta?: number;
  closed: boolean;
  awaitingAdmin: boolean;
  cutoffDistance?: string;
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Jogadores na ordem do nome: o jogador logado primeiro, como na tela do confronto.
 * Ex.: [Pedro, Você] → [Você, Pedro].
 */
export function orderPlayersForRow(players: RankingRowPlayers): RankingRowPlayer[] {
  return [...players].sort((a, b) => Number(b.isViewer ?? false) - Number(a.isViewer ?? false));
}

/**
 * Nome da unidade competidora, com "Você" no lugar do jogador logado.
 * Ex.: "Você e Pedro Alves", "Lucas Silva e Rafael Costa", "Você".
 */
export function formatCompetitorName(players: RankingRowPlayers): string {
  return orderPlayersForRow(players)
    .map((player) => (player.isViewer ? "Você" : player.name))
    .join(" e ");
}

/** Um jogador no nome visível da linha, partido para o sobrenome encolher antes (RK8). */
export interface CompetitorNamePart {
  id: string;
  /** Primeiro nome, ou "Você" para o jogador logado. */
  first: string;
  /** O resto do nome, sem o espaço inicial. Vazio para "Você" e para nome de uma palavra. */
  surname: string;
  isViewer: boolean;
}

/**
 * Primeiro nome e o resto, com os espaços normalizados.
 * Ex.: "Maria Eduarda  Lima" → { first: "Maria", surname: "Eduarda Lima" }.
 */
export function splitPlayerName(name: string): { first: string; surname: string } {
  const [first = "", ...rest] = name.trim().split(/\s+/);
  return { first, surname: rest.join(" ") };
}

/**
 * Peças do nome visível, na ordem de `formatCompetitorName`.
 * Ex.: [Pedro Alves, Você] → [{ first: "Você" }, { first: "Pedro", surname: "Alves" }].
 */
export function competitorNameParts(players: RankingRowPlayers): CompetitorNamePart[] {
  return orderPlayersForRow(players).map(({ id, name, isViewer = false }) =>
    isViewer ? { id, first: "Você", surname: "", isViewer } : { id, ...splitPlayerName(name), isViewer },
  );
}

/**
 * Linha de apoio: jogos e vitórias, com singular.
 * Ex.: "6 jogos · 5 vitórias", "1 jogo · 0 vitórias".
 */
export function formatMatchRecord(matches: number, wins: number): string {
  return `${plural(matches, "jogo", "jogos")} · ${plural(wins, "vitória", "vitórias")}`;
}

function formatDelta(delta: number): string {
  const moved = plural(Math.abs(delta), "posição", "posições");
  return delta > 0 ? `subiu ${moved}` : `caiu ${moved}`;
}

/**
 * Nome acessível da linha, na ordem de leitura da classificação (RANKING.md §9.1).
 * Ex.: "9º, Você e Pedro Alves, 390 pontos, subiu 2 posições, 5 jogos, 3 vitórias".
 */
export function formatRankingRowLabel(row: RankingRowSummary): string {
  const parts = [`${row.position}º`, formatCompetitorName(row.players)];
  if (row.closed) parts.push("inscrição encerrada");
  if (row.awaitingAdmin) parts.push("empate");
  parts.push(plural(row.points, "ponto", "pontos"));
  if (row.delta !== undefined && row.delta !== 0) parts.push(formatDelta(row.delta));
  parts.push(plural(row.matches, "jogo", "jogos"), plural(row.wins, "vitória", "vitórias"));
  if (row.cutoffDistance) parts.push(row.cutoffDistance);
  return parts.join(", ");
}
