// Shared primitives

export interface PlayerInfo {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  total_matches: number;
}

export interface OrgInfo {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
}

export interface Category {
  gender: 'M' | 'F' | 'mixed';
  modality: 'singles' | 'doubles';
  level_min: string | null;
  level_max: string | null;
  age_group: string | null;
}

// --- Card headers ---

export interface OrgCardHeader {
  header_type: 'org';
  org: OrgInfo;
  phase: string;
  competition_name: string;
  category: Category;
}

export interface PlayerCardHeader {
  header_type: 'player';
  player: PlayerInfo;
  action_text: string;
}

export type CardHeader = OrgCardHeader | PlayerCardHeader;

// --- Sides (simples / duplas) ---

export interface SinglesSide {
  format: 'singles';
  player: PlayerInfo;
}

export interface DoublesSide {
  format: 'doubles';
  players: [PlayerInfo, PlayerInfo];
}

export type Side = SinglesSide | DoublesSide;

export interface SinglesMatchSide {
  format: 'singles';
  player: PlayerInfo;
}

export interface DoublesMatchSide {
  format: 'doubles';
  players: [PlayerInfo, PlayerInfo];
}

export type MatchSide = SinglesMatchSide | DoublesMatchSide;

// --- Score (result cards) ---

export interface SetScore {
  a: number; // winner-side score for this set
  b: number; // loser-side score for this set
}

export interface NormalScore {
  type: 'normal';
  // 1 entry = 1 set, 2 entries = 2 sets, 3 entries = 2 sets + STB
  sets: SetScore[];
}

export interface WoScore {
  type: 'wo';
}

export interface RetiredScore {
  type: 'retired';
  completed_sets: SetScore[];
}

export type Score = NormalScore | WoScore | RetiredScore;

// --- Card types ---

export interface ResultCard {
  id: string;
  card_type: 'result';
  created_at: string; // ISO 8601 — when the result was published
  header: OrgCardHeader;
  winner: Side; // always rendered top
  loser: Side;  // always rendered bottom
  score: Score;
  date: string; // ISO 8601 — when the match was played
  location: string;
  h2h_count: number;
}

export interface MatchCard {
  id: string;
  card_type: 'match';
  created_at: string; // ISO 8601 — when the matchup was announced
  header: OrgCardHeader;
  side_a: MatchSide; // left side
  side_b: MatchSide; // right side
  date: string;      // ISO 8601 — scheduled match time
  location: string;
  cheer_a: number;
  cheer_b: number;
  user_cheer: 'a' | 'b' | null;
  h2h_count: number;
}

export interface CompetitionInfo {
  id: string;
  name: string;
  category: Category;
  date_display: string;     // pre-formatted, e.g. "20 e 21 de maio de 2026"
  location: string;
  enrollment_count: number; // unidade competidora: duplas em categoria de duplas, jogadores em simples (FEED_CARDS.md §11.4)
  org_avatar_url: string | null;
}

export interface SinglesEnrollmentCard {
  id: string;
  card_type: 'enrollment';
  enrollment_format: 'singles';
  created_at: string;
  player: PlayerInfo;
  competition: CompetitionInfo;
}

export interface DoublesEnrollmentCard {
  id: string;
  card_type: 'enrollment';
  enrollment_format: 'doubles';
  created_at: string;
  players: [PlayerInfo, PlayerInfo];
  competition: CompetitionInfo;
}

export type EnrollmentCard = SinglesEnrollmentCard | DoublesEnrollmentCard;

export interface FriendshipCard {
  id: string;
  card_type: 'friendship';
  created_at: string;
  player_a: PlayerInfo;          // initiator — shown in header
  player_b: PlayerInfo;
  user_is_friend_of_a: boolean;
  user_is_friend_of_b: boolean;
}

export type RankingMilestone = 'leader' | 'top10' | 'finals';

interface RankingCardBase {
  id: string;
  card_type: 'ranking';
  created_at: string;
  player: PlayerInfo;
  ranking_name: string;
  position: number;
  delta: number;   // positions moved — always positive; direction from `movement`
  points: number;
}

export interface RankingUpCard extends RankingCardBase {
  movement: 'up';
}

export interface RankingDownCard extends RankingCardBase {
  movement: 'down';
}

export interface RankingMilestoneCard extends RankingCardBase {
  movement: 'milestone';
  milestone: RankingMilestone;
}

export type RankingCard = RankingUpCard | RankingDownCard | RankingMilestoneCard;

// --- Union ---

export type FeedCard =
  | ResultCard
  | MatchCard
  | EnrollmentCard
  | FriendshipCard
  | RankingCard;
