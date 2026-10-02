import type { createClient } from "@/src/lib/supabase/server";
import { AVATAR_HEADER_LENGTH, detectAvatarFormat } from "@/src/lib/avatarFormat";
import { validateAvatar } from "@/src/lib/validations";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Fora dos arquivos "use server" de propósito: toda função exportada de um deles vira
// uma server action que o navegador chama com os argumentos que quiser, e esta recebe
// o `userId` como argumento. Quem chama passa o id da sessão.
//
// A action pode ser chamada direto (fora da tela), então o avatar é revalidado aqui:
// tipo e tamanho declarados + formato real pelos bytes. Extensão e contentType vêm do
// formato detectado, nunca do nome ou do `type` enviados pelo usuário.
/**
 * Envia a foto para `avatars/<userId>/avatar.<ext>` e devolve a URL pública.
 * @example await uploadAvatar(supabase, user.id, file) // { avatarUrl: "https://…/avatar.jpg" }
 */
export async function uploadAvatar(
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
