import { Badge } from "@/src/components/ui/Badge";
import type { ReportResultData } from "./reportResultData";
import {
  displaySideNames,
  formatLabel,
  matchContextLine,
  sidesInDisplayOrder,
  viewerSideOf,
  type ReporterRole,
} from "./reportResultModel";
import styles from "./ReportResult.module.css";

type ReportHeadingProps = { data: ReportResultData; role: ReporterRole };

/**
 * Cabeçalho da partida no lançamento (RG3): os lados vêm prontos, o do jogador
 * em cima. O formato do ranking é só informação; no torneio, o admin o troca no formulário.
 */
export function ReportHeading({ data, role }: ReportHeadingProps) {
  const names = displaySideNames(data, role);
  const viewerSide = viewerSideOf(data);
  return (
    <div className={styles["report-result__heading"]}>
      <p className={styles["report-result__context"]}>{matchContextLine(data)}</p>
      <ul className={styles["report-result__sides"]} aria-label="Lados da partida">
        {sidesInDisplayOrder(data).map((side) => (
          <li key={side} className={styles["report-result__side"]}>
            <span className={styles["report-result__side-name"]}>{names[side]}</span>
            {role === "admin" && side === viewerSide && <Badge tone="neutral">Você joga</Badge>}
          </li>
        ))}
      </ul>
      {role === "player" && <p className={styles["report-result__context"]}>{formatLabel(data.match.format)}</p>}
    </div>
  );
}
