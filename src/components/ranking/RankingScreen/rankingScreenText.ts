import { formatCategoryLabel } from "@/src/lib/formatters";
import type { CutoffDistance } from "@/src/lib/domain/ranking-table";
import type { CutoffDivider, RankingPlayer, SeasonHeader } from "@/src/lib/domain/ranking-screen";
import type { CompetitionCategory } from "@/src/types/domain";

// Frases da tela de classificação (docs/RANKING.md). O domínio decide os
// números e os estados; aqui eles viram texto.

const DAY_MS = 24 * 60 * 60 * 1000;

const dayMonthFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Sao_Paulo",
});

/** "30/11". */
function formatDayMonth(iso: string): string {
  return dayMonthFormatter.format(new Date(iso));
}

/**
 * Nome da categoria do domínio. Ex.: "Masculino B", "Mista C 40+".
 */
export function categoryLabel(category: CompetitionCategory): string {
  const ageGroup = category.min_age === null ? null : `${category.min_age}+`;
  return formatCategoryLabel({ ...category, age_group: ageGroup });
}

/** "Rodada fecha em 5 dias"; menos de um dia conta como 1. */
function roundDeadlineText(deadline: string, now: string): string {
  const days = Math.max(1, Math.ceil((Date.parse(deadline) - Date.parse(now)) / DAY_MS));
  return `Rodada fecha em ${days} ${days === 1 ? "dia" : "dias"}`;
}

function allQualifyText(finalName: string, category: CompetitionCategory): string {
  const who = category.modality === "doubles" ? "Todas as duplas se classificam" : "Todos se classificam";
  return `${who} para a ${finalName}`;
}

/**
 * Linhas de contexto do cabeçalho (RK4, RK15, 4.5), de cima para baixo.
 * Ex.: ["2º semestre de 2026 · Rodada 3 de 4", "Rodada fecha em 5 dias · Corte em 30/11"].
 */
export function seasonContextLines(header: SeasonHeader, category: CompetitionCategory, now: string): string[] {
  const round = header.current_round;
  const first = round ? `${header.season_name} · Rodada ${round.number} de ${round.total}` : header.season_name;
  if (header.phase === "ended") return [first, `Temporada encerrada em ${formatDayMonth(header.ends_on)}`];
  const second = secondLine(header, now);
  const lines = second ? [first, second] : [first];
  if (header.final && header.all_qualify) lines.push(allQualifyText(header.final.name, category));
  return lines;
}

function secondLine(header: SeasonHeader, now: string): string | null {
  const { final, current_round: round } = header;
  if (header.phase === "after_cutoff" && final) return `Classificação final da ${final.name} definida`;
  const parts = [
    round && roundDeadlineText(round.deadline, now),
    final && `Corte em ${formatDayMonth(final.cutoff_date)}`,
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Distância da vaga na própria linha (RK11).
 * Ex.: "Faltam 12 pts para o 8º", "Falta 1 pt para o 8º".
 */
export function cutoffDistanceText({ points, position }: CutoffDistance): string {
  // Fora da vaga só pelo desempate, ou empatada à espera do admin: "Faltam 0
  // pts" não diz nada. Texto provisório, decisão de UX em aberto na issue
  if (points === 0) return `Empatado em pontos com o ${position}º`;
  if (points === 1) return `Falta 1 pt para o ${position}º`;
  return `Faltam ${points} pts para o ${position}º`;
}

/**
 * Texto do ZoneDivider (RK13 e 4.5).
 * Ex.: { label: "Classificam para a Saideira · 8 vagas" }.
 */
export function dividerText(divider: CutoffDivider): { label: string; detail?: string } {
  const vagas = divider.qualifiers === 1 ? "1 vaga" : `${divider.qualifiers} vagas`;
  const label = divider.after_cutoff
    ? `Classificados para a ${divider.final_name}`
    : `Classificam para a ${divider.final_name} · ${vagas}`;
  return divider.awaiting_admin ? { label, detail: "Empate na última vaga: decisão do admin" } : { label };
}

export const TIE_NOTE = "Ordem provisória até a decisão do admin (critério final de desempate)";
export const UNRANKED_NOTE = "A classificação começa com o primeiro resultado confirmado.";

/** Perfil do jogador (NAVIGATION.md, rotas por entidade): o próprio é `/perfil`. */
export function profileHref(player: RankingPlayer, viewerId: string): string {
  return player.id === viewerId ? "/perfil" : `/jogadores/${player.username}`;
}
