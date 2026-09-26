import type {
  CompetitorUnit,
  Friendship,
  Organization,
  Player,
} from '@/src/types/domain';
import { daysAgo, weeksAgo } from '../relativeTime';

// Jogadores, organizações e unidades competidoras. O `total_matches` inclui o
// histórico do legado, por isso é maior que as partidas destes mocks. Os ids
// dos quatro primeiros jogadores e das arenas são os mesmos de `mocks/feed.ts`.

// "André Lima" → "andrelima"
function toUsername(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '');
}

function player(
  slug: string,
  name: string,
  totalMatches: number,
  birthDate: string | null = null,
): Player {
  return {
    id: `player-${slug}`,
    name,
    username: toUsername(name),
    avatar_url: null,
    birth_date: birthDate,
    total_matches: totalMatches,
  };
}

export const players = {
  // Masculino B (ranking e torneio)
  lucas: player('lucas', 'Lucas Silva', 274),
  rafael: player('rafael', 'Rafael Costa', 310),
  pedro: player('pedro', 'Pedro Henrique', 188),
  thiago: player('thiago', 'Thiago Mendes', 220),
  andre: player('andre', 'André Lima', 96),
  bruno: player('bruno', 'Bruno Araújo', 131),
  caio: player('caio', 'Caio Ferreira', 57),
  diego: player('diego', 'Diego Martins', 64),
  eduardo: player('eduardo', 'Eduardo Rocha', 142),
  felipe: player('felipe', 'Felipe Souza', 119),
  gustavo: player('gustavo', 'Gustavo Pereira', 83),
  henrique: player('henrique', 'Henrique Alves', 77),
  // Mista C 40+: a idade conta pelo ano de nascimento (R33). A Carla faz 40
  // em novembro de 2026 e já vale; a Beatriz não informou a data.
  marcos: player('marcos', 'Marcos Tavares', 205, '1980-03-14'),
  ana: player('ana', 'Ana Paula Ribeiro', 168, '1984-07-22'),
  paulo: player('paulo', 'Paulo César Duarte', 240, '1979-01-05'),
  beatriz: player('beatriz', 'Beatriz Moura', 151),
  sergio: player('sergio', 'Sérgio Batista', 293, '1975-09-30'),
  carla: player('carla', 'Carla Nogueira', 112, '1986-11-02'),
  roberto: player('roberto', 'Roberto Campos', 187, '1982-05-18'),
  julia: player('julia', 'Júlia Andrade', 134, '1983-12-09'),
  vinicius: player('vinicius', 'Vinícius Prado', 98, '1985-02-27'),
  // Admins: a Marina organiza o ranking e não joga nele; o Fábio, o torneio
  marina: player('marina', 'Marina Rocha', 45),
  fabio: player('fabio', 'Fábio Nunes', 61),
} satisfies Record<string, Player>;

export const organizations = {
  arenaRM: {
    id: 'org-arena-rm',
    name: 'Arena RM',
    username: 'arenarm',
    avatar_url: null,
  },
  arenaSunset: {
    id: 'org-arena-sunset',
    name: 'Arena Sunset',
    username: 'arenasunset',
    avatar_url: null,
  },
} satisfies Record<string, Organization>;

type PlayerKey = keyof typeof players;

function singles(key: PlayerKey): CompetitorUnit {
  return { id: `unit-${key}`, modality: 'singles', player_ids: [players[key].id] };
}

function doubles(first: PlayerKey, second: PlayerKey): CompetitorUnit {
  return {
    id: `unit-${first}-${second}`,
    modality: 'doubles',
    player_ids: [players[first].id, players[second].id],
  };
}

// A mesma dupla joga ranking, torneio e amistoso (ex.: Lucas e Rafael), o que
// alimenta o H2H da dupla exata (R19).
export const units = {
  lucasRafael: doubles('lucas', 'rafael'),
  pedroThiago: doubles('pedro', 'thiago'),
  andreBruno: doubles('andre', 'bruno'),
  caioDiego: doubles('caio', 'diego'),
  eduardoFelipe: doubles('eduardo', 'felipe'),
  gustavoHenrique: doubles('gustavo', 'henrique'),
  marcosAna: doubles('marcos', 'ana'),
  pauloBeatriz: doubles('paulo', 'beatriz'),
  sergioCarla: doubles('sergio', 'carla'),
  robertoJulia: doubles('roberto', 'julia'),
  viniciusJulia: doubles('vinicius', 'julia'), // a Júlia trocou de parceiro (R17)
  anaBeatriz: doubles('ana', 'beatriz'),
  carlaJulia: doubles('carla', 'julia'),
  lucas: singles('lucas'),
  thiago: singles('thiago'),
  pedro: singles('pedro'),
  andre: singles('andre'),
  eduardo: singles('eduardo'),
  henrique: singles('henrique'),
  caio: singles('caio'),
  diego: singles('diego'),
} satisfies Record<string, CompetitorUnit>;

export const friendships = {
  lucasPedro: {
    id: 'friendship-lucas-pedro',
    requester_id: players.lucas.id,
    addressee_id: players.pedro.id,
    requested_at: daysAgo(7),
    status: 'accepted',
    accepted_at: daysAgo(6),
  },
  rafaelThiago: {
    id: 'friendship-rafael-thiago',
    requester_id: players.rafael.id,
    addressee_id: players.thiago.id,
    requested_at: weeksAgo(10),
    status: 'accepted',
    accepted_at: weeksAgo(10),
  },
  andreCaio: {
    id: 'friendship-andre-caio',
    requester_id: players.andre.id,
    addressee_id: players.caio.id,
    requested_at: daysAgo(2),
    status: 'pending',
  },
} satisfies Record<string, Friendship>;
