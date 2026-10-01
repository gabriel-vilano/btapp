import type { FriendlyReportData } from '@/src/components/agenda/FriendlyReport';
import type { PickablePlayer } from '@/src/components/ui/SidePicker';
import type { FriendlyMatch, Player } from '@/src/types/domain';
import { mockDomain } from './domain';
import { MOCK_VIEWER_ID } from './matchScreen';

// Registrar amistoso (docs/RESULTS.md §6.1) montado das tabelas mockadas, do
// ponto de vista do Lucas. Com o Supabase, a lista de jogadores vira uma busca
// no servidor, e o formato padrão, uma consulta ao último amistoso dele.

/**
 * Dados da tela de registrar amistoso: quem lança, quem pode ser escolhido
 * (qualquer jogador com conta, amigos marcados, RG17) e o formato do último amistoso.
 * @example friendlyReportDataOf().lastFormat // "one_set_of_8"
 */
export function friendlyReportDataOf(viewerId: string = MOCK_VIEWER_ID): FriendlyReportData {
  const viewer = mockDomain.players.find((player) => player.id === viewerId);
  if (viewer === undefined) throw new Error(`Registrar amistoso: jogador '${viewerId}' não existe nos mocks`);
  const friends = friendIdsOf(viewerId);
  return {
    viewer: pickable(viewer, false),
    players: mockDomain.players.filter((player) => player.id !== viewerId).map((player) => pickable(player, friends.has(player.id))),
    lastFormat: lastFriendlyOf(viewerId)?.format ?? null,
  };
}

function pickable(player: Player, isFriend: boolean): PickablePlayer {
  return { id: player.id, name: player.name, username: player.username, avatarUrl: player.avatar_url, isFriend };
}

// Só a amizade aceita conta: o pedido pendente ainda não é amigo
function friendIdsOf(viewerId: string): Set<string> {
  const ids = mockDomain.friendships
    .filter((friendship) => friendship.status === 'accepted')
    .flatMap((friendship) => {
      if (friendship.requester_id === viewerId) return [friendship.addressee_id];
      return friendship.addressee_id === viewerId ? [friendship.requester_id] : [];
    });
  return new Set(ids);
}

// O último que o jogador lançou: o formato foi escolha dele (R29)
function lastFriendlyOf(viewerId: string): FriendlyMatch | undefined {
  return mockDomain.matches
    .filter((match): match is FriendlyMatch => match.kind === 'friendly' && match.report.reported_by === viewerId)
    .sort((first, second) => Date.parse(second.created_at) - Date.parse(first.created_at))[0];
}
