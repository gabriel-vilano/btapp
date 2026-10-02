import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/src/lib/supabase/server";
import { loadEditableProfile } from "./editableProfile";

vi.mock("@/src/lib/supabase/server", () => ({ createClient: vi.fn() }));

type Result = { data: unknown; error: unknown };

function readQuery(result: Result) {
  const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn().mockResolvedValue(result) };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  return query;
}

const USER = {
  id: "user-123",
  user_metadata: { first_name: "Ana Clara", last_name: "de Souza", full_name: "Ana Clara de Souza" },
};

const PROFILE_ROW = {
  first_name: "Lucas",
  last_name: "Silva",
  full_name: "Lucas Silva",
  username: "lucas.bt",
  avatar_url: "https://cdn.test/a.png",
};

function mockSupabase(profile: Result, privateData: Result, user: unknown = USER) {
  const tables: Record<string, ReturnType<typeof readQuery>> = {
    profiles: readQuery(profile),
    profile_private: readQuery(privateData),
  };
  const client = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn((table: string) => tables[table]),
  };
  vi.mocked(createClient).mockResolvedValue(client as unknown as Awaited<ReturnType<typeof createClient>>);
  return tables;
}

beforeEach(() => vi.clearAllMocks());

describe("loadEditableProfile", () => {
  it("junta o perfil e a data de nascimento do próprio jogador", async () => {
    const tables = mockSupabase({ data: PROFILE_ROW, error: null }, { data: { birth_date: "1990-05-12" }, error: null });
    expect(await loadEditableProfile()).toEqual({
      firstName: "Lucas",
      lastName: "Silva",
      username: "lucas.bt",
      avatarUrl: "https://cdn.test/a.png",
      birthDate: "1990-05-12",
    });
    expect(tables.profile_private.eq).toHaveBeenCalledWith("id", "user-123");
  });

  it("sem data informada, o campo vem vazio", async () => {
    mockSupabase({ data: PROFILE_ROW, error: null }, { data: null, error: null });
    expect(await loadEditableProfile()).toMatchObject({ birthDate: "" });
  });

  it("perfil antigo, só com full_name, separa nome e sobrenome", async () => {
    mockSupabase(
      { data: { ...PROFILE_ROW, first_name: null, last_name: null, full_name: "João Pedro Silva" }, error: null },
      { data: null, error: null }
    );
    expect(await loadEditableProfile()).toMatchObject({ firstName: "João", lastName: "Pedro Silva" });
  });

  it("sem linha em profiles, usa o nome do cadastro e deixa o @username para o jogador", async () => {
    mockSupabase({ data: null, error: null }, { data: null, error: null });
    expect(await loadEditableProfile()).toEqual({
      firstName: "Ana Clara",
      lastName: "de Souza",
      username: "",
      avatarUrl: null,
      birthDate: "",
    });
  });

  // Formulário vazio salvo apagaria a data gravada: com erro, a tela não abre o formulário
  it("erro na leitura da data devolve null", async () => {
    mockSupabase({ data: PROFILE_ROW, error: null }, { data: null, error: { message: "relation does not exist" } });
    expect(await loadEditableProfile()).toBeNull();
  });

  it("sem sessão devolve null", async () => {
    mockSupabase({ data: null, error: null }, { data: null, error: null }, null);
    expect(await loadEditableProfile()).toBeNull();
  });
});
