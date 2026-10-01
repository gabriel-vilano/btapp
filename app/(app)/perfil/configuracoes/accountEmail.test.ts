import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/src/lib/supabase/server";
import {
  asSupabaseClient,
  createSupabaseMock,
  TEST_USER,
  type SupabaseMock,
} from "../../../(auth)/actions.test-utils";
import { loadAccountEmail } from "./accountEmail";

vi.mock("@/src/lib/supabase/server", () => ({ createClient: vi.fn() }));

let supabase: SupabaseMock;

beforeEach(() => {
  supabase = createSupabaseMock();
  vi.mocked(createClient).mockResolvedValue(asSupabaseClient(supabase));
});

describe("loadAccountEmail", () => {
  it("devolve o e-mail do jogador logado", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { ...TEST_USER, email: "ana@email.com" } },
    });
    await expect(loadAccountEmail()).resolves.toBe("ana@email.com");
  });

  it("sem sessão, devolve null", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(loadAccountEmail()).resolves.toBeNull();
  });
});
