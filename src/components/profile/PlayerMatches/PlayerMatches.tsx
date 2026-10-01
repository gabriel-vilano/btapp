import { ProfileMatchRow } from "@/src/components/profile/ProfileMatchRow";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { List } from "@/src/components/ui/ListItem";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { firstName, type PlayerMatchesData } from "@/src/lib/domain/profile-page";
import styles from "./PlayerMatches.module.css";

interface PlayerMatchesProps {
  data: PlayerMatchesData;
}

/**
 * Título da tela, no cabeçalho de detalhe: "Partidas de Pedro".
 * @example <DetailHeader title={playerMatchesTitle(data)} />
 */
export function playerMatchesTitle(data: PlayerMatchesData): string {
  return `Partidas de ${firstName(data.owner.name)}`;
}

/**
 * Todas as partidas confirmadas de outro jogador (PROFILE.md PF18), sem ações: a mesma
 * linha de "Partidas recentes", a mais recente primeiro, sem agrupar por mês.
 * O cabeçalho, com o título e o "Voltar" ao perfil, é da página.
 * @example <PlayerMatches data={buildPlayerMatches(domain, username)} />
 */
export function PlayerMatches({ data }: PlayerMatchesProps) {
  // O mesmo vazio de "Partidas recentes" no perfil de outro jogador (§6.2): sem CTA
  if (data.matches.length === 0) {
    return (
      <div className={styles.matches}>
        <EmptyState
          title="Nenhuma partida ainda."
          description={`As partidas de ${firstName(data.owner.name)} aparecem aqui.`}
        />
      </div>
    );
  }
  return (
    <div className={styles.matches}>
      <List divided aria-label={playerMatchesTitle(data)}>
        {data.matches.map((item) => (
          <ProfileMatchRow key={item.match_id} item={item} />
        ))}
      </List>
    </div>
  );
}

/** Carregando: o cabeçalho da tela aparece na hora (N23); a lista, em esqueleto de 5 linhas. */
export function PlayerMatchesSkeleton() {
  return (
    <div className={styles.matches} aria-hidden>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className={styles["matches__row-skeleton"]}>
          <Skeleton shape="text" textScale="body-md" lines={2} />
        </div>
      ))}
    </div>
  );
}

export type { PlayerMatchesProps };
