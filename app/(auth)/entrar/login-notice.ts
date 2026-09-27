type LoginNotice = {
  status: "success" | "information";
  title: string;
  description: string;
};

type SearchParamsReader = { get(name: string): string | null };

const RECOVERED_NOTICE: LoginNotice = {
  status: "success",
  title: "Senha redefinida com sucesso",
  description: "Faça login com sua nova senha.",
};

// Azul (information), não vermelho: a pessoa não errou nada. O audit do app
// atual apontou o "sessão encerrada" alarmista como problema de feedback.
const EXPIRED_NOTICE: LoginNotice = {
  status: "information",
  title: "Sua sessão expirou",
  description: "Por segurança, entre de novo.",
};

/**
 * Aviso que o login mostra ao chegar, lido da query string.
 * Ex: `/entrar?expired=true` vem do proxy quando o cookie de sessão não vale mais.
 */
export function loginNoticeFor(searchParams: SearchParamsReader): LoginNotice | null {
  if (searchParams.get("recovered") === "true") return RECOVERED_NOTICE;
  if (searchParams.get("expired") === "true") return EXPIRED_NOTICE;
  return null;
}
