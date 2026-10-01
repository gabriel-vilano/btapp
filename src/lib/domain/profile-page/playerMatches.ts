import { nameResolver } from './names';
import { playerPath } from './routes';
import { matchItems } from './sections';
import type { PlayerMatchesData, ProfilePageDomain } from './types';

// Lista completa das partidas de outro jogador (PROFILE.md PF18): o destino do
// "Ver todas" de "Partidas recentes" no perfil público. Mesmas linhas e mesmo
// filtro da seção (o W.O. em que ele não compareceu e o W.O. duplo ficam fora,
// como no cartel, PF6), sem o limite de 5. Sem agrupar por mês: decisão do
// Gabriel em 01/10/2026. O próprio histórico é o da aba Jogos, não esta lista.

/**
 * Partidas confirmadas de `username`, a mais recente primeiro, ou null quando o @username não existe.
 * Ex.: `buildPlayerMatches(mockProfileDomain, 'pedrohenrique')`.
 */
export function buildPlayerMatches(domain: ProfilePageDomain, username: string): PlayerMatchesData | null {
  const owner = domain.players.find((candidate) => candidate.username === username);
  if (owner === undefined) return null;
  return {
    owner: { name: owner.name, username: owner.username },
    profile_href: playerPath(owner.username),
    matches: matchItems(domain, nameResolver(domain), owner.id, Infinity),
  };
}
