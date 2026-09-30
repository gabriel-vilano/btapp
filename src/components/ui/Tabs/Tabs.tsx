"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import styles from "./Tabs.module.css";

type TabItem = {
  value: string;
  label: ReactNode;
  panel: ReactNode;
  disabled?: boolean;
  /** Contagem ao lado do nome, como o número de resultados de um escopo da busca. */
  count?: number;
};

type CountNoun = { one: string; other: string };

type TabsProps = {
  label: string;
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** O que a contagem conta, no singular e no plural. Entra só no nome acessível. */
  countNoun?: CountNoun;
  className?: string;
};

const DEFAULT_COUNT_NOUN: CountNoun = { one: "resultado", other: "resultados" };
const MAX_VISIBLE_COUNT = 99;

type KeyMove = (index: number, count: number) => { start: number; step: number };

// Seta anda uma aba; Home e End partem de fora da lista para achar a primeira e a última
const KEY_MOVES: Partial<Record<string, KeyMove>> = {
  ArrowRight: (index) => ({ start: index, step: 1 }),
  ArrowLeft: (index) => ({ start: index, step: -1 }),
  Home: () => ({ start: -1, step: 1 }),
  End: (_, count) => ({ start: count, step: -1 }),
};

/** Próxima aba habilitada a partir de `start`, dando a volta na lista. */
function findEnabledIndex(items: TabItem[], start: number, step: number): number | null {
  const count = items.length;
  for (let offset = 1; offset <= count + 1; offset++) {
    const index = (((start + step * offset) % count) + count) % count;
    if (!items[index].disabled) return index;
  }
  return null;
}

/** Número visível na aba: acima de 99, "99+", para a aba não crescer sem limite. */
function formatVisibleCount(count: number): string {
  return count > MAX_VISIBLE_COUNT ? `${MAX_VISIBLE_COUNT}+` : String(count);
}

/** Contagem falada, que completa o nome da aba: "1 resultado", "mais de 99 resultados". */
function formatSpokenCount(count: number, noun: CountNoun): string {
  if (count > MAX_VISIBLE_COUNT) return `mais de ${MAX_VISIBLE_COUNT} ${noun.other}`;
  return `${count} ${count === 1 ? noun.one : noun.other}`;
}

type TabContentProps = { item: TabItem; countNoun: CountNoun };

// O nome falado inteiro fica num só texto oculto, e a versão visível sai da árvore de
// acessibilidade. Com o número num elemento à parte, o cálculo do nome põe espaço entre
// os pedaços ("Competições , 1 resultado") ou cola o número ("Competições1").
function TabContent({ item, countNoun }: TabContentProps) {
  if (item.count === undefined) return <>{item.label}</>;
  return (
    <>
      <span className={styles["tabs__sr-only"]}>
        {item.label}, {formatSpokenCount(item.count, countNoun)}
      </span>
      <span aria-hidden="true">
        {item.label}
        <span className={styles.tabs__count}>{formatVisibleCount(item.count)}</span>
      </span>
    </>
  );
}

/**
 * Abas de página (padrão Tabs do APG): troca o painel de conteúdo, com setas, Home e End.
 * @example <Tabs label="Perfil" items={sections} value={section} onValueChange={setSection} />
 */
export function Tabs({
  label,
  items,
  value,
  onValueChange,
  countNoun = DEFAULT_COUNT_NOUN,
  className,
}: TabsProps) {
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = (index: number) => `${baseId}-panel-${index}`;
  // Sem aba selecionada válida, a primeira habilitada recebe o Tab: o teclado nunca fica sem entrada
  const tabbableValue = items.some((item) => item.value === value && !item.disabled)
    ? value
    : items.find((item) => !item.disabled)?.value;

  // Ativação automática: o foco já seleciona, porque os painéis estão todos renderizados
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const move = KEY_MOVES[event.key];
    if (!move) return;
    event.preventDefault();
    const { start, step } = move(index, items.length);
    const next = findEnabledIndex(items, start, step);
    if (next === null) return;
    tabRefs.current[next]?.focus();
    onValueChange(items[next].value);
  }

  return (
    <div className={[styles.tabs, className].filter(Boolean).join(" ")}>
      <div role="tablist" aria-label={label} className={styles.tabs__list}>
        {items.map((item, index) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={tabId(index)}
              aria-selected={selected}
              aria-controls={panelId(index)}
              tabIndex={item.value === tabbableValue ? 0 : -1}
              disabled={item.disabled}
              className={styles.tabs__tab}
              onClick={() => onValueChange(item.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <TabContent item={item} countNoun={countNoun} />
            </button>
          );
        })}
      </div>
      {items.map((item, index) => (
        <div
          key={item.value}
          role="tabpanel"
          id={panelId(index)}
          aria-labelledby={tabId(index)}
          tabIndex={0}
          hidden={item.value !== value}
          className={styles.tabs__panel}
        >
          {item.panel}
        </div>
      ))}
    </div>
  );
}

export type { TabItem, CountNoun };
