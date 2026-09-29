"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { validateEmail, validatePassword, validateName, validateOtp, validateUsername, validateAvatar } from "@/src/lib/validations";
import { AVATAR_HEADER_LENGTH, detectAvatarFormat } from "@/src/lib/avatarFormat";
import type { AuthActionState } from "@/src/types/auth";

// O Supabase devolve o mesmo erro para código errado e expirado ("Token has expired
// or is invalid", code `otp_expired`), então não dá para dizer qual dos dois aconteceu.
const OTP_REJECTED_MESSAGE = "Código inválido ou expirado. Confira o código ou solicite um novo.";

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get("email") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";

  const emailResult = validateEmail(email);
  if (!emailResult.valid) {
    return { fieldErrors: { email: emailResult.error } };
  }
  if (!password) {
    return { fieldErrors: { password: "Senha é obrigatória" } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-mail ou senha incorretos" };
  }

  redirect("/feed");
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const name = (formData.get("name") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";

  const nameResult = validateName(name);
  if (!nameResult.valid) {
    return { fieldErrors: { name: nameResult.error } };
  }

  const emailResult = validateEmail(email);
  if (!emailResult.valid) {
    return { fieldErrors: { email: emailResult.error } };
  }

  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) {
    return { fieldErrors: { password: "Senha não atende os requisitos" } };
  }

  const supabase = await createClient();
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  });

  if (signUpError) {
    const message = signUpError.message.toLowerCase();
    const alreadyExists =
      message.includes("already registered") ||
      message.includes("user already");

    if (alreadyExists) {
      // E-mail já cadastrado: disparamos um OTP fresco via signInWithOtp
      // para que o jogador (que provavelmente voltou do /cadastro/verificar e
      // reenviou o form) continue o fluxo sem perceber diferença.
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (otpError) {
        return { error: "Erro ao enviar código. Tente novamente." };
      }
    } else {
      return { error: "Erro ao criar conta. Tente novamente." };
    }
  }

  redirect(`/cadastro/verificar?email=${encodeURIComponent(email)}`);
}

export async function verifyOtp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get("email") as string)?.trim() ?? "";
  const otp = (formData.get("otp") as string)?.trim() ?? "";

  const otpResult = validateOtp(otp);
  if (!otpResult.valid) {
    return { fieldErrors: { otp: otpResult.error } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });

  if (error) {
    return { error: OTP_REJECTED_MESSAGE };
  }

  redirect("/cadastro/perfil");
}

export async function resendOtp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get("email") as string)?.trim() ?? "";

  if (!email) {
    return { error: "E-mail não informado." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    return { error: "Erro ao reenviar código. Tente novamente." };
  }

  return { success: true };
}

// Anti-enumeração: o Supabase responde sucesso para e-mail sem conta, mas o cooldown
// de reenvio (`over_email_send_rate_limit`) só existe para conta real. Mostrar esse erro
// revelaria que o e-mail tem cadastro, então ele segue como sucesso: o código enviado
// antes continua valendo e a tela de verificação já tem reenvio com timer.
function isRecoveryCooldown(error: { code?: string }): boolean {
  return error.code === "over_email_send_rate_limit";
}

export async function requestRecovery(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get("email") as string)?.trim() ?? "";

  const emailResult = validateEmail(email);
  if (!emailResult.valid) {
    return { fieldErrors: { email: emailResult.error } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error && !isRecoveryCooldown(error)) {
    return { error: "Não foi possível enviar o código. Tente novamente em alguns minutos." };
  }

  redirect(`/recuperar-senha/verificar?email=${encodeURIComponent(email)}`);
}

export async function verifyRecoveryOtp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get("email") as string)?.trim() ?? "";
  const otp = (formData.get("otp") as string)?.trim() ?? "";

  const otpResult = validateOtp(otp);
  if (!otpResult.valid) {
    return { fieldErrors: { otp: otpResult.error } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "recovery",
  });

  if (error) {
    return { error: OTP_REJECTED_MESSAGE };
  }

  redirect("/recuperar-senha/nova-senha");
}

export async function resendRecoveryOtp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get("email") as string)?.trim() ?? "";

  if (!email) {
    return { error: "E-mail não informado." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error && !isRecoveryCooldown(error)) {
    return { error: "Erro ao reenviar código. Tente novamente." };
  }

  return { success: true };
}

