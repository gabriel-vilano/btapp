"use client";

import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useId, useState, type ReactNode } from "react";
import { Dialog } from "@/src/components/ui/Dialog";
import { Icon } from "@/src/components/ui/Icon";
import { List, ListItem } from "@/src/components/ui/ListItem";
import { StandingSummaryItem } from "@/src/components/ui/StandingSummaryItem";
import { formatEnrollmentCount } from "@/src/lib/formatters";
import type { Category } from "@/src/types/feed";
import type {
  CategorySwitcher,
  OtherCategoryOption,
  OwnCategoryOption,
} from "@/src/lib/domain/ranking-screen";
import { categoryLabel } from "./rankingScreenText";
import styles from "./CategorySelector.module.css";

interface CategorySelectorProps {
  /** "Ranking Bacuri · Masculino B": a categoria aberta. */
  title: string;
  switcher: CategorySwitcher;
}

/**
 * Seletor de categoria da classificação (docs/RANKING.md, RK6): botão com a
 * competição e a categoria, que abre a folha com "Suas categorias" e "Outras
 * categorias". Sem para onde trocar, é só o título.
 */
export function CategorySelector({ title, switcher }: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  if (!switcher.can_switch) return <h2 className={styles["category-selector__title"]}>{title}</h2>;
  return (
    <>
      <h2 className={styles["category-selector__title"]}>
        <button
          type="button"
          className={styles["category-selector__button"]}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          {title}
          {/* O nome começa pelo texto visível (WCAG 2.5.3) e diz o que o toque faz */}
          <span className={styles["visually-hidden"]}>, trocar categoria</span>
          <Icon icon={CaretDownIcon} size="sm" />
        </button>
      </h2>
      <Dialog open={open} onClose={() => setOpen(false)} title="Trocar categoria">
        <CategorySheetBody switcher={switcher} />
      </Dialog>
    </>
  );
}

// Marca o item da classificação aberta, que fica na lista sem toque: o jogador
// vê todas as posições de uma vez (RK6), inclusive a da tela
const CURRENT_NOTE = "Aberta agora";

function CategorySheetBody({ switcher }: { switcher: CategorySwitcher }) {
  return (
    <div className={styles["category-sheet"]}>
      {switcher.own.length > 0 && (
        <SheetSection heading="Suas categorias">
          {switcher.own.map((option) => (
            <OwnCategoryItem key={option.enrollment_id} option={option} />
          ))}
        </SheetSection>
      )}
      {switcher.others.length > 0 && (
        <SheetSection heading="Outras categorias">
          {switcher.others.map((option) => (
            <OtherCategoryItem key={option.category.id} option={option} />
          ))}
        </SheetSection>
      )}
    </div>
  );
}

function SheetSection({ heading, children }: { heading: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className={styles["category-sheet__heading"]}>
        {heading}
      </h3>
      <List>{children}</List>
    </section>
  );
}

type SummaryDelta = { direction: "up" | "down"; value: number };

function toDelta(delta: number | null): SummaryDelta | undefined {
  if (delta === null) return undefined;
  return { direction: delta > 0 ? "up" : "down", value: Math.abs(delta) };
}

function OwnCategoryItem({ option }: { option: OwnCategoryOption }) {
  return (
    <StandingSummaryItem
      position={option.position}
      competitionName={option.competition_name}
      categoryName={categoryLabel(option.category)}
      // Primeiro nome, como na lista "Minhas competições" (NAV N29)
      partnerName={option.partner?.name.split(/\s+/)[0]}
      delta={toDelta(option.delta)}
      complement={option.is_current ? CURRENT_NOTE : undefined}
      href={option.is_current ? undefined : option.href}
    />
  );
}

function otherSupportingText(option: OtherCategoryOption): string | undefined {
  const count = option.unit_count === null ? null : formatEnrollmentCount(option.unit_count, toFeedCategory(option));
  const parts = [count, option.is_current ? CURRENT_NOTE : null].filter((part) => part !== null);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

// O `formatEnrollmentCount` lê a categoria no formato do feed (idade como texto)
function toFeedCategory({ category }: OtherCategoryOption): Category {
  return { ...category, age_group: category.min_age === null ? null : `${category.min_age}+` };
}

function OtherCategoryItem({ option }: { option: OtherCategoryOption }) {
  return (
    <ListItem
      title={categoryLabel(option.category)}
      supportingText={otherSupportingText(option)}
      trailing={option.is_current ? undefined : <Icon icon={CaretRightIcon} size="sm" />}
      href={option.is_current ? undefined : option.href}
    />
  );
}
