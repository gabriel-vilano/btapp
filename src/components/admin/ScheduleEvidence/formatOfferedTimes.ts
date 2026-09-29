import type { ScheduleSideSummary } from "@/src/lib/domain/schedule-state";

const NBSP = "\u00a0";

/**
 * Horários e dias juntos: o número de horários mostra o esforço, o de dias a
 * disponibilidade real (3 horários na mesma noite é pouco).
 * @example formatOfferedTimes({ offeredTimeCount: 5, offeredDayCount: 3 }) // "5 horários em 3 dias"
 */
export function formatOfferedTimes({
  offeredTimeCount,
  offeredDayCount,
}: Pick<ScheduleSideSummary, "offeredTimeCount" | "offeredDayCount">): string {
  if (offeredTimeCount === 0) return "Nenhum";
  // Espaço inquebrável entre número e unidade: na coluna estreita a linha
  // quebra antes do "em", nunca entre "2" e "dias".
  const times = `${offeredTimeCount}${NBSP}${offeredTimeCount === 1 ? "horário" : "horários"}`;
  const days = `${offeredDayCount}${NBSP}${offeredDayCount === 1 ? "dia" : "dias"}`;
  return `${times} em ${days}`;
}
