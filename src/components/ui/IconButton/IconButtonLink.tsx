import Link, { type LinkProps } from "next/link";
import { type ComponentProps, type ElementType } from "react";
import {
  CountBadge,
  badgeAccessibleName,
  type CountBadgeInfo,
} from "@/src/components/ui/CountBadge";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./IconButton.module.css";

type IconButtonLinkProps = {
  icon: ElementType;
  /** Nome acessível do link. Obrigatório, como no IconButton. */
  label: string;
  badge?: CountBadgeInfo;
} & LinkProps &
  Omit<ComponentProps<"a">, keyof LinkProps | "children" | "aria-label">;

/**
 * Link só de ícone, com a mesma forma do IconButton: para ícones que levam a outra tela.
 * @example <IconButtonLink href="/notificacoes" icon={BellIcon} label="Notificações" />
 */
export function IconButtonLink({ icon, label, badge, className, ...rest }: IconButtonLinkProps) {
  return (
    <Link
      className={[styles.button, className].filter(Boolean).join(" ")}
      aria-label={badgeAccessibleName(label, badge)}
      {...rest}
    >
      <Icon icon={icon} size="md" />
      {badge && <CountBadge count={badge.count} className={styles.button__badge} />}
    </Link>
  );
}

export type { IconButtonLinkProps };
