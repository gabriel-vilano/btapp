import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/src/lib/supabase/server";
import {
  cancelRecovery,
  requestRecovery,
  resendRecoveryOtp,
  updatePassword,
  verifyRecoveryOtp,
} from "./actions";
import {
  asSupabaseClient,
  buildFormData,
  createSupabaseMock,
  redirectSignal,
  type SupabaseMock,
} from "./actions.test-utils";

vi.mock("@/src/lib/supabase/server", () => ({ createClient: vi.fn() }));
// redirect() real lança NEXT_REDIRECT e interrompe a action; o mock imita isso
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

const INTERNAL_ERROR = "AuthApiError: connection to db-internal-42 refused";
const EMAIL_COOLDOWN_ERROR = {
  code: "over_email_send_rate_limit",
  message: "For security purposes, you can only request this after 42 seconds.",
};

let supabase: SupabaseMock;

beforeEach(() => {
  supabase = createSupabaseMock();
  vi.mocked(createClient).mockResolvedValue(asSupabaseClient(supabase));
});

describe("requestRecovery", () => {
  it("rejeita email inválido sem chamar o Supabase", async () => {
    const result = await requestRecovery(null, buildFormData({ email: "" }));
    expect(result).toEqual({ fieldErrors: { email: "E-mail é obrigatório" } });
    expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  // Regressão: antes qualquer erro virava "E-mail não encontrado."
  it("erro do Supabase: mensagem neutra, sem citar o e-mail nem vazar o erro interno", async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: { message: INTERNAL_ERROR } });
    const result = await requestRecovery(null, buildFormData({ email: "ana@test.com" }));
    expect(result).toEqual({
      error: "Não foi possível enviar o código. Tente novamente em alguns minutos.",
    });
  });

  // Regressão (enumeração): o cooldown só existe para conta real; erro aqui revelaria o cadastro
  it("cooldown de envio segue como sucesso, igual a e-mail sem conta", async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: EMAIL_COOLDOWN_ERROR });
    const form = buildFormData({ email: "ana@test.com" });
    const verifyUrl = "/recuperar-senha/verificar?email=ana%40test.com";
    await expect(requestRecovery(null, form)).rejects.toThrow(redirectSignal(verifyUrl));
  });

  it("envia o código e redireciona para a verificação", async () => {
    const form = buildFormData({ email: "ana@test.com" });
    const verifyUrl = "/recuperar-senha/verificar?email=ana%40test.com";
    await expect(requestRecovery(null, form)).rejects.toThrow(redirectSignal(verifyUrl));
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("ana@test.com");
  });
});

describe("verifyRecoveryOtp", () => {
  const form = () => buildFormData({ email: "ana@test.com", otp: "87654321" });

  it("rejeita OTP fora do formato sem chamar o Supabase", async () => {
    const result = await verifyRecoveryOtp(null, buildFormData({ email: "ana@test.com", otp: "abc" }));
    expect(result?.fieldErrors?.otp).toBe("Código precisa ter 8 dígitos");
    expect(supabase.auth.verifyOtp).not.toHaveBeenCalled();
  });

  // Regressão: código errado aparecia como "Código expirado", porque o Supabase usa
  // o mesmo erro (`otp_expired`) para os dois casos
  it("código errado ou expirado: mensagem única que cobre os dois casos", async () => {
    supabase.auth.verifyOtp.mockResolvedValueOnce({
      error: { code: "otp_expired", message: "Token has expired or is invalid" },
    });
    const result = await verifyRecoveryOtp(null, form());
    expect(result).toEqual({
      error: "Código inválido ou expirado. Confira o código ou solicite um novo.",
    });
  });

  it("erro desconhecido: mesma mensagem, sem vazar o erro interno", async () => {
    supabase.auth.verifyOtp.mockResolvedValueOnce({ error: { message: INTERNAL_ERROR } });
    const result = await verifyRecoveryOtp(null, form());
    expect(result).toEqual({
      error: "Código inválido ou expirado. Confira o código ou solicite um novo.",
    });
  });

  it("OTP válido verifica como `recovery` e segue para a nova senha", async () => {
    await expect(verifyRecoveryOtp(null, form())).rejects.toThrow(
      redirectSignal("/recuperar-senha/nova-senha"),
    );
    expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
      email: "ana@test.com",
      token: "87654321",
      type: "recovery",
    });
  });
});

describe("resendRecoveryOtp", () => {
  it("exige email", async () => {
    const result = await resendRecoveryOtp(null, buildFormData({ email: "  " }));
    expect(result).toEqual({ error: "E-mail não informado." });
  });

  it("falha no reenvio: mensagem amigável", async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: { message: INTERNAL_ERROR } });
    const result = await resendRecoveryOtp(null, buildFormData({ email: "ana@test.com" }));
    expect(result).toEqual({ error: "Erro ao reenviar código. Tente novamente." });
  });

  it("cooldown de envio não revela a conta: responde sucesso", async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: EMAIL_COOLDOWN_ERROR });
    const result = await resendRecoveryOtp(null, buildFormData({ email: "ana@test.com" }));
    expect(result).toEqual({ success: true });
  });

  it("reenvia o código de recuperação", async () => {
    const result = await resendRecoveryOtp(null, buildFormData({ email: "ana@test.com" }));
    expect(result).toEqual({ success: true });
  });
});

describe("cancelRecovery", () => {
  it("encerra só a sessão de recuperação deste aparelho e volta para o login", async () => {
    await expect(cancelRecovery()).rejects.toThrow(redirectSignal("/entrar"));
    expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});

describe("updatePassword", () => {
  const validFields = { password: "nova1234", confirmPassword: "nova1234" };

  it("rejeita senha fraca", async () => {
    const result = await updatePassword(null, buildFormData({ password: "123", confirmPassword: "123" }));
    expect(result).toEqual({ fieldErrors: { password: "Senha não atende os requisitos" } });
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it("rejeita confirmação diferente", async () => {
    const form = buildFormData({ ...validFields, confirmPassword: "nova12345" });
    const result = await updatePassword(null, form);
    expect(result).toEqual({ error: "As senhas não coincidem." });
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it("sessão de recuperação expirada pede para recomeçar", async () => {
    supabase.auth.updateUser.mockResolvedValueOnce({ error: { message: "Auth session missing!" } });
    const result = await updatePassword(null, buildFormData(validFields));
    expect(result).toEqual({ error: "Sessão expirada. Reinicie o processo de recuperação." });
  });

  it("erro desconhecido: mensagem genérica, sem deslogar", async () => {
    supabase.auth.updateUser.mockResolvedValueOnce({ error: { message: INTERNAL_ERROR } });
    const result = await updatePassword(null, buildFormData(validFields));
    expect(result).toEqual({ error: "Erro ao atualizar senha. Tente novamente." });
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it("atualiza a senha, desloga e volta para o login com aviso", async () => {
    await expect(updatePassword(null, buildFormData(validFields))).rejects.toThrow(
      redirectSignal("/entrar?recovered=true"),
    );
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: "nova1234" });
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
