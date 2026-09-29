import { WarningCircleIcon, CheckCircleIcon, InfoIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./Alert.module.css";

type AlertStatus = "attention" | "success" | "information";

type AlertProps = {
  status: AlertStatus;
  title: string;
  description?: string;
  className?: string;
};

const iconByStatus = {
  attention: WarningCircleIcon,
  success: CheckCircleIcon,
  information: InfoIcon,
};

export function Alert({ status, title, description, className }: AlertProps) {
  const rootClasses = [styles.alert, styles[`alert--${status}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClasses} role="alert">
      <span className={styles.alert__icon}>
        <Icon icon={iconByStatus[status]} size="md" weight="fill" />
      </span>
      <div className={styles.alert__content}>
        <p className={styles.alert__title}>{title}</p>
        {description && (
          <p className={styles.alert__description}>{description}</p>
        )}
      </div>
    </div>
  );
}
