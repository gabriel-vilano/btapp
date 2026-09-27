"use client";

import { useId, useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { isOptionOpen } from "@/src/lib/domain/schedule-state";
import { formatScheduleDay, formatScheduleShort, formatScheduleTime } from "@/src/lib/scheduleOptionFormat";
import type { ScheduleOption, ScheduleOptions } from "@/src/types/domain";
import styles from "./ScheduleOptionPicker.module.css";

type ScheduleOptionPickerProps = {
  options: ScheduleOptions;
  /** "Agora" em ISO 8601. Vem de fora para a opção que passou (M12) ser testável sem relógio falso. */
  now: string;
  onConfirm: (optionIndex: number) => void;
  onNoneWorks: () => void;
  confirming?: boolean;
  label?: string;
  className?: string;
};

/**
 * Escolha de uma das 2 ou 3 opções de horário de uma proposta, com confirmação
 * num botão que diz o que vai acontecer (docs/SCHEDULING.md M9, M11, M12).
 * @example <ScheduleOptionPicker options={proposal.options} now={now} onConfirm={accept} onNoneWorks={openCounterProposal} />
 */
export function ScheduleOptionPicker({
  options,
  now,
  onConfirm,
  onNoneWorks,
  confirming = false,
  label = "Escolha um horário",
  className,
}: ScheduleOptionPickerProps) {
  const name = useId();
  const [picked, setPicked] = useState<number | null>(null);
  // Uma opção escolhida que passou enquanto a tela estava aberta deixa de valer
  const selected = picked !== null && isOptionOpen(options[picked], now) ? picked : null;

  return (
    <div className={[styles.picker, className].filter(Boolean).join(" ")}>
      <fieldset className={styles.picker__group} disabled={confirming}>
        <legend className={styles.picker__legend}>{label}</legend>
        {options.map((option, index) => (
          <ScheduleOptionCard
            key={option.starts_at}
            option={option}
            name={name}
            checked={selected === index}
            available={isOptionOpen(option, now)}
            onSelect={() => setPicked(index)}
          />
        ))}
      </fieldset>

      <ScheduleOptionActions
        confirmLabel={selected === null ? null : formatScheduleShort(options[selected].starts_at)}
        confirming={confirming}
        onConfirm={() => selected !== null && onConfirm(selected)}
        onNoneWorks={onNoneWorks}
      />
    </div>
  );
}

type ScheduleOptionActionsProps = {
  confirmLabel: string | null; // a opção escolhida, na forma curta; null sem escolha
  confirming: boolean;
  onConfirm: () => void;
  onNoneWorks: () => void;
};

// O botão diz o que vai acontecer: o aceite avisa os outros 3 jogadores e não
// se desfaz sozinho (M13), então o jogador confirma vendo a opção escolhida.
function ScheduleOptionActions({ confirmLabel, confirming, onConfirm, onNoneWorks }: ScheduleOptionActionsProps) {
  return (
    <div className={styles.picker__actions}>
      <Button fullWidth disabled={confirmLabel === null} loading={confirming} onClick={onConfirm}>
        {confirmLabel === null ? "Marcar jogo" : `Marcar jogo · ${confirmLabel}`}
      </Button>
      <Button variant="ghost" fullWidth disabled={confirming} onClick={onNoneWorks}>
        Nenhum serve, propor outros horários
      </Button>
    </div>
  );
}

type ScheduleOptionCardProps = {
  option: ScheduleOption;
  name: string;
  checked: boolean;
  available: boolean;
  onSelect: () => void;
};

function ScheduleOptionCard({ option, name, checked, available, onSelect }: ScheduleOptionCardProps) {
  const detail = available ? (option.venue ?? "Arena a combinar") : "Horário já passou";

  return (
    <label className={styles.option}>
      <input
        type="radio"
        className={styles.option__input}
        name={name}
        value={option.starts_at}
        checked={checked}
        disabled={!available}
        onChange={onSelect}
      />
      <span className={styles.option__card}>
        <span className={styles.option__radio} aria-hidden="true" />
        <span className={styles.option__text}>
          <span className={styles.option__day}>{formatScheduleDay(option.starts_at)}</span>
          <span className={styles.option__detail}>{detail}</span>
        </span>
        <span className={styles.option__time}>{formatScheduleTime(option.starts_at)}</span>
      </span>
    </label>
  );
}
