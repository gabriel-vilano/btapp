import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/src/lib/supabase/server";
import {
  asSupabaseClient,
  createSupabaseMock,
  TEST_USER,
  type SupabaseMock,
} from "../../(auth)/actions.test-utils";
import { loadOwnProfileIdentity } from "./ownProfileIdentity";

vi.mock("@/src/lib/supabase/server", () => ({ createClient: vi.fn() }));

const PROFILE_ROW = {
  first_name: "Ana Clara",
  last_name: "de Souza",
  full_name: "Ana Clara de Souza",
  username: "anaclara",
  avatar_url: "https://cdn.test/a.png",
};

let supabase: SupabaseMock;

beforeEach(() => {
  supabase = createSupabaseMock();
  vi.mocked(createClient).mockResolvedValue(asSupabaseClient(supabase));
});

describe("loadOwnProfileIdentity", () => {
  it("devolve nome, @username e foto do perfil do jogador logado", async () => {
    supabase.profilesQuery.maybeSingle.mockResolvedValueOnce({ data: PROFILE_ROW, error: null });

    await expect(loadOwnProfileIdentity()).resolves.toEqual({
      name: "Ana Clara de Souza",
      username: "anaclara",
      avatar_url: "https://cdn.test/a.png",
    });
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(supabase.profilesQuery.eq).toHaveBeenCalledWith("id", TEST_USER.id);
  });

  it("não lê a data de nascimento: só a tabela pública de perfis", async () => {
    supabase.profilesQuery.maybeSingle.mockResolvedValueOnce({ data: PROFILE_ROW, error: null });
    await loadOwnProfileIdentity();
    expect(supabase.from).not.toHaveBeenCalledWith("profile_private");
  });

  it("perfil antigo, só com o full_name, usa o nome completo", async () => {
    supabase.profilesQuery.maybeSingle.mockResolvedValueOnce({
      data: { ...PROFILE_ROW, first_name: null, last_name: null, full_name: "João Pedro Silva" },
      error: null,
    });
    await expect(loadOwnProfileIdentity()).resolves.toMatchObject({ name: "João Pedro Silva" });
  });

  it("perfil sem @username devolve null", async () => {
    supabase.profilesQuery.maybeSingle.mockResolvedValueOnce({ data: { ...PROFILE_ROW, username: null }, error: null });
    await expect(loadOwnProfileIdentity()).resolves.toBeNull();
  });

  it("sem perfil, devolve null", async () => {
    await expect(loadOwnProfileIdentity()).resolves.toBeNull();
  });

  it("com erro na consulta, devolve null", async () => {
    supabase.profilesQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    await expect(loadOwnProfileIdentity()).resolves.toBeNull();
  });

  it("sem sessão, não consulta o perfil", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(loadOwnProfileIdentity()).resolves.toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
