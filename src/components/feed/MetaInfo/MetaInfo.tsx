"use client";

import { CalendarBlankIcon, MapPinIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import { formatMatchDateTime } from "@/src/lib/formatters";
import styles from "./MetaInfo.module.css";

interface MetaInfoProps {
  /** ISO 8601 — formatado como "DD/MM/YYYY, Weekday às HH:MM" */
  date: string;
  location: string;
  /** Linha extra (ex: "Jogo encerrado por W.O.") renderizada antes da data */
  note?: string | null;
}

export function MetaInfo({ date, location, note }: MetaInfoProps) {
  return (
    <div className={styles.meta}>
      {note && <p className={styles.meta__note}>{note}</p>}
      <span className={styles.meta__line}>
        <Icon icon={CalendarBlankIcon} size="sm" weight="regular" />
        <span>{formatMatchDateTime(date)}</span>
      </span>
      <span className={styles.meta__line}>
        <Icon icon={MapPinIcon} size="sm" weight="regular" />
        <span>{location}</span>
      </span>
    </div>
  );
}
