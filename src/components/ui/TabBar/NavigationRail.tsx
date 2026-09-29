import { NavigationLink } from "./NavigationLink";
import type { NavigationProps } from "./types";
import styles from "./NavigationRail.module.css";

/**
 * Navegação principal a partir de 600px: as mesmas abas da TabBar num trilho à esquerda (NAVIGATION.md, N27).
 * @example <NavigationRail items={MAIN_NAVIGATION} currentValue="feed" />
 */
export function NavigationRail({ items, currentValue, label = "Principal", className }: NavigationProps) {
  return (
    <nav aria-label={label} className={[styles.rail, className].filter(Boolean).join(" ")}>
      <ul className={styles.rail__list}>
        {items.map((item) => (
          <li key={item.value}>
            <NavigationLink item={item} current={item.value === currentValue} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
