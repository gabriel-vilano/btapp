"use client";

import { useActionState, useState } from "react";
import { cancelRecovery, updatePassword } from "@/app/(auth)/actions";
import { AuthFormContainer } from "@/src/components/auth/AuthFormContainer";
import { AuthFormHeader } from "@/src/components/auth/AuthFormHeader";
import { PasswordChecklist } from "@/src/components/auth/PasswordChecklist";
import { FormInput } from "@/src/components/ui/FormInput";
import { Button } from "@/src/components/ui/Button";
import { Alert } from "@/src/components/ui/Alert";
import { TextLink } from "@/src/components/ui/TextLink";
import { validatePassword, type PasswordChecks } from "@/src/lib/validations";
import authStyles from "@/app/(auth)/auth-page.module.css";
import styles from "./page.module.css";

export default function NewPasswordPage() {
  const [state, formAction, isPending] = useActionState(updatePassword, null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChecks, setPasswordChecks] = useState<PasswordChecks>({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
  });
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setPassword(value);
    setPasswordChecks(validatePassword(value).checks);
  }

  const passwordValid =
    passwordChecks.minLength && passwordChecks.hasLetter && passwordChecks.hasNumber;

  const confirmError = !confirmPassword
    ? "Confirmação é obrigatória"
    : confirmPassword !== password
      ? "As senhas não coincidem"
      : null;

  const hasErrors = !passwordValid || Boolean(confirmError);

  const showConfirmError =
    confirmTouched || submitAttempted ? confirmError : null;

  function handleSubmit(formData: FormData) {
    setSubmitAttempted(true);
    if (hasErrors) return;
    formAction(formData);
  }

  const showServerError = Boolean(state?.error);

  return (
    <AuthFormContainer>
      <AuthFormHeader title="Nova senha" subtitle="Defina sua nova senha" />

      <form action={handleSubmit} className={authStyles["auth-page__form"]}>
        <div className={styles.password__field}>
          <FormInput
            label="Nova senha"
            name="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Crie uma nova senha"
            autoComplete="new-password"
          />
          {password.length > 0 && (
            <PasswordChecklist
              checks={passwordChecks}
              submitted={submitAttempted}
            />
          )}
        </div>

        <FormInput
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setConfirmTouched(true)}
          error={showConfirmError ?? undefined}
          placeholder="Repita a nova senha"
          autoComplete="new-password"
        />

        {showServerError && (
          <Alert
            status="attention"
            title={state!.error!}
            description="Tente novamente em alguns instantes."
          />
        )}

        <Button type="submit" fullWidth loading={isPending}>
          Redefinir senha
        </Button>
      </form>

      <form action={cancelRecovery} className={styles.password__cancel}>
        <TextLink type="submit" block>
          Cancelar
        </TextLink>
      </form>
    </AuthFormContainer>
  );
}
