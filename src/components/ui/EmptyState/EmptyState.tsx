import type { ReactNode } from "react";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  /** Frase curta que diz por que a tela está vazia. Vira um `<h2>`. */
  title: string;
  /** Uma linha de apoio: o que vai aparecer ali ou o que fazer. */
  description?: ReactNode;
  /** Ícone decorativo acima do título. Recebe o componente do Phosphor, como no `<Icon />`. */
  icon?: React.ElementType;
  /** O próximo passo: um `<Button>` ou `<ButtonLink>` do DS. */
  action?: ReactNode;
  className?: string;
};

/**
 * Estado vazio de uma tela ou seção: explica por que está vazia e oferece o próximo passo.
 * @example <EmptyState title="Nenhum jogo agora." action={<ButtonLink href="/jogos/amistoso">Registrar amistoso</ButtonLink>} />
 */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  const rootClasses = [styles["empty-state"], className].filter(Boolean).join(" ");

  return (
    <div className={rootClasses}>
      {icon && (
        <span className={styles["empty-state__icon"]}>
          <Icon icon={icon} size="lg" />
        </span>
      )}
      <h2 className={styles["empty-state__title"]}>{title}</h2>
      {description && <p className={styles["empty-state__description"]}>{description}</p>}
      {action && <div className={styles["empty-state__action"]}>{action}</div>}
    </div>
  );
}

export type { EmptyStateProps };
