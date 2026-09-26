"use client";

import { ScalesIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./H2HButton.module.css";

interface H2HButtonProps {
  count: number;
  onClick?: () => void;
}

export function H2HButton({ count, onClick }: H2HButtonProps) {
  const text = `Já jogaram ${count} ${count === 1 ? "vez" : "vezes"}, veja o H2H`;

  return (
    <button type="button" className={styles.h2h} onClick={onClick}>
      <Icon icon={ScalesIcon} size="sm" weight="regular" />
      <span>{text}</span>
    </button>
  );
}
