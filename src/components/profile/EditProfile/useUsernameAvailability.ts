"use client";

import { useEffect, useRef, useState } from "react";
import { validateUsername } from "@/src/lib/validations";

export type UsernameStatus = "unchanged" | "checking" | "available" | "taken" | "invalid";

export type CheckUsername = (username: string) => Promise<{ available: boolean; error?: string }>;

// Mesmo intervalo do cadastro: consulta o banco quando o jogador para de digitar
const CHECK_DELAY_MS = 500;

// O cadastro aceita só [a-z0-9._] e converte para minúsculas enquanto se digita
function sanitize(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9._]/g, "");
}

function formatError(value: string): string | undefined {
  if (!value) return "Nome de usuário é obrigatório";
  return validateUsername(value).error;
}

/**
 * Campo de @username com a unicidade em tempo real do cadastro (PROFILE.md PF9). O
 * @username atual do jogador não é consultado: é dele, então está "unchanged".
 * @example const field = useUsernameAvailability("lucas.bt", checkUsername)
 */
export function useUsernameAvailability(initial: string, check: CheckUsername) {
  const [username, setUsername] = useState(initial);
  const [status, setStatus] = useState<UsernameStatus>(initial ? "unchanged" : "invalid");
  const [error, setError] = useState<string | undefined>();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Resposta que chega depois de o jogador já ter digitado outra coisa é descartada
  const latest = useRef(initial);

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  async function runCheck(value: string) {
    const result = await check(value);
    if (latest.current !== value) return;
    setStatus(result.available ? "available" : "taken");
    setError(result.available ? undefined : (result.error ?? "Nome de usuário já está em uso"));
  }

  function change(raw: string) {
    const value = sanitize(raw);
    setUsername(value);
    latest.current = value;
    clearTimeout(timer.current ?? undefined);
    const problem = formatError(value);
    if (value === initial && !problem) return settle("unchanged");
    if (problem) return settle("invalid", problem);
    settle("checking");
    timer.current = setTimeout(() => runCheck(value), CHECK_DELAY_MS);
  }

  function settle(next: UsernameStatus, message?: string) {
    setStatus(next);
    setError(message);
  }

  return { username, status, error, change };
}
