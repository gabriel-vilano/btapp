// Pessoas e relações (docs/DOMAIN.md §1, "Pessoas e relações").

/** Pessoa com conta no LetzPlay. O cadastro não coleta gênero (R26). */
export interface Player {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  birth_date: string | null; // ISO 8601 (só a data); opcional (R33)
  total_matches: number; // partidas confirmadas, exceto W.O. e W.O. duplo (R18)
}

interface FriendshipBase {
  id: string;
  requester_id: string;
  addressee_id: string;
  requested_at: string; // ISO 8601
}

export interface PendingFriendship extends FriendshipBase {
  status: 'pending';
}

/** Só a amizade aceita gera evento no feed (R24). */
export interface AcceptedFriendship extends FriendshipBase {
  status: 'accepted';
  accepted_at: string; // ISO 8601
}

export type Friendship = PendingFriendship | AcceptedFriendship;
