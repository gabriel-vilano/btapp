import { type ComponentProps, type ElementType } from "react";
import {
  CountBadge,
  badgeAccessibleName,
  type CountBadgeInfo,
} from "@/src/components/ui/CountBadge";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./IconButton.module.css";

type IconButtonProps = {
  /** Componente do Phosphor, como no `<Icon />`. */
  icon: ElementType;
  /** Nome acessível do botão. Obrigatório: sem texto visível, é a única forma de dizer o que o botão faz. */
  label: string;
  /** Contador ou ponto sobre o ícone. A descrição entra no `aria-label`: "Notificações, há novas". */
  badge?: CountBadgeInfo;
} & Omit<ComponentProps<"button">, "children" | "aria-label">;

/**
 * Botão só de ícone, com área tocável de 48×48.
 * @example <IconButton icon={XIcon} label="Fechar" onClick={onClose} />
 */
export function IconButton({ icon, label, badge, type = "button", className, ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={[styles.button, className].filter(Boolean).join(" ")}
      aria-label={badgeAccessibleName(label, badge)}
      {...rest}
    >
      <Icon icon={icon} size="md" />
      {badge && <CountBadge count={badge.count} className={styles.button__badge} />}
    </button>
  );
}

export type { IconButtonProps };
