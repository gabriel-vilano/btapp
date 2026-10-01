"use client";

import Link from "next/link";
import { ScalesIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./H2HButton.module.css";

interface H2HButtonProps {
  /** Total de confrontos jogados entre os lados: o mesmo número do resumo da página (HH17). */
  count: number;
  /** Página de H2H, montada com `h2hPath` (HH5). */
  href: string;
}

// Navegação é link, não botão (HH18, WCAG 4.1.2): o leitor de tela anuncia
// "link" e o jogador pode abrir em outra aba. O nome "Button" é visual.
export function H2HButton({ count, href }: H2HButtonProps) {
  const text = `Já jogaram ${count} ${count === 1 ? "vez" : "vezes"}, veja o H2H`;

  return (
    <Link href={href} className={styles.h2h}>
      <Icon icon={ScalesIcon} size="sm" weight="regular" />
      <span>{text}</span>
    </Link>
  );
}
