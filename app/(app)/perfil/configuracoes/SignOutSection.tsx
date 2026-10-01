"use client";

import { startTransition, useActionState } from "react";
import { logout } from "@/app/(auth)/actions";
import { SettingsList, SettingsRow } from "@/src/components/profile/SettingsList";
import { Alert } from "@/src/components/ui/Alert";
import styles from "./page.module.css";

// "Sair" é a última linha e não pede confirmação: é reversível com um login (N8).
// A action é a mesma da ENG-56, que encerra só a sessão deste aparelho.
export function SignOutSection() {
  const [state, signOut, isPending] = useActionState(logout, null);

  return (
    <>
      <SettingsList>
        <SettingsRow
          label="Sair"
          onClick={() => startTransition(signOut)}
          pending={isPending}
          pendingLabel="Saindo"
        />
      </SettingsList>
      {state?.error && (
        <div className={styles.settings__error}>
          <Alert status="attention" title={state.error} />
        </div>
      )}
    </>
  );
}
