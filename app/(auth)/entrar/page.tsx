"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/(auth)/actions";
import { AuthFormContainer } from "@/src/components/auth/AuthFormContainer";
import { AuthFormHeader } from "@/src/components/auth/AuthFormHeader";
import { FormInput } from "@/src/components/ui/FormInput";
import { Button } from "@/src/components/ui/Button";
import { Alert } from "@/src/components/ui/Alert";
import { TextLink } from "@/src/components/ui/TextLink";
import { validateEmail } from "@/src/lib/validations";
import { LOGIN_RETURN_PARAM } from "@/src/lib/navigation/loginReturn";
import { loginNoticeFor } from "./login-notice";
import authStyles from "@/app/(auth)/auth-page.module.css";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const notice = loginNoticeFor(searchParams);
  const returnPath = searchParams.get(LOGIN_RETURN_PARAM);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  const [state, formAction, isPending] = useActionState(login, null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const emailError = !email
    ? "E-mail é obrigatório"
    : !validateEmail(email).valid
      ? "Insira um e-mail válido"
      : null;
  const passwordError = !password ? "Senha é obrigatória" : null;
  const hasErrors = Boolean(emailError || passwordError);

  const showEmailError =
    touched.email || submitAttempted ? emailError : null;
  const showPasswordError =
    touched.password || submitAttempted ? passwordError : null;

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    setNoticeDismissed(true);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    setNoticeDismissed(true);
  }

  function handleSubmit(formData: FormData) {
    setSubmitAttempted(true);
    if (hasErrors) return;
    formAction(formData);
  }

  const visibleNotice = noticeDismissed ? null : notice;
  const showServerError = Boolean(state?.error);

  return (
    <AuthFormContainer>
      <AuthFormHeader
        title="Bem-vindo de volta"
        subtitle="Entre com seu e-mail e senha"
      />

      <form action={handleSubmit} className={authStyles["auth-page__form"]}>
        {returnPath && <input type="hidden" name={LOGIN_RETURN_PARAM} value={returnPath} />}
        <FormInput
          label="E-mail"
          name="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          error={showEmailError ?? undefined}
          placeholder="seu@email.com"
          autoComplete="email"
          inputMode="email"
        />

        <FormInput
          label="Senha"
          labelTrailing={
            <TextLink href="/recuperar-senha">Esqueceu sua senha?</TextLink>
          }
          name="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          error={showPasswordError ?? undefined}
          placeholder="Sua senha"
          autoComplete="current-password"
        />

        {visibleNotice && (
          <Alert
            status={visibleNotice.status}
            title={visibleNotice.title}
            description={visibleNotice.description}
          />
        )}

        {showServerError && (
          <Alert
            status="attention"
            title="E-mail ou senha incorretos"
            description="Verifique suas credenciais e tente novamente."
          />
        )}

        <Button type="submit" fullWidth loading={isPending}>
          Entrar
        </Button>
      </form>

      <p className={authStyles["auth-page__footer"]}>
        Ainda não tem conta?{" "}
        <TextLink href="/cadastro">Criar conta</TextLink>
      </p>
    </AuthFormContainer>
  );
}
