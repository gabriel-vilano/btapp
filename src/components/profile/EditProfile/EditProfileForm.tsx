"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { XIcon } from "@phosphor-icons/react";
import { AvatarUpload } from "@/src/components/ui/AvatarUpload";
import { Alert } from "@/src/components/ui/Alert";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { Button } from "@/src/components/ui/Button";
import { FormInput } from "@/src/components/ui/FormInput";
import { IconButtonLink } from "@/src/components/ui/IconButton";
import { OWN_PROFILE_PATH } from "@/src/lib/domain/profile-page";
import {
  readEditProfileForm,
  validateEditProfile,
  type EditableProfile,
  type EditProfileFieldErrors,
  type EditProfileState,
} from "@/src/lib/profileEdit";
import { BIRTH_DATE_MIN, FIRST_NAME_MAX_LENGTH, LAST_NAME_MAX_LENGTH, USERNAME_MAX_LENGTH } from "@/src/lib/validations";
import { UsernameStatusLine } from "./UsernameStatusLine";
import { useUsernameAvailability, type CheckUsername } from "./useUsernameAvailability";
import styles from "./EditProfile.module.css";

export type SaveProfile = (prevState: EditProfileState, formData: FormData) => Promise<EditProfileState>;

type EditProfileFormProps = {
  profile: EditableProfile;
  /** Hoje em Brasília (`AAAA-MM-DD`): limite da data de nascimento. Vem do servidor, para a hidratação concordar. */
  today: string;
  /** Server action que grava e volta ao perfil. As stories passam um fake. */
  saveProfile: SaveProfile;
  checkUsername: CheckUsername;
};

const BIRTH_DATE_HINT = "Não aparece no perfil. Serve para as categorias com idade.";

// Campos sem regra própria de digitação; o @username tem a dele (useUsernameAvailability)
type PlainField = "firstName" | "lastName" | "birthDate";

/**
 * "Editar perfil", fluxo modal em tela cheia (PROFILE.md PF9, NAVIGATION.md N4): foto,
 * nome, @username com unicidade em tempo real e data de nascimento opcional.
 * @example <EditProfileForm profile={profile} today="2026-10-01" saveProfile={updateProfile} checkUsername={checkUsername} />
 */
export function EditProfileForm({ profile, today, saveProfile, checkUsername }: EditProfileFormProps) {
  const [state, formAction, isPending] = useActionState(saveProfile, null);
  const [values, setValues] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    birthDate: profile.birthDate,
  });
  const username = useUsernameAvailability(profile.username, checkUsername);
  const [fieldErrors, setFieldErrors] = useState<EditProfileFieldErrors>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Erros por campo vindos do servidor entram no mesmo estado da validação local:
  // aparecem no campo e somem quando o jogador volta a mexer nele
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    setFieldErrors(state?.fieldErrors ?? {});
  }

  const clearError = (field: keyof EditProfileFieldErrors) => setFieldErrors((current) => withoutField(current, field));

  const changeValue = (field: PlainField) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    clearError(field);
  };

  function changeUsername(event: ChangeEvent<HTMLInputElement>) {
    username.change(event.target.value);
    clearError("username");
  }

  function handleSubmit(formData: FormData) {
    if (isPending || username.status === "checking" || username.status === "taken") return;
    const errors = validateEditProfile(readEditProfileForm(formData), today);
    if (errors) return setFieldErrors(errors);
    if (avatarFile) formData.set("avatar", avatarFile);
    formAction(formData);
  }

  const usernameError = username.error ?? fieldErrors.username;

  return (
    <div className={styles["edit-profile"]}>
      <AppHeader
        title="Editar perfil"
        actions={<IconButtonLink href={OWN_PROFILE_PATH} icon={XIcon} label="Fechar" />}
      />
      <form action={handleSubmit} className={styles["edit-profile__form"]} noValidate>
        <div className={styles["edit-profile__avatar"]}>
          <AvatarUpload initialUrl={profile.avatarUrl} onFileSelect={setAvatarFile} />
        </div>
        <FormInput
          label="Nome"
          name="firstName"
          value={values.firstName}
          onChange={changeValue("firstName")}
          error={fieldErrors.firstName}
          autoComplete="given-name"
          maxLength={FIRST_NAME_MAX_LENGTH}
        />
        <FormInput
          label="Sobrenome"
          name="lastName"
          value={values.lastName}
          onChange={changeValue("lastName")}
          error={fieldErrors.lastName}
          autoComplete="family-name"
          maxLength={LAST_NAME_MAX_LENGTH}
        />
        <div>
          <FormInput
            label="Nome de usuário"
            name="username"
            value={username.username}
            onChange={changeUsername}
            error={usernameError}
            valid={username.status === "available"}
            autoComplete="username"
            maxLength={USERNAME_MAX_LENGTH}
          />
          <UsernameStatusLine status={username.status} hasError={usernameError !== undefined} />
        </div>
        <FormInput
          label="Data de nascimento"
          name="birthDate"
          type="date"
          value={values.birthDate}
          onChange={changeValue("birthDate")}
          error={fieldErrors.birthDate}
          hint={BIRTH_DATE_HINT}
          autoComplete="bday"
          min={BIRTH_DATE_MIN}
          max={today}
        />
        {state?.error && <Alert status="attention" title={state.error} />}
        <Button type="submit" fullWidth loading={isPending}>
          Salvar
        </Button>
      </form>
    </div>
  );
}

function withoutField(errors: EditProfileFieldErrors, field: keyof EditProfileFieldErrors): EditProfileFieldErrors {
  if (errors[field] === undefined) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}

export type { EditProfileFormProps };
