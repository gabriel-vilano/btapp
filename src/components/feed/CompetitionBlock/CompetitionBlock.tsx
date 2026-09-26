"use client";

import Image from "next/image";
import { CalendarBlankIcon, MapPinIcon, UsersIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import { formatCategoryLabel, formatEnrollmentCount } from "@/src/lib/formatters";
import type { CompetitionInfo } from "@/src/types/feed";
import styles from "./CompetitionBlock.module.css";

interface CompetitionBlockProps {
  competition: CompetitionInfo;
}

export function CompetitionBlock({ competition }: CompetitionBlockProps) {
  const { name, category, date_display, location, enrollment_count, org_avatar_url } =
    competition;

  return (
    <div className={styles.block}>
      <div className={styles.block__logo}>
        {org_avatar_url ? (
          <Image
            src={org_avatar_url}
            alt={name}
            width={48}
            height={48}
            className={styles.block__logo_img}
          />
        ) : (
          <span className={styles.block__logo_placeholder} aria-hidden />
        )}
      </div>

      <div className={styles.block__info}>
        <p className={styles.block__name}>{name}</p>
        <p className={styles.block__category}>{formatCategoryLabel(category)}</p>

        <span className={styles.block__line}>
          <Icon icon={CalendarBlankIcon} size="sm" weight="regular" />
          <span>{date_display}</span>
        </span>
        <span className={styles.block__line}>
          <Icon icon={MapPinIcon} size="sm" weight="regular" />
          <span>{location}</span>
        </span>
        <span className={styles.block__line}>
          <Icon icon={UsersIcon} size="sm" weight="regular" />
          <span>{formatEnrollmentCount(enrollment_count, category.modality)}</span>
        </span>
      </div>
    </div>
  );
}
