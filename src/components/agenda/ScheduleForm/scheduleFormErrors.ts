import { brasiliaLocalToIso } from "@/src/lib/brasiliaDateTime";
import { formatEventMoment } from "@/src/lib/formatters";

// Validação dos horários do formulário, campo a campo, com as mesmas regras de
// `assertValidOptions` (docs/SCHEDULING.md M5, M6). O domínio recusa de novo
// ao gravar: aqui é para o jogador saber qual campo corrigir, e como. O `min`
// e o `max` do campo não bastam, porque o seletor do iOS não os respeita.

export type ScheduleFormMode = "propose" | "report";

export interface ScheduleFormLimits {
  now: string; // ISO 8601
  roundDeadline: string; // ISO 8601
}

/**
 * Mensagem de erro de cada campo de horário, na ordem dos campos; `null` no campo válido.
 * Na data informada (M14), só se exige uma data: o combinado no WhatsApp vale como veio.
 * @example scheduleFormErrors(["2026-10-03T14:00", ""], "propose", limits) // [null, "Escolha a data e a hora."]
 */
export function scheduleFormErrors(
  times: readonly string[],
  mode: ScheduleFormMode,
  limits: ScheduleFormLimits,
): (string | null)[] {
  const isos = times.map(brasiliaLocalToIso);
  return isos.map((iso, index) => {
    if (iso === null) return "Escolha a data e a hora.";
    if (mode === "report") return null;
    return proposedTimeError(iso, limits) ?? duplicateError(isos, index);
  });
}

function proposedTimeError(iso: string, { now, roundDeadline }: ScheduleFormLimits): string | null {
  const time = Date.parse(iso);
  if (time <= Date.parse(now)) return "Escolha um horário que ainda não passou.";
  if (time >= Date.parse(roundDeadline)) {
    return `A rodada fecha ${formatEventMoment(roundDeadline)}. Escolha um horário antes disso.`;
  }
  return null;
}

// Só o campo repetido depois do primeiro ganha o erro: é ele que o jogador mexe.
function duplicateError(isos: readonly (string | null)[], index: number): string | null {
  return isos.indexOf(isos[index]) < index ? "Este horário já está em outra opção." : null;
}
