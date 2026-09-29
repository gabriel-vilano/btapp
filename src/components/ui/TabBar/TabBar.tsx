import { NavigationLink } from "./NavigationLink";
import type { NavigationProps } from "./types";
import styles from "./TabBar.module.css";

/**
 * Navegação principal no mobile: as 5 abas no rodapé (NAVIGATION.md, N1 e N4).
 * Links com `aria-current="page"`, não `role="tablist"`: a barra troca de rota, não de painel.
 * @example <TabBar items={MAIN_NAVIGATION} currentValue="jogos" />
 */
export function TabBar({ items, currentValue, label = "Principal", className }: NavigationProps) {
  return (
    <nav aria-label={label} className={[styles.tabbar, className].filter(Boolean).join(" ")}>
      <ul className={styles.tabbar__list}>
        {items.map((item) => (
          <li key={item.value} className={styles.tabbar__item}>
            <NavigationLink item={item} current={item.value === currentValue} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
