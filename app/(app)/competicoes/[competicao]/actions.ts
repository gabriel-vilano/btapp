"use server";

import type { InterestRegistration } from "@/src/lib/domain/competition-page";

// Tempo de uma ida ao servidor, para o estado "enviando" aparecer como vai
// aparecer com o Supabase
const MOCK_LATENCY_MS = 400;

/**
 * Registra ou desfaz o "Tenho interesse" de quem vê na competição (EXPLORE.md,
 * EX29 e EX31). Mock: não guarda nada. A persistência no Supabase, com a
 * checagem de sessão e de que a competição existe, entra com a issue do
 * interesse persistido; até lá, a ação não toca em dado nenhum.
 */
export async function registerCompetitionInterest(
  competitionSlug: string,
  interested: boolean,
): Promise<InterestRegistration> {
  void competitionSlug;
  void interested;
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  return { ok: true };
}
