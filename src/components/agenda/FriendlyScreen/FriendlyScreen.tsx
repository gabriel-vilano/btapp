"use client";

import { Badge } from "@/src/components/ui/Badge";
import { sideOfPlayer } from "@/src/lib/domain/match-state/guards";
import { formatPlayedDay } from "@/src/lib/formatters";
import { formatLabel } from "../ReportResult/reportResultModel";
import { FriendlyResult } from "./FriendlyResult";
import type { FriendlyScreenData } from "./friendlyScreenData";
import { useFriendlyResult } from "./useFriendlyResult";
import styles from "./FriendlyScreen.module.css";

type FriendlyScreenProps = {
  data: FriendlyScreenData;
  /** "Agora" do primeiro render, em ISO 8601. Vem do servidor, para o HTML e a hidratação concordarem. */
  now: string;
  /** Relógio das ações. As stories fixam o tempo por ele. */
  clock?: () => string;
};

/**
 * Tela do amistoso: a mesma tela de confronto (RG1), sem competição, marcação
 * nem prazo (docs/RESULTS.md §6.2, NAVIGATION.md N19). Sem o cabeçalho: ele é da página.
 * @example <FriendlyScreen data={friendlyScreenDataOf(matchId)} now={new Date().toISOString()} />
 */
export function FriendlyScreen({ data, now, clock = systemClock }: FriendlyScreenProps) {
  const actions = useFriendlyResult(data, clock);
  return (
    <div className={styles["friendly-screen"]}>
      <div className={styles["friendly-screen__content"]}>
        <FriendlyHeading data={data} />
        <FriendlyResult data={data} actions={actions} now={now} />
      </div>
    </div>
  );
}

// "Amistoso" no lugar da competição (NAVIGATION.md §5.3), e o dia e a arena informados por quem lançou
function FriendlyHeading({ data }: { data: FriendlyScreenData }) {
  const { match } = data;
  const viewerSide = sideOfPlayer(data.sides, data.viewerId);
  const when = [formatPlayedDay(match.played_at), match.venue].filter(Boolean).join(" · ");
  return (
    <div className={styles["friendly-screen__heading"]}>
      <p className={styles["friendly-screen__context"]}>Amistoso · {formatLabel(match.format)}</p>
      <ul className={styles["friendly-screen__sides"]} aria-label="Lados do amistoso">
        {(["a", "b"] as const).map((side) => (
          <li key={side} className={styles["friendly-screen__side"]}>
            <span className={styles["friendly-screen__side-name"]}>{data.sideNames[side]}</span>
            {side === viewerSide && <Badge tone="neutral">Você</Badge>}
          </li>
        ))}
      </ul>
      <p className={styles["friendly-screen__context"]}>{when}</p>
    </div>
  );
}

function systemClock(): string {
  return new Date().toISOString();
}

export type { FriendlyScreenProps };
