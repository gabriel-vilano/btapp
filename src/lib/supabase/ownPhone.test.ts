import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/src/lib/supabase/server";
import { loadOwnPhone } from "./ownPhone";

vi.mock("@/src/lib/supabase/server", () => ({ createClient: vi.fn() }));

function createSupabaseMock() {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { phone: "+5531999990001" }, error: null }),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-123" } } }) },
    from: vi.fn().mockReturnValue(query),
    query,
  };
}

let supabase: ReturnType<typeof createSupabaseMock>;

beforeEach(() => {
  supabase = createSupabaseMock();
  vi.mocked(createClient).mockResolvedValue(supabase as unknown as Awaited<ReturnType<typeof createClient>>);
});

describe("loadOwnPhone", () => {
  it("lê só a linha do jogador logado", async () => {
    await expect(loadOwnPhone()).resolves.toBe("+5531999990001");
    expect(supabase.from).toHaveBeenCalledWith("profile_private");
    expect(supabase.query.eq).toHaveBeenCalledWith("id", "user-123");
  });

  it("sem linha ou sem número, devolve null", async () => {
    supabase.query.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    await expect(loadOwnPhone()).resolves.toBeNull();
    supabase.query.maybeSingle.mockResolvedValueOnce({ data: { phone: null }, error: null });
    await expect(loadOwnPhone()).resolves.toBeNull();
  });

  it("erro na leitura ou sem sessão vira \"error\"", async () => {
    supabase.query.maybeSingle.mockResolvedValueOnce({ data: null, error: { message: "network" } });
    await expect(loadOwnPhone()).resolves.toBe("error");
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(loadOwnPhone()).resolves.toBe("error");
  });
});
