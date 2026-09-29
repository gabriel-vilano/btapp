// Rotas que o perfil abre (docs/NAVIGATION.md, N8, N10, N19; docs/PROFILE.md).
// As rotas são propostas da spec de navegação: o nome final é da issue de
// cada tela. Ficam num lugar só para a troca ser uma linha.

export const OWN_PROFILE_PATH = '/perfil';
export const EDIT_PROFILE_PATH = '/perfil/editar'; // fluxo modal (PF9, N4)
export const SETTINGS_PATH = '/perfil/configuracoes'; // engrenagem (N8)
export const FEED_PATH = '/feed';
export const FRIENDLY_PATH = '/jogos/amistoso'; // "Registrar amistoso" (N19)
// "Ver todas" do próprio perfil: o Histórico da aba Jogos, a mesma lista (PF18)
export const OWN_HISTORY_PATH = '/jogos#historico';

function segment(value: string): string {
  return encodeURIComponent(value);
}

/** Perfil público de outro jogador (N10). Ex.: `playerPath('lucassilva')` → "/jogadores/lucassilva". */
export function playerPath(username: string): string {
  return `/jogadores/${segment(username)}`;
}

/** "Ver todas" no perfil de outro jogador: a lista sem ações (PF18). */
export function playerMatchesPath(username: string): string {
  return `${playerPath(username)}/partidas`;
}

/** Página de H2H entre quem vê e o jogador (PF17). A rota final é da spec de H2H. */
export function headToHeadPath(username: string): string {
  return `${playerPath(username)}/h2h`;
}

export function matchPath(matchId: string): string {
  return `/jogos/${segment(matchId)}`;
}

/**
 * Classificação da categoria (RK1); com a temporada, a encerrada (RK21).
 * Ex.: `rankingPath('cat-x', 'season-1')` → "/ranking/cat-x?temporada=season-1".
 */
export function rankingPath(categoryId: string, seasonId?: string): string {
  const base = `/ranking/${segment(categoryId)}`;
  return seasonId === undefined ? base : `${base}?temporada=${segment(seasonId)}`;
}
