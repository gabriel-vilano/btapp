"use client";

import { type ComponentProps } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./Chip.module.css";

type FilterChipProps = {
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
} & Omit<ComponentProps<"button">, "onClick" | "type">;

/**
 * Chip de filtro: botão de alternância (`aria-pressed`) que liga ou desliga um filtro.
 * @example <FilterChip selected={onlyA} onSelectedChange={setOnlyA}>Categoria A</FilterChip>
 */
export function FilterChip({
  selected,
  onSelectedChange,
  children,
  className,
  ...rest
}: FilterChipProps) {
  const classNames = [styles.chip, selected && styles["chip--selected"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classNames}
      aria-pressed={selected}
      onClick={() => onSelectedChange(!selected)}
      {...rest}
    >
      {selected && <Icon icon={CheckIcon} size="sm" weight="bold" />}
      {children}
    </button>
  );
}
