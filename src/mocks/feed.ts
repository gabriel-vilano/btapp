import type {
  FeedCard,
  PlayerInfo,
  OrgInfo,
} from '@/src/types/feed';
import {
  daysAgo,
  daysFromNow,
  hoursAgo,
  minutesAgo,
  onTheHour,
  weeksAgo,
} from './relativeTime';

// --- Shared entities ---

const lucas: PlayerInfo = {
  id: 'player-lucas',
  name: 'Lucas Silva',
  username: 'lucassilva',
  avatar_url: null,
  total_matches: 274,
};

const pedro: PlayerInfo = {
  id: 'player-pedro',
  name: 'Pedro Henrique',
  username: 'pedrohenrique',
  avatar_url: null,
  total_matches: 188,
};

const rafael: PlayerInfo = {
  id: 'player-rafael',
  name: 'Rafael Costa',
  username: 'rafaelcosta',
  avatar_url: null,
  total_matches: 310,
};

const thiago: PlayerInfo = {
  id: 'player-thiago',
  name: 'Thiago Mendes',
  username: 'thiagomendes',
  avatar_url: null,
  total_matches: 220,
};

const arenaRM: OrgInfo = {
  id: 'org-arena-rm',
  name: 'Arena RM',
  username: 'arenarm',
  avatar_url: null,
};

const arenaSunset: OrgInfo = {
  id: 'org-arena-sunset',
  name: 'Arena Sunset',
  username: 'arenasunset',
  avatar_url: null,
};

// --- Mock cards (13 variações) ---

