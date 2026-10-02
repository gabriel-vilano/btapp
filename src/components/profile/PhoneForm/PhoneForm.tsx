"use client";

import { useActionState, useState } from "react";
import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { FormInput } from "@/src/components/ui/FormInput";
import { PHONE_RETURN_PARAM } from "@/src/lib/navigation/phoneSettings";
import {
  formatBrazilPhone,
  PHONE_CONSENT_TEXT,
  readPhoneForm,
  validatePhoneForm,
  type PhoneFieldErrors,
  type PhoneFormState,
} from "@/src/lib/phone";
import styles from "./PhoneForm.module.css";

export type PhoneAction = (prevState: PhoneFormState, formData: FormData) => Promise<PhoneFormState>;

type PhoneFormProps = {
  /** Número salvo, em E.164, ou `null` quando o jogador não informou. */
  currentPhone: string | null;
  /** Tela do confronto de onde o jogador veio (M20): a action volta para ela depois de salvar. */
  returnTo?: string;
  /** Server actions. As stories passam fakes. */
  savePhone: PhoneAction;
  deletePhone: PhoneAction;
};

const INTRO =
  "Com o telefone, seus adversários e seu parceiro podem abrir a conversa com você direto pelo app. É opcional, e você apaga quando quiser.";
const PHONE_HINT = "Só números do Brasil, com DDD.";
const DELETE_HINT = "Apagar remove o número e o seu consentimento.";

/**
 * Telefone para o "Abrir no WhatsApp" (docs/SCHEDULING.md M20–M25): o número, a
 * caixa de consentimento sempre desmarcada (M21) e, com número salvo, "Apagar telefone" (M25).
 * @example <PhoneForm currentPhone={null} savePhone={savePhone} deletePhone={deletePhone} />
 */
export function PhoneForm({ currentPhone, returnTo, savePhone, deletePhone }: PhoneFormProps) {
  const [saveState, saveAction, isSaving] = useActionState(savePhone, null);
  const [phone, setPhone] = useState(currentPhone ? formatBrazilPhone(currentPhone) : "");
  // Mesmo com número salvo, a caixa começa desmarcada: salvar de novo é consentir de novo (M21)
  const [consent, setConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<PhoneFieldErrors>({});

  // Erros por campo do servidor entram no mesmo estado da validação local
  const [seenState, setSeenState] = useState(saveState);
  if (saveState !== seenState) {
    setSeenState(saveState);
    setFieldErrors(saveState?.fieldErrors ?? {});
  }

  function handleSave(formData: FormData) {
    if (isSaving) return;
    const errors = validatePhoneForm(readPhoneForm(formData));
    if (errors) return setFieldErrors(errors);
    saveAction(formData);
  }

  function changeConsent(checked: boolean) {
    setConsent(checked);
    setFieldErrors(({ phone: phoneError }) => ({ phone: phoneError }));
  }

  return (
    <div className={styles["phone-form"]}>
      <p className={styles["phone-form__intro"]}>{INTRO}</p>
      <form action={handleSave} className={styles["phone-form__fields"]} noValidate>
        {returnTo && <input type="hidden" name={PHONE_RETURN_PARAM} value={returnTo} />}
        <FormInput
          label="Telefone"
          name="phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setFieldErrors(({ consent: consentError }) => ({ consent: consentError }));
          }}
          error={fieldErrors.phone}
          hint={PHONE_HINT}
          placeholder="(31) 99999-0001"
        />
        <Checkbox
          name="consent"
          label={PHONE_CONSENT_TEXT}
          checked={consent}
          onCheckedChange={changeConsent}
          error={fieldErrors.consent}
        />
        {saveState?.error && <Alert status="attention" title={saveState.error} />}
        <Button type="submit" fullWidth loading={isSaving}>
          Salvar telefone
        </Button>
      </form>
      {currentPhone && <DeletePhoneForm deletePhone={deletePhone} />}
    </div>
  );
}

function DeletePhoneForm({ deletePhone }: Pick<PhoneFormProps, "deletePhone">) {
  const [state, action, isDeleting] = useActionState(deletePhone, null);
  return (
    <form action={action} className={styles["phone-form__delete"]}>
      {state?.error && <Alert status="attention" title={state.error} />}
      <Button type="submit" variant="secondary" fullWidth loading={isDeleting}>
        Apagar telefone
      </Button>
      <p className={styles["phone-form__intro"]}>{DELETE_HINT}</p>
    </form>
  );
}

export type { PhoneFormProps };
