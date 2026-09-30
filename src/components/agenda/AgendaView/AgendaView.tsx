import Link from "next/link";
import { ButtonLink } from "@/src/components/ui/Button";
import { EmptyState } from "@/src/components/ui/EmptyState";
import type { AgendaEmptyView, AgendaViewModel } from "@/src/lib/agenda/agendaViewModel";
import { AgendaSection } from "../AgendaSection";
import { FRIENDLY_HREF } from "./AgendaHeader";
import styles from "./AgendaView.module.css";

const NOTHING_PENDING = "Nada pendente";

/**
 * Conteúdo da aba Jogos: as 4 seções na ordem da N12, ou o vazio da 9.2
 * seguido do Histórico.
 * @example <AgendaView {...agendaViewModel(domain, { playerId, now })} />
 */
export function AgendaView({ yourTurn, upcoming, waiting, history, empty }: AgendaViewModel) {
  const historySection = (
    <AgendaSection id="historico" title="Histórico" groups={history} />
  );
  if (empty !== null && empty.kind !== "no_enrollment") {
    return (
      <div className={styles["agenda-view"]}>
        <AgendaEmpty empty={empty} />
        {historySection}
      </div>
    );
  }
  return (
    <div className={styles["agenda-view"]}>
      <AgendaSection id="sua-vez" title="Sua vez" groups={[{ label: null, items: yourTurn }]} emptyText={NOTHING_PENDING} />
      <AgendaSection id="proximos" title="Próximos jogos" groups={[{ label: null, items: upcoming }]} />
      <AgendaSection id="aguardando" title="Aguardando" groups={[{ label: null, items: waiting }]} />
      {historySection}
    </div>
  );
}

function AgendaEmpty({ empty }: { empty: Exclude<AgendaEmptyView, { kind: "no_enrollment" }> }) {
  const action = <ButtonLink href={FRIENDLY_HREF}>Registrar amistoso</ButtonLink>;
  switch (empty.kind) {
    case "new_player":
      return (
        <EmptyState
          title="Você ainda não está em nenhum ranking."
          description="A inscrição é feita com o organizador da competição."
          action={action}
        />
      );
    case "between_rounds":
      return (
        <EmptyState
          title="Nenhum jogo agora."
          description={`A próxima rodada de ${empty.competitionName} começa quando o admin sortear.`}
          action={action}
        />
      );
    case "season_ended":
      return <EmptyState title="Temporada encerrada." description={<SeasonResult empty={empty} />} action={action} />;
  }
}

function SeasonResult({ empty }: { empty: Extract<AgendaEmptyView, { kind: "season_ended" }> }) {
  const where = `${empty.competitionName} · ${empty.categoryName}`;
  const text = empty.position === null ? `Veja a classificação final de ${where}` : `${empty.position}º lugar em ${where}`;
  return (
    <Link href={empty.href} className={styles["agenda-view__link"]}>
      {text}
    </Link>
  );
}
