"use client";

import { StatusTimeline } from "@/src/components/ui/StatusTimeline";
import type { ScheduleHistory } from "@/src/types/domain";
import { scheduleTimelineEventsOf, type PlayerNames } from "./scheduleTimelineEvents";

// "use client": os ícones do histórico vêm do Phosphor (ver CLAUDE.md >
// "Phosphor em Server Components").

interface ScheduleTimelineProps {
  history: ScheduleHistory;
  /** Nome de exibição por player_id. */
  playerNames: PlayerNames;
  className?: string;
}

/**
 * Histórico da marcação do confronto, do mais antigo ao mais recente (M16).
 * É o mesmo que os jogadores veem na tela do confronto e o admin na partida
 * não realizada (M17). Sem nenhum fato, não renderiza nada.
 * @example <ScheduleTimeline history={history} playerNames={{ "player-lucas": "Lucas" }} />
 */
export function ScheduleTimeline({ history, playerNames, className }: ScheduleTimelineProps) {
  return (
    <StatusTimeline
      label="Histórico da marcação"
      events={scheduleTimelineEventsOf(history, playerNames)}
      className={className}
    />
  );
}

export type { ScheduleTimelineProps };
