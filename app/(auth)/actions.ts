"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import {
  validateEmail,
  validatePassword,
  validateFirstName,
  validateLastName,
  validateOtp,
  validateUsername,
  validateAvatar,
} from "@/src/lib/validations";
import { joinFullName, splitFullName, type PersonName } from "@/src/lib/names";
import { pickFreeUsername, usernameBaseFromName, usernameSearchPrefix } from "@/src/lib/username";
import type { User } from "@supabase/supabase-js";
import { AVATAR_HEADER_LENGTH, detectAvatarFormat } from "@/src/lib/avatarFormat";
import type { AuthActionState } from "@/src/types/auth";
import { LOGIN_RETURN_PARAM, safeReturnPath } from "@/src/lib/navigation/loginReturn";

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

  // O campo vem do formulário e o usuário pode trocá-lo: valida aqui, na fronteira
  const returnPath = formData.get(LOGIN_RETURN_PARAM);
  redirect(safeReturnPath(typeof returnPath === "string" ? returnPath : null));
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const firstName = (formData.get("firstName") as string)?.trim() ?? "";
  const lastName = (formData.get("lastName") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";

  const firstNameResult = validateFirstName(firstName);
  if (!firstNameResult.valid) {
    return { fieldErrors: { firstName: firstNameResult.error } };
  }

  const lastNameResult = validateLastName(lastName);
  if (!lastNameResult.valid) {
    return { fieldErrors: { lastName: lastNameResult.error } };
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
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: joinFullName({ firstName, lastName }),
      },
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

// Quem se cadastrou antes dos dois campos tem só `full_name` nos metadados
function nameFromMetadata(user: User): PersonName {
  const metadata = user.user_metadata ?? {};
  if (typeof metadata.first_name === "string") {
    return {
      firstName: metadata.first_name,
      lastName: typeof metadata.last_name === "string" ? metadata.last_name : "",
    };
  }
  return splitFullName(typeof metadata.full_name === "string" ? metadata.full_name : "");
}

// Busca numa consulta só todos os @usernames que começam como a base, em vez de
// testar gabrielvilano, gabrielvilano2, ... um por um. A base tem só [a-z0-9], então
// não carrega os curingas do LIKE (`%` e `_`). O próprio perfil fica de fora.
async function findFreeUsername(
  supabase: SupabaseServerClient,
  userId: string,
  name: PersonName
): Promise<string | null> {
  const base = usernameBaseFromName(name);
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .like("username", `${usernameSearchPrefix(base)}%`)
    .neq("id", userId);

  if (error || !data) return null;
  const taken = new Set(data.map((row) => row.username).filter((u): u is string => Boolean(u)));
  return pickFreeUsername(base, taken);
}

/**
 * Sugestão de @username para o passo 2 do cadastro, já livre no momento da consulta.
 * `null` sem sessão ou se a consulta falhar: o campo fica vazio e o jogador digita.
 */
export async function suggestUsername(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return findFreeUsername(supabase, user.id, nameFromMetadata(user));
}

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

// Username digitado passa pela validação e pela checagem de unicidade. Vazio (o
// jogador pulou o passo 2) vira a sugestão: todo jogador tem @username, porque o
// perfil mora em /jogadores/[username].
async function resolveUsername(
  supabase: SupabaseServerClient,
  user: User,
  typed: string
): Promise<{ username: string } | NonNullable<AuthActionState>> {
  if (!typed) {
    const suggested = await findFreeUsername(supabase, user.id, nameFromMetadata(user));
    return suggested ? { username: suggested } : { error: "Erro ao salvar perfil. Tente novamente." };
  }

  const validation = validateUsername(typed);
  if (!validation.valid) {
    return { fieldErrors: { username: validation.error } };
  }

  const { available, error: checkError } = await checkUsername(typed);
  return available ? { username: typed } : { error: checkError ?? "Username já está em uso." };
}

async function resolveAvatarUrl(
  supabase: SupabaseServerClient,
  userId: string,
  avatarFile: File | null
): Promise<{ avatarUrl: string | null } | { error: string }> {
  if (!avatarFile || avatarFile.size === 0) return { avatarUrl: null };
  return uploadAvatar(supabase, userId, avatarFile);
}

// Devolve a mensagem de erro para o jogador, ou `null` se salvou
async function saveProfile(
  supabase: SupabaseServerClient,
  user: User,
  username: string,
  avatarUrl: string | null
): Promise<string | null> {
  const name = nameFromMetadata(user);
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    first_name: name.firstName || null,
    last_name: name.lastName || null,
    full_name: joinFullName(name),
    username,
    avatar_url: avatarUrl,
  });

  if (!error) return null;
  return error.message.includes("unique") ? "Username já está em uso." : "Erro ao salvar perfil. Tente novamente.";
}

export async function createProfile(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const typedUsername = (formData.get("username") as string)?.trim() ?? "";
  const avatarFile = formData.get("avatar") as File | null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const resolved = await resolveUsername(supabase, user, typedUsername);
  if (!("username" in resolved)) return resolved;

  const avatar = await resolveAvatarUrl(supabase, user.id, avatarFile);
  if ("error" in avatar) return { error: avatar.error };

  const saveError = await saveProfile(supabase, user, resolved.username, avatar.avatarUrl);
  if (saveError) return { error: saveError };

  redirect("/feed");
}
