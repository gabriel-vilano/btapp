"use client";

import { useActionState, useState } from "react";
import { signup } from "@/app/(auth)/actions";
import { AuthFormContainer } from "@/src/components/auth/AuthFormContainer";
import { AuthFormHeader } from "@/src/components/auth/AuthFormHeader";
import { FormInput } from "@/src/components/ui/FormInput";
import { Button } from "@/src/components/ui/Button";
import { Alert } from "@/src/components/ui/Alert";
import { TextLink } from "@/src/components/ui/TextLink";
import {
  validateEmail,
  validatePassword,
  NAME_MAX_LENGTH,
  type PasswordChecks,
} from "@/src/lib/validations";
import { PasswordChecklist } from "@/src/components/auth/PasswordChecklist";
import { useFormPersist } from "@/src/hooks/useFormPersist";
import authStyles from "@/app/(auth)/auth-page.module.css";
import styles from "./page.module.css";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordChecks, setPasswordChecks] = useState<PasswordChecks>({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setPassword(value);
    setPasswordChecks(validatePassword(value).checks);
  }

  useFormPersist(
    "signup-form",
    { name, email },
    { name: setName, email: setEmail }
  );

  const nameError = (() => {
    if (!name) return "Nome é obrigatório";
    if (name.trim().length < 2) return "Nome deve ter pelo menos 2 caracteres";
    if (name.trim().length > NAME_MAX_LENGTH)
      return `Nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres`;
    return null;
  })();

  const emailError = !email
    ? "E-mail é obrigatório"
    : !validateEmail(email).valid
      ? "Insira um e-mail válido"
      : null;

  const passwordValid =
    passwordChecks.minLength && passwordChecks.hasLetter && passwordChecks.hasNumber;

  const hasErrors = Boolean(nameError || emailError) || !passwordValid;

  const showNameError =
    touched.name || submitAttempted ? nameError : null;
  const showEmailError =
    touched.email || submitAttempted ? emailError : null;

  function handleSubmit(formData: FormData) {
    setSubmitAttempted(true);
    if (hasErrors) return;
    formAction(formData);
  }

  const showServerError = Boolean(state?.error);

  return (
    <AuthFormContainer>
      <AuthFormHeader
        title="Criar conta"
        subtitle="Preencha seus dados para começar"
      />

      <form action={handleSubmit} className={authStyles["auth-page__form"]}>
        <FormInput
          label="Nome"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          error={showNameError ?? undefined}
          placeholder="Seu nome e sobrenome"
          autoComplete="name"
          maxLength={NAME_MAX_LENGTH}
        />

        <FormInput
          label="E-mail"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          error={showEmailError ?? undefined}
          placeholder="seu@email.com"
          autoComplete="email"
          inputMode="email"
        />

        <div className={styles.signup__password}>
          <FormInput
            label="Senha"
            name="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Crie uma senha"
            autoComplete="new-password"
          />
          {password.length > 0 && (
            <PasswordChecklist
              checks={passwordChecks}
              submitted={submitAttempted}
            />
          )}
        </div>

        {showServerError && (
          <Alert
            status="attention"
            title={state!.error!}
            description="Tente novamente em alguns instantes."
          />
        )}

        <Button type="submit" fullWidth loading={isPending}>
          Criar conta
        </Button>
      </form>

      <p className={authStyles["auth-page__footer"]}>
        Já tem uma conta?{" "}
        <TextLink href="/entrar">Entrar</TextLink>
      </p>
    </AuthFormContainer>
  );
}
