import { vi } from "vitest";
import type { createClient } from "@/src/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export const TEST_USER = {
  id: "user-123",
  user_metadata: { first_name: "Ana Clara", last_name: "de Souza", full_name: "Ana Clara de Souza" },
};

/**
 * Fake do client do Supabase com só os métodos que as server actions usam.
 * Cada método é um `vi.fn()` que por padrão responde sucesso. O teste
 * sobrescreve só o que o cenário pede, ex:
 * `supabase.auth.verifyOtp.mockResolvedValueOnce({ error: { message: "Token has expired" } })`
 */
export function createSupabaseMock() {
  const profilesQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    upsert: vi.fn().mockResolvedValue({ error: null }),
  };
  // Query builder encadeável: select().eq().limit() devolvem o próprio builder
  profilesQuery.select.mockReturnValue(profilesQuery);
  profilesQuery.eq.mockReturnValue(profilesQuery);
  profilesQuery.limit.mockReturnValue(profilesQuery);

  const avatarsBucket = {
    upload: vi.fn().mockResolvedValue({ error: null }),
    getPublicUrl: vi.fn().mockReturnValue({
      data: { publicUrl: "https://cdn.test/avatars/user-123/avatar.png" },
    }),
  };

  const auth = {
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    verifyOtp: vi.fn().mockResolvedValue({ error: null }),
    resend: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: TEST_USER } }),
  };

  return {
    auth,
    from: vi.fn().mockReturnValue(profilesQuery),
    storage: { from: vi.fn().mockReturnValue(avatarsBucket) },
    profilesQuery,
    avatarsBucket,
  };
}

export type SupabaseMock = ReturnType<typeof createSupabaseMock>;

/** O mock cobre só parte da API real; o cast fica isolado aqui. */
export function asSupabaseClient(mock: SupabaseMock): SupabaseServerClient {
  return mock as unknown as SupabaseServerClient;
}

const PNG_HEADER = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Arquivo que começa com a assinatura real de PNG, para passar pela checagem de bytes. */
export function buildPngFile(name = "foto.png", type = "image/png"): File {
  return new File([new Uint8Array([...PNG_HEADER, 0, 0, 0, 0])], name, { type });
}

export function buildFormData(fields: Record<string, string | File>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return formData;
}

/** Mensagem que o mock de `redirect` lança, imitando o NEXT_REDIRECT real. */
export function redirectSignal(url: string): string {
  return `NEXT_REDIRECT:${url}`;
}
