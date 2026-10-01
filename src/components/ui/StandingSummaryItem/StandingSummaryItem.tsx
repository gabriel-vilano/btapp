import { DeltaIndicator } from "@/src/components/ui/DeltaIndicator";
import { ListItem } from "@/src/components/ui/ListItem";
import styles from "./StandingSummaryItem.module.css";

// As props do DeltaIndicator sem className: Omit num union perderia o `value`
type StandingDelta = { direction: "up" | "down"; value: number } | { direction: "none" };

interface StandingSummaryItemProps {
  /**
   * Posição atual da unidade competidora na categoria (1 = líder). `null` enquanto a
   * categoria não tem partida confirmada: a tabela ainda não tem posição (RANKING.md, RK20).
   */
  position: number | null;
  competitionName: string;
  categoryName: string;
  /** Nome do parceiro como aparece na linha ("Rafael"). Em simples, não passar. */
  partnerName?: string;
  /** Variação contra a última foto de rodada. Sem base (1ª rodada), não passar. */
  delta?: StandingDelta;
  /** Complemento de quem usa o item, no fim da linha de apoio. Ex.: "Melhor: 3º" no perfil (PF14). */
  complement?: string;
  href?: string;
  onClick?: () => void;
}

/**
 * Sua posição numa categoria: posição, competição · categoria, parceiro e variação.
 * Renderiza um `<li>`: use dentro de `<List>`.
 * @example <StandingSummaryItem position={5} competitionName="Ranking Bacuri" categoryName="Masculino B" partnerName="Rafael" delta={{ direction: "up", value: 2 }} href="/ranking/masculino-b" />
 */
export function StandingSummaryItem({
  position,
  competitionName,
  categoryName,
  partnerName,
  delta,
  complement,
  href,
  onClick,
}: StandingSummaryItemProps) {
  return (
    <ListItem
      href={href}
      onClick={onClick}
      leading={<span className={styles.position}>{position === null ? NO_POSITION : formatPosition(position)}</span>}
      title={
        <>
          {/* O leading do ListItem sai da leitura de tela; a posição entra pelo título */}
          <span className={styles["visually-hidden"]}>{spokenPosition(position)}, </span>
          {competitionName} · {categoryName}
        </>
      }
      supportingText={buildSupportingText(partnerName, complement)}
      trailing={delta && <DeltaIndicator {...delta} compact={delta.direction === "none"} />}
    />
  );
}

// Travessão, como a coluna vazia da tabela: "ainda sem posição", não "0º"
const NO_POSITION = "–";

function formatPosition(position: number): string {
  return `${position}º`;
}

function spokenPosition(position: number | null): string {
  return position === null ? "Sem posição ainda" : formatPosition(position);
}

function buildSupportingText(partnerName?: string, complement?: string): string | undefined {
  const parts = [partnerName && `com ${partnerName}`, complement].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export type { StandingSummaryItemProps };
