"use client";

import { useActionState, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createProfile, checkUsername, suggestUsername } from "@/app/(auth)/actions";
import { createClient } from "@/src/lib/supabase/client";
import { AuthFormContainer } from "@/src/components/auth/AuthFormContainer";
import { AuthFormHeader } from "@/src/components/auth/AuthFormHeader";
import { AvatarUpload } from "@/src/components/ui/AvatarUpload";
import { FormInput } from "@/src/components/ui/FormInput";
import { Button } from "@/src/components/ui/Button";
import { Alert } from "@/src/components/ui/Alert";
import { TextLink } from "@/src/components/ui/TextLink";
import { Spinner } from "@/src/components/ui/Spinner";
import { validateUsername } from "@/src/lib/validations";
import authStyles from "@/app/(auth)/auth-page.module.css";
import styles from "./page.module.css";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function ProfilePage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createProfile, null);

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [usernameError, setUsernameError] = useState<string | undefined>();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [initialized, setInitialized] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Erro de username vindo do servidor entra no mesmo estado da validação local:
  // aparece no campo e some quando o usuário volta a digitar.
  const [serverState, setServerState] = useState(state);
  if (state !== serverState) {
    setServerState(state);
    const serverUsernameError = state?.fieldErrors?.username;
    if (serverUsernameError) {
      setUsernameStatus("invalid");
      setUsernameError(serverUsernameError);
    }
  }

  useEffect(() => {
    async function loadUserName() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/entrar");
        return;
      }

      // A sugestão já vem checada contra o banco, então nasce como disponível
      const suggested = await suggestUsername();
      if (suggested) {
        setUsername(suggested);
        setUsernameStatus("available");
      }
      setInitialized(true);
    }
    loadUserName();
  }, [router]);

  const checkAvailability = useCallback(async (value: string) => {
    if (!value) {
      setUsernameStatus("idle");
      setUsernameError(undefined);
      return;
    }

    const validation = validateUsername(value);
    if (!validation.valid) {
      setUsernameStatus("invalid");
      setUsernameError(validation.error);
      return;
    }

    setUsernameStatus("checking");
    setUsernameError(undefined);

    const result = await checkUsername(value);

    if (result.available) {
      setUsernameStatus("available");
      setUsernameError(undefined);
    } else {
      setUsernameStatus("taken");
      setUsernameError(result.error ?? "Username já está em uso");
    }
  }, []);

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "");
    setUsername(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value) {
      setUsernameStatus("idle");
      setUsernameError(undefined);
      return;
    }

    const validation = validateUsername(value);
    if (!validation.valid) {
      setUsernameStatus("invalid");
      setUsernameError(validation.error);
      return;
    }

    setUsernameStatus("checking");
    setUsernameError(undefined);

    debounceRef.current = setTimeout(() => {
      checkAvailability(value);
    }, 500);
  }

  function handleSubmit(formData: FormData) {
    if (isPending) return;
    if (usernameStatus === "checking") return;
    if (usernameStatus === "taken" || usernameStatus === "invalid") return;
    if (avatarFile) {
      formData.set("avatar", avatarFile);
    }
    formAction(formData);
  }

  // Pular grava a sugestão do servidor: todo jogador sai do cadastro com @username
  function handleSkip() {
    if (isPending) return;
    const formData = new FormData();
    formData.set("username", "");
    formAction(formData);
  }

  if (!initialized) {
    return (
      <main className={styles.profile__loading}>
        <Spinner size="lg" className={styles["profile__loading-spinner"]} />
        <p>Carregando...</p>
      </main>
    );
  }

  const showServerError = Boolean(state?.error);

  return (
    <AuthFormContainer>
      <AuthFormHeader
        title="Seu perfil"
        subtitle="Adicione uma foto e um nome de usuário para ser reconhecido por outros jogadores"
      />

      <form action={handleSubmit} className={authStyles["auth-page__form"]}>
        <AvatarUpload onFileSelect={setAvatarFile} />

        <div>
          <FormInput
            label="Username"
            name="username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            error={usernameError}
            valid={usernameStatus === "available"}
            placeholder="seu.username"
            autoComplete="username"
          />

          {usernameStatus === "checking" && (
            <p className={`${styles["profile__username-status"]} ${styles["profile__username-status--checking"]}`}>
              <Spinner size="xs" />
              Verificando disponibilidade...
            </p>
          )}
          {usernameStatus === "available" && (
            <p className={`${styles["profile__username-status"]} ${styles["profile__username-status--available"]}`}>
              Usuário disponível
            </p>
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
          Concluir
        </Button>
      </form>

      <div className={styles.profile__skip}>
        <TextLink onClick={handleSkip} block>Pular por enquanto</TextLink>
      </div>
    </AuthFormContainer>
  );
}
