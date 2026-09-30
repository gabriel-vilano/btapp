import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/src/lib/supabase/server";
import {
  asSupabaseClient,
  createSupabaseMock,
  TEST_USER,
  type SupabaseMock,
} from "../(auth)/actions.test-utils";
import { loadProfileAvatar } from "./profileAvatar";

vi.mock("@/src/lib/supabase/server", () => ({ createClient: vi.fn() }));

let supabase: SupabaseMock;

beforeEach(() => {
  supabase = createSupabaseMock();
  vi.mocked(createClient).mockResolvedValue(asSupabaseClient(supabase));
});

describe("loadProfileAvatar", () => {
  it("devolve a foto e o nome do perfil do jogador logado", async () => {
    supabase.profilesQuery.maybeSingle.mockResolvedValueOnce({
      data: { avatar_url: "https://cdn.test/a.png", full_name: "Ana Clara de Souza" },
      error: null,
    });

    await expect(loadProfileAvatar()).resolves.toEqual({
      url: "https://cdn.test/a.png",
      alt: "Ana Clara de Souza",
    });
    expect(supabase.profilesQuery.eq).toHaveBeenCalledWith("id", TEST_USER.id);
  });

  it("sem perfil, devolve null e a aba mostra o ícone", async () => {
    await expect(loadProfileAvatar()).resolves.toBeNull();
  });

  it("com erro na consulta, devolve null", async () => {
    supabase.profilesQuery.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "boom" },
    });
    await expect(loadProfileAvatar()).resolves.toBeNull();
  });

  it("sem sessão, não consulta o perfil", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(loadProfileAvatar()).resolves.toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
