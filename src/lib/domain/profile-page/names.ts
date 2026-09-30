import type { CompetitionCategory, Player, Round } from '@/src/types/domain';
import { formatCategoryLabel } from '@/src/lib/formatters';
import type { ProfilePageDomain } from './types';

// Os nomes que as derivações deixam para a tela (ids → texto). Um id sem
// linha na tabela é erro de integridade, e o erro diz qual.

function findById<T extends { id: string }>(items: T[], id: string, what: string): T {
  const found = items.find((item) => item.id === id);
  if (found === undefined) throw new Error(`Perfil: ${what} '${id}' não existe nas tabelas do domínio`);
  return found;
}

/** Primeiro nome, como o card de resultado fala das duplas. Ex.: "Ana Paula Ribeiro" → "Ana". */
export function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

/** "Masculino B", "Mista C 40+": o nome da categoria é derivado, não guardado. */
export function categoryName(category: CompetitionCategory): string {
  return formatCategoryLabel({
    gender: category.gender,
    modality: category.modality,
    level_min: category.level_min,
    level_max: category.level_max,
    age_group: category.min_age === null ? null : `${category.min_age}+`,
  });
}

export interface NameResolver {
  player: (id: string) => Player;
  partner: (id: string | null) => string | null; // primeiro nome; em simples, null
  competition: (id: string) => string;
  category: (id: string) => string;
  season: (id: string) => string;
  round: (id: string) => Round;
}

/**
 * Leitores de nome sobre as tabelas da página.
 * Ex.: `nameResolver(mockDomain).partner('player-rafael')` → "Rafael".
 */
export function nameResolver(domain: ProfilePageDomain): NameResolver {
  const player = (id: string): Player => findById(domain.players, id, 'jogador');
  return {
    player,
    partner: (id: string | null) => (id === null ? null : firstName(player(id).name)),
    competition: (id: string) => findById(domain.competitions, id, 'competição').name,
    category: (id: string) => categoryName(findById(domain.categories, id, 'categoria')),
    season: (id: string) => findById(domain.seasons, id, 'temporada').name,
    round: (id: string) => findById(domain.rounds, id, 'rodada'),
  };
}

/**
 * Os adversários como a linha os mostra: dupla pelos primeiros nomes, simples
 * pelo nome completo. Ex.: "Pedro e Thiago", "Thiago Mendes".
 */
export function opponentsLabel(names: NameResolver, playerIds: string[]): string {
  const players = playerIds.map(names.player);
  if (players.length === 1) return players[0].name;
  return players.map((p) => firstName(p.name)).join(' e ');
}
