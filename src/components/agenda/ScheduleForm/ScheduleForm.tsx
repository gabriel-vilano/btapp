"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/src/components/ui/Button";
import { Dialog } from "@/src/components/ui/Dialog";
import { FormInput } from "@/src/components/ui/FormInput";
import { Icon } from "@/src/components/ui/Icon";
import { brasiliaLocalToIso, isoToBrasiliaLocal } from "@/src/lib/brasiliaDateTime";
import type { ScheduleOption } from "@/src/types/domain";
import { scheduleFormErrors, type ScheduleFormLimits, type ScheduleFormMode } from "./scheduleFormErrors";
import styles from "./ScheduleForm.module.css";

const VENUE_MAX_LENGTH = 80;

const COPY: Record<ScheduleFormMode, { title: string; description: string; submit: string }> = {
  propose: {
    title: "Propor horários",
    description: "Ofereça 2 ou 3 horários antes do fim da rodada. O outro lado escolhe um.",
    submit: "Enviar proposta",
  },
  report: {
    title: "Informar data combinada",
    description: "Combinou fora do app? Registre a data para os 4 jogadores. Não precisa de aceite do outro lado.",
    submit: "Informar data",
  },
};

type ScheduleFormProps = {
  open: boolean;
  onClose: () => void;
  /** Propor: 2 ou 3 horários (M5). Informar: 1 data, sem aceite (M14). */
  mode: ScheduleFormMode;
  /** Horários já preenchidos, para "Trocar horários" partir da proposta atual. */
  initialOptions?: readonly ScheduleOption[];
  /** Recebe as opções em ISO 8601, com a arena (a mesma para todas) ou `null`. */
  onSubmit: (options: ScheduleOption[]) => void;
} & ScheduleFormLimits;

/**
 * Formulário da proposta de horários e da data combinada fora do app, num
 * BottomSheet (docs/SCHEDULING.md M5, M6, M14). Valida campo a campo e só
 * entrega opções válidas.
 * @example <ScheduleForm open mode="propose" now={now} roundDeadline={deadline} onClose={close} onSubmit={propose} />
 */
export function ScheduleForm({ open, onClose, mode, ...formProps }: ScheduleFormProps) {
  const formId = useId();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={COPY[mode].title}
      description={COPY[mode].description}
      footer={
        <Button type="submit" form={formId} fullWidth>
          {COPY[mode].submit}
        </Button>
      }
    >
      {/* Dentro do Dialog: fechado, ele desmonta o corpo, e o formulário
          reabre limpo (ou com os horários da proposta atual) */}
      <ScheduleFormFields formId={formId} mode={mode} {...formProps} />
    </Dialog>
  );
}

type ScheduleFormFieldsProps = Omit<ScheduleFormProps, "open" | "onClose"> & { formId: string };

function ScheduleFormFields({ formId, mode, initialOptions, onSubmit, now, roundDeadline }: ScheduleFormFieldsProps) {
  const [times, setTimes] = useState(() => initialTimes(mode, initialOptions));
  const [venue, setVenue] = useState(() => initialOptions?.[0]?.venue ?? "");
  const [submitted, setSubmitted] = useState(false);
  const errors = scheduleFormErrors(times, mode, { now, roundDeadline });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (errors.some((error) => error !== null)) return;
    onSubmit(toOptions(times, venue));
  };

  return (
    <form id={formId} className={styles.form} onSubmit={handleSubmit} noValidate>
      <TimeFields
        mode={mode}
        times={times}
        errors={submitted ? errors : []}
        limits={{ now, roundDeadline }}
        onChange={setTimes}
      />
      <FormInput
        label="Arena (opcional)"
        name={`${formId}-venue`}
        value={venue}
        onChange={(event) => setVenue(event.target.value)}
        placeholder="Ex.: Arena Sunset"
        maxLength={VENUE_MAX_LENGTH}
      />
    </form>
  );
}

type TimeFieldsProps = {
  mode: ScheduleFormMode;
  times: string[];
  errors: (string | null)[];
  limits: ScheduleFormLimits;
  onChange: (times: string[]) => void;
};

function TimeFields({ mode, times, errors, limits, onChange }: TimeFieldsProps) {
  const name = useId();
  const setTime = (index: number, value: string) => onChange(times.map((time, i) => (i === index ? value : time)));
  // O `min` e o `max` guiam o seletor do desktop; a validação de verdade é a de `scheduleFormErrors`
  const bounds = mode === "propose" ? { min: isoToBrasiliaLocal(limits.now), max: isoToBrasiliaLocal(limits.roundDeadline) } : {};

  return (
    <div className={styles.form__times}>
      {times.map((time, index) => (
        <FormInput
          key={index}
          type="datetime-local"
          label={mode === "report" ? "Data e hora" : `${index + 1}º horário`}
          name={`${name}-time-${index}`}
          value={time}
          onChange={(event) => setTime(index, event.target.value)}
          error={errors[index] ?? undefined}
          {...bounds}
        />
      ))}
      {mode === "propose" && <ThirdTimeToggle times={times} onChange={onChange} />}
    </div>
  );
}

// A proposta tem de 2 a 3 horários (M5): o 3º é opcional e sai como entrou
function ThirdTimeToggle({ times, onChange }: Pick<TimeFieldsProps, "times" | "onChange">) {
  if (times.length === 3) {
    return (
      <Button type="button" variant="ghost" onClick={() => onChange(times.slice(0, 2))}>
        Remover 3º horário
      </Button>
    );
  }
  return (
    <Button type="button" variant="ghost" onClick={() => onChange([...times, ""])}>
      <Icon icon={PlusIcon} size="sm" />
      <span>Adicionar 3º horário</span>
    </Button>
  );
}

// Só chamada com os campos já validados: nenhum horário é nulo aqui
function toOptions(times: readonly string[], venue: string): ScheduleOption[] {
  const startsAt = times.map(brasiliaLocalToIso).filter((iso): iso is string => iso !== null);
  return startsAt.map((iso) => ({ starts_at: iso, venue: venue.trim() || null }));
}

function initialTimes(mode: ScheduleFormMode, initialOptions: readonly ScheduleOption[] | undefined): string[] {
  const count = mode === "report" ? 1 : 2;
  const filled = (initialOptions ?? []).slice(0, mode === "report" ? 1 : 3).map((o) => isoToBrasiliaLocal(o.starts_at));
  return filled.length >= count ? filled : [...filled, ...Array<string>(count - filled.length).fill("")];
}

export type { ScheduleFormProps };
