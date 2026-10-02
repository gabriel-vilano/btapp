"use client";

import { useActionState, useState } from "react";
import { requestRecovery } from "@/app/(auth)/actions";
import { AuthFormContainer } from "@/src/components/auth/AuthFormContainer";
import { AuthFormHeader } from "@/src/components/auth/AuthFormHeader";
import { FormInput } from "@/src/components/ui/FormInput";
import { Button } from "@/src/components/ui/Button";
import { Alert } from "@/src/components/ui/Alert";
import { TextLink } from "@/src/components/ui/TextLink";
import { validateEmail } from "@/src/lib/validations";
import authStyles from "@/app/(auth)/auth-page.module.css";

export default function RecoveryPage() {
  const [state, formAction, isPending] = useActionState(requestRecovery, null);

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const emailError = !email
    ? "E-mail é obrigatório"
    : !validateEmail(email).valid
      ? "Insira um e-mail válido"
      : null;

  const hasErrors = Boolean(emailError);
  const showEmailError = touched || submitAttempted ? emailError : null;

  function handleSubmit(formData: FormData) {
    setSubmitAttempted(true);
    if (hasErrors) return;
    formAction(formData);
  }

  const showServerError = Boolean(state?.error);

  return (
    <AuthFormContainer>
      <AuthFormHeader
        title="Recuperar senha"
        subtitle="Informe o e-mail da sua conta"
      />

      <form action={handleSubmit} className={authStyles["auth-page__form"]}>
        <FormInput
          label="E-mail"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          error={showEmailError ?? undefined}
          placeholder="seu@email.com"
          autoComplete="email"
          enterKeyHint="done"
          inputMode="email"
        />

        {showServerError && (
          <Alert
            status="attention"
            title={state!.error!}
            description="Verifique o e-mail informado e tente novamente."
          />
        )}

        <Button type="submit" fullWidth loading={isPending}>
          Enviar código
        </Button>
      </form>

      <p className={authStyles["auth-page__footer"]}>
        Lembrou sua senha?{" "}
        <TextLink href="/entrar">Entrar</TextLink>
      </p>
    </AuthFormContainer>
  );
}
