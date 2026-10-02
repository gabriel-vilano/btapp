import { SETTINGS_PATH } from "@/src/lib/domain/profile-page";

/**
 * Tela "Telefone para o WhatsApp" (docs/SCHEDULING.md M20, M25), aberta pelas
 * Configurações ou pelo primeiro toque em "Abrir no WhatsApp". Vinda do
 * confronto, ela volta para ele depois de salvar.
 */
export const PHONE_SETTINGS_PATH = `${SETTINGS_PATH}/telefone`;
export const PHONE_RETURN_PARAM = "volta";

// Só a tela do confronto é destino de volta: o parâmetro vem da URL, e aceitar
// qualquer caminho abriria um redirecionamento para onde quem montou o link quiser
const MATCH_SCREEN_PATH = /^\/jogos\/[^/?#\\]+$/;

/**
 * Link para a tela do telefone; com `returnTo`, ela volta para lá depois de salvar.
 * @example phoneSettingsHref("/jogos/match-1") // "/perfil/configuracoes/telefone?volta=%2Fjogos%2Fmatch-1"
 */
export function phoneSettingsHref(returnTo?: string): string {
  if (!returnTo) return PHONE_SETTINGS_PATH;
  return `${PHONE_SETTINGS_PATH}?${PHONE_RETURN_PARAM}=${encodeURIComponent(returnTo)}`;
}

/**
 * Para onde ir depois de salvar ou apagar: a tela do confronto de onde o jogador
 * veio, ou as Configurações.
 * @example phoneReturnPath("//evil.com") // "/perfil/configuracoes"
 */
export function phoneReturnPath(candidate: string | null | undefined): string {
  return candidate && MATCH_SCREEN_PATH.test(candidate) ? candidate : SETTINGS_PATH;
}