// Sair encerra só a sessão deste aparelho. O `signOut()` sem parâmetro do auth-js
// usa o escopo `global` e derrubaria o jogador em todos os aparelhos. O escopo `local`
// ainda revoga no servidor o refresh token desta sessão, não só apaga os cookies.
const SIGN_OUT_THIS_DEVICE = { scope: "local" } as const;

// Server action (POST) em vez de link GET: com GET, qualquer site poderia deslogar
// o jogador embutindo a URL numa imagem ou num link (CSRF).
export async function logout(): Promise<AuthActionState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut(SIGN_OUT_THIS_DEVICE);

  // Com erro, o auth-js mantém a sessão: redirecionar para /entrar faria o proxy
  // devolver o jogador ao feed, sem explicação.
  if (error) {
    return { error: "Não foi possível sair. Tente novamente." };
  }

  redirect("/entrar");
}

// A sessão aqui nasceu do código de recuperação neste aparelho. Cancelar não deve
// derrubar o jogador nos outros aparelhos, onde ele pode estar logado normalmente.
export async function cancelRecovery() {
  const supabase = await createClient();
  await supabase.auth.signOut(SIGN_OUT_THIS_DEVICE);
  redirect("/entrar");
}

export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) {
    return { fieldErrors: { password: "Senha não atende os requisitos" } };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    if (error.message.toLowerCase().includes("session")) {
      return { error: "Sessão expirada. Reinicie o processo de recuperação." };
    }
    return { error: "Erro ao atualizar senha. Tente novamente." };
  }

  await supabase.auth.signOut();
  redirect("/entrar?recovered=true");
}

export async function checkUsername(username: string): Promise<{
  available: boolean;
  error?: string;
}> {
  const validation = validateUsername(username);
  if (!validation.valid) {
    return { available: false, error: validation.error };
  }

  const supabase = await createClient();
  // maybeSingle: 0 linhas é o caso "livre", não erro (single() devolveria erro)
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .limit(1)
    .maybeSingle();

  // Falha na consulta não pode virar "disponível": na dúvida, bloqueia
  if (error) {
    return { available: false, error: "Não foi possível verificar o username. Tente novamente." };
  }

  return { available: !data };
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// A action pode ser chamada direto (fora da tela), então o avatar é revalidado aqui:
// tipo e tamanho declarados + formato real pelos bytes. Extensão e contentType vêm do
// formato detectado, nunca do nome ou do `type` enviados pelo usuário.
async function uploadAvatar(
  supabase: SupabaseServerClient,
  userId: string,
  avatarFile: File
): Promise<{ avatarUrl: string } | { error: string }> {
  const validation = validateAvatar(avatarFile);
  if (!validation.valid) {
    return { error: validation.error ?? "Foto inválida." };
  }

  const header = new Uint8Array(await avatarFile.slice(0, AVATAR_HEADER_LENGTH).arrayBuffer());
  const format = detectAvatarFormat(header);
  if (!format) {
    return { error: "Formato aceito: JPG, PNG ou WebP" };
  }

  const path = `${userId}/avatar.${format.extension}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, avatarFile, { upsert: true, contentType: format.mimeType });

  if (uploadError) {
    return { error: "Erro ao enviar foto. Tente novamente." };
  }

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
  return { avatarUrl: publicUrl };
}

export async function createProfile(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const username = (formData.get("username") as string)?.trim() ?? "";
  const avatarFile = formData.get("avatar") as File | null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const fullName =
    (user.user_metadata?.full_name as string) ?? "";

  if (username) {
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return { fieldErrors: { username: usernameValidation.error } };
    }

    const { available, error: checkError } = await checkUsername(username);
    if (!available) {
      return { error: checkError ?? "Username já está em uso." };
    }
  }

  let avatarUrl: string | null = null;

  if (avatarFile && avatarFile.size > 0) {
    const upload = await uploadAvatar(supabase, user.id, avatarFile);
    if ("error" in upload) {
      return { error: upload.error };
    }
    avatarUrl = upload.avatarUrl;
  }

  const { error: insertError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullName,
    username: username || null,
    avatar_url: avatarUrl,
  });

  if (insertError) {
    if (insertError.message.includes("unique")) {
      return { error: "Username já está em uso." };
    }
    return { error: "Erro ao salvar perfil. Tente novamente." };
  }

  redirect("/feed");
}
