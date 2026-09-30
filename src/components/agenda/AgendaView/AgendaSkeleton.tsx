import { Skeleton } from "@/src/components/ui/Skeleton";
import styles from "./AgendaView.module.css";

const SECTIONS = [2, 1, 2];

/**
 * Carregando a aba Jogos: um esqueleto com o formato das seções, sem spinner
 * em tela cheia (N23).
 */
export function AgendaSkeleton() {
  return (
    <div className={styles["agenda-view"]} role="status" aria-busy="true" aria-label="Carregando seus jogos">
      {SECTIONS.map((itemCount, section) => (
        <div key={section} className={styles["agenda-skeleton__section"]}>
          <div className={styles["agenda-skeleton__title"]}>
            <Skeleton shape="text" textScale="title-md" />
          </div>
          {Array.from({ length: itemCount }, (_, index) => (
            <div key={index} className={styles["agenda-skeleton__item"]}>
              <Skeleton shape="circle" size={40} />
              <Skeleton shape="text" textScale="body-md" lines={3} className={styles["agenda-skeleton__lines"]} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
