import Link from "next/link";
import { Avatar } from "@/src/components/ui/Avatar";
import { CountBadge, badgeAccessibleName } from "@/src/components/ui/CountBadge";
import { Icon } from "@/src/components/ui/Icon";
import type { NavigationItem } from "./types";
import styles from "./NavigationLink.module.css";

type NavigationLinkProps = {
  item: NavigationItem;
  current: boolean;
};

/** Link de uma aba: ícone (ou avatar) com badge, e o rótulo embaixo. Base da TabBar e do NavigationRail. */
export function NavigationLink({ item, current }: NavigationLinkProps) {
  const classes = [styles.link, current && styles["link--current"]].filter(Boolean).join(" ");

  return (
    <Link
      href={item.href}
      className={classes}
      aria-current={current ? "page" : undefined}
      // Sem badge, o nome é o próprio rótulo visível e o aria-label fica de fora
      aria-label={item.badge ? badgeAccessibleName(item.label, item.badge) : undefined}
    >
      <span className={styles.link__indicator}>
        <NavigationGlyph item={item} current={current} />
        {item.badge && <CountBadge count={item.badge.count} className={styles.link__badge} />}
      </span>
      <span className={styles.link__label}>{item.label}</span>
    </Link>
  );
}

function NavigationGlyph({ item, current }: NavigationLinkProps) {
  if (!item.avatar) {
    return <Icon icon={item.icon} size="md" weight={current ? "fill" : "regular"} />;
  }
  // aria-hidden: o nome da aba é "Perfil", não o nome do jogador (NAVIGATION.md §10.3)
  return (
    <span className={styles.link__avatar} aria-hidden="true">
      <Avatar url={item.avatar.url} alt={item.avatar.alt} size={24} />
    </span>
  );
}
