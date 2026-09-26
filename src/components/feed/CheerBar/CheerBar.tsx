"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import { Button } from "@/src/components/ui/Button";
import styles from "./CheerBar.module.css";

interface CheerBarProps {
  cheerA: number;
  cheerB: number;
  userCheer: "a" | "b" | null;
  ariaLabelA: string;
  ariaLabelB: string;
}

export function CheerBar({
  cheerA,
  cheerB,
  userCheer,
  ariaLabelA,
  ariaLabelB,
}: CheerBarProps) {
  const total = cheerA + cheerB;
  const percentA = total === 0 ? 0 : (cheerA / total) * 100;

  return (
    <div className={styles.cheer}>
      <div className={styles.cheer__buttons}>
        <Button
          variant={userCheer === "a" ? "primary" : "secondary"}
          fullWidth
          aria-label={ariaLabelA}
          aria-pressed={userCheer === "a"}
        >
          <Icon icon={CaretDownIcon} size="sm" weight="regular" />
          Torcer
        </Button>
        <Button
          variant={userCheer === "b" ? "primary" : "secondary"}
          fullWidth
          aria-label={ariaLabelB}
          aria-pressed={userCheer === "b"}
        >
          <Icon icon={CaretDownIcon} size="sm" weight="regular" />
          Torcer
        </Button>
      </div>

      <svg
        className={styles.bar}
        viewBox="0 0 100 4"
        preserveAspectRatio="none"
        aria-hidden
      >
        <rect className={styles.bar__track} x="0" y="0" width="100" height="4" />
        <rect
          className={styles.bar__fill}
          x="0"
          y="0"
          width={percentA}
          height="4"
        />
      </svg>

      <div className={styles.counts}>
        <span>{cheerA} torcendo</span>
        <span>{cheerB} torcendo</span>
      </div>
    </div>
  );
}