export const mockFeedCards: FeedCard[] = [
  // 1. Resultado — 1 set simples
  {
    id: 'event-result-1set',
    card_type: 'result',
    created_at: minutesAgo(15),
    header: {
      header_type: 'org',
      org: arenaRM,
      phase: 'Rodada 3',
      competition_name: 'Copa Nubeach de Beach Tennis',
      category: {
        gender: 'M',
        modality: 'singles',
        level_min: 'B',
        level_max: 'B',
        age_group: null,
      },
    },
    winner: { format: 'singles', player: lucas },
    loser: { format: 'singles', player: pedro },
    score: { type: 'normal', sets: [{ a: 6, b: 4 }] },
    date: onTheHour(hoursAgo(1)),
    location: 'Arena RM – Beach · Nova Lima/MG',
    h2h_count: 2,
  },

  // 2. Resultado — 2 sets simples
  {
    id: 'event-result-2sets',
    card_type: 'result',
    created_at: hoursAgo(2),
    header: {
      header_type: 'org',
      org: arenaRM,
      phase: 'Rodada 2',
      competition_name: 'Open Arena RM de Beach Tennis',
      category: {
        gender: 'M',
        modality: 'singles',
        level_min: 'C',
        level_max: 'C',
        age_group: null,
      },
    },
    winner: { format: 'singles', player: lucas },
    loser: { format: 'singles', player: pedro },
    score: { type: 'normal', sets: [{ a: 6, b: 4 }, { a: 6, b: 3 }] },
    date: onTheHour(hoursAgo(4)),
    location: 'Arena RM – Beach · Nova Lima/MG',
    h2h_count: 1,
  },

  // 3. Resultado — 3 sets duplas com STB
  {
    id: 'event-result-3sets-stb',
    card_type: 'result',
    created_at: hoursAgo(5),
    header: {
      header_type: 'org',
      org: arenaSunset,
      phase: 'Semifinal',
      competition_name: 'Copa BH de Beach Tennis',
      category: {
        gender: 'M',
        modality: 'doubles',
        level_min: 'B',
        level_max: 'B',
        age_group: null,
      },
    },
    winner: { format: 'doubles', players: [lucas, rafael] },
    loser: { format: 'doubles', players: [pedro, thiago] },
    score: {
      type: 'normal',
      sets: [{ a: 6, b: 4 }, { a: 4, b: 6 }, { a: 10, b: 7 }],
    },
    date: onTheHour(hoursAgo(7)),
    location: 'Arena Sunset · Carandaí/MG',
    h2h_count: 3,
  },

  // 4. Resultado — WO
  {
    id: 'event-result-wo',
    card_type: 'result',
    created_at: hoursAgo(18),
    header: {
      header_type: 'org',
      org: arenaRM,
      phase: 'Rodada 1',
      competition_name: 'Ranking BH',
      category: {
        gender: 'M',
        modality: 'singles',
        level_min: 'B',
        level_max: 'B',
        age_group: null,
      },
    },
    winner: { format: 'singles', player: lucas },
    loser: { format: 'singles', player: pedro },
    score: { type: 'wo' },
    date: onTheHour(daysAgo(1)),
    location: 'Arena RM – Beach · Nova Lima/MG',
    h2h_count: 0,
  },

  // 5. Resultado — Desistência (com set parcial jogado)
  {
    id: 'event-result-retired',
    card_type: 'result',
    created_at: daysAgo(1),
    header: {
      header_type: 'org',
      org: arenaRM,
      phase: 'Rodada 2',
      competition_name: 'Ranking Arena RM 2026',
      category: {
        gender: 'M',
        modality: 'singles',
        level_min: 'C',
        level_max: 'C',
        age_group: null,
      },
    },
    winner: { format: 'singles', player: lucas },
    loser: { format: 'singles', player: pedro },
    score: { type: 'retired', completed_sets: [{ a: 6, b: 2 }] },
    date: onTheHour(daysAgo(2)),
    location: 'Arena RM – Beach · Nova Lima/MG',
    h2h_count: 0,
  },

  // 6. Confronto — Simples
  {
    id: 'event-match-singles',
    card_type: 'match',
    created_at: daysAgo(2),
    header: {
      header_type: 'org',
      org: arenaSunset,
      phase: 'QF',
      competition_name: 'Torneio Sunset',
      category: {
        gender: 'M',
        modality: 'singles',
        level_min: 'B',
        level_max: 'B',
        age_group: null,
      },
    },
    side_a: { format: 'singles', player: lucas },
    side_b: { format: 'singles', player: pedro },
    date: onTheHour(daysFromNow(1)),
    location: 'Arena Sunset · Carandaí/MG',
    cheer_a: 12,
    cheer_b: 8,
    user_cheer: null,
    h2h_count: 3,
  },

  // 7. Confronto — Duplas
  {
    id: 'event-match-doubles',
    card_type: 'match',
    created_at: daysAgo(3),
    header: {
      header_type: 'org',
      org: arenaSunset,
      phase: 'QF',
      competition_name: 'Torneio Sunset',
      category: {
        gender: 'M',
        modality: 'doubles',
        level_min: 'B',
        level_max: 'B',
        age_group: null,
      },
    },
    side_a: { format: 'doubles', players: [lucas, rafael] },
    side_b: { format: 'doubles', players: [pedro, thiago] },
    date: onTheHour(daysFromNow(1.1)),
    location: 'Arena Sunset · Carandaí/MG',
    cheer_a: 12,
    cheer_b: 8,
    user_cheer: 'a',
    h2h_count: 2,
  },

  // 8. Inscrição — Simples
  {
    id: 'event-enrollment-singles',
    card_type: 'enrollment',
    enrollment_format: 'singles',
    created_at: daysAgo(4),
    player: lucas,
    competition: {
      id: 'comp-copa-bh',
      name: 'Copa BH de Beach Tennis',
      category: {
        gender: 'M',
        modality: 'singles',
        level_min: 'B',
        level_max: 'B',
        age_group: null,
      },
      date_display: '20 e 21 de maio de 2026',
      location: 'Arena Sunset · Carandaí/MG',
      enrollment_count: 24,
      org_avatar_url: null,
    },
  },

  // 9. Inscrição — Duplas
  {
    id: 'event-enrollment-doubles',
    card_type: 'enrollment',
    enrollment_format: 'doubles',
    created_at: daysAgo(5),
    players: [lucas, rafael],
    competition: {
      id: 'comp-copa-bh-duplas',
      name: 'Copa BH de Beach Tennis',
      category: {
        gender: 'M',
        modality: 'doubles',
        level_min: 'C',
        level_max: 'C',
        age_group: null,
      },
      date_display: '20 e 21 de maio de 2026',
      location: 'Arena Sunset · Carandaí/MG',
      enrollment_count: 16,
      org_avatar_url: null,
    },
  },

  // 10. Nova Amizade
  {
    id: 'event-friendship',
    card_type: 'friendship',
    created_at: daysAgo(6),
    player_a: lucas,    // initiator
    player_b: pedro,
    user_is_friend_of_a: true,
    user_is_friend_of_b: false,
  },

  // 11. Ranking — Subiu
  {
    id: 'event-ranking-up',
    card_type: 'ranking',
    created_at: weeksAgo(1),
    player: lucas,
    ranking_name: 'Ranking BH — Masculino B',
    position: 3,
    delta: 2,
    points: 520,
    movement: 'up',
  },

  // 12. Ranking — Desceu
  {
    id: 'event-ranking-down',
    card_type: 'ranking',
    created_at: weeksAgo(2),
    player: pedro,
    ranking_name: 'Ranking BH — Masculino B · Simples',
    position: 7,
    delta: 2,
    points: 380,
    movement: 'down',
  },

  // 13. Ranking — Marco (1ª posição)
  {
    id: 'event-ranking-milestone',
    card_type: 'ranking',
    created_at: weeksAgo(3),
    player: lucas,
    ranking_name: 'Ranking BH — Masculino B',
    position: 1,
    delta: 1,
    points: 580,
    movement: 'milestone',
    milestone: 'leader',
  },
];
