"use client";

import { useActionState } from "react";
import { logout } from "@/app/(auth)/actions";
import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";

// Provisório: o feed ainda é placeholder e o app não tem casca. O lugar definitivo
// do "Sair" é Perfil › Configurações › Sair (spec de navegação, N8). Quando a casca
// existir, a issue dela move este formulário para lá e apaga este arquivo.
export function LogoutForm() {
  const [state, formAction, isPending] = useActionState(logout, null);

  return (
    <form action={formAction}>
      {state?.error && <Alert status="attention" title={state.error} />}
      <Button type="submit" variant="secondary" loading={isPending}>
        Sair
      </Button>
    </form>
  );
}
