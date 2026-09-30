import {
  DEFAULT_RESPONSE_DEADLINE_HOURS,
  DEFAULT_SCORING_RULE,
  type CompetitionAdmin,
  type CompetitionCategory,
  type Enrollment,
  type RankingCompetition,
  type Round,
  type Season,
} from '@/src/types/domain';
import { daysAgo, daysFromNow } from '../relativeTime';
import { organizations, players, units } from './people';

// Ranking no modelo do Vila do Tênis (docs/DOMAIN.md, PESQ-RV): 2 jogos por
// rodada, 4 rodadas no semestre e final para os primeiros de cada categoria.
// Hoje a temporada está na rodada 3: as rodadas 1 e 2 fecharam e a 4 ainda
// não começou.

export const ranking: RankingCompetition = {
  id: 'comp-ranking-arena-mangaba',
  organization_id: organizations.arenaMangaba.id,
  name: 'Ranking Arena Mangaba 2026',
  type: 'ranking',
  match_format: 'one_set_of_6',
  response_deadline_hours: DEFAULT_RESPONSE_DEADLINE_HOURS,
  matches_per_round: 2,
  partner_change_policy: 'new_team',
  scoring_rule: DEFAULT_SCORING_RULE,
};

export const rankingAdmin: CompetitionAdmin = {
  competition_id: ranking.id,
  player_id: players.marina.id,
  granted_at: daysAgo(70),
};

export const season: Season = {
  id: 'season-arena-mangaba-2026-2',
  ranking_id: ranking.id,
  name: '2º semestre de 2026',
  starts_on: daysAgo(60),
  ends_on: daysFromNow(40),
  final: {
    name: 'Saideira',
    qualifiers: 4,
    cutoff_date: daysFromNow(25),
    tournament_id: null, // o torneio da final ainda não foi criado
  },
};

function round(number: number, startsAt: string, deadline: string): Round {
  return { id: `round-arena-mangaba-${number}`, season_id: season.id, number, starts_at: startsAt, deadline };
}

export const rounds = {
  first: round(1, daysAgo(60), daysAgo(39)),
  second: round(2, daysAgo(39), daysAgo(18)),
  third: round(3, daysAgo(18), daysFromNow(3)),
  fourth: round(4, daysFromNow(3), daysFromNow(24)),
};

export const rankingCategories = {
  masculinoB: {
    id: 'cat-arena-mangaba-masculino-b',
    competition_id: ranking.id,
    gender: 'M',
    modality: 'doubles',
    level_min: 'B',
    level_max: 'B',
    min_age: null,
  },
  mistaC40: {
    id: 'cat-arena-mangaba-mista-c-40',
    competition_id: ranking.id,
    gender: 'mixed',
    modality: 'doubles',
    level_min: 'C',
    level_max: 'C',
    min_age: 40,
  },
} satisfies Record<string, CompetitionCategory>;

type UnitKey = keyof typeof units;

function seasonEnrollment(unit: UnitKey, category: CompetitionCategory, enrolledAt: string): Enrollment {
  return {
    id: `enr-arena-mangaba-${units[unit].id.replace('unit-', '')}`,
    unit_id: units[unit].id,
    category_id: category.id,
    season_id: season.id,
    enrolled_at: enrolledAt,
    status: 'active',
  };
}

// Carga inicial do organizador (R32), dois dias antes da temporada.
const LOADED_AT = daysAgo(62);
// A Júlia trocou de parceiro entre as rodadas 1 e 2 (R17, R45).
const PARTNER_CHANGE_AT = daysAgo(37);

/** Masculino B: seis duplas, T1 a T6 na ordem abaixo. */
export const masculinoB = {
  t1: seasonEnrollment('lucasRafael', rankingCategories.masculinoB, LOADED_AT),
  t2: seasonEnrollment('pedroThiago', rankingCategories.masculinoB, LOADED_AT),
  t3: seasonEnrollment('andreBruno', rankingCategories.masculinoB, LOADED_AT),
  t4: seasonEnrollment('caioDiego', rankingCategories.masculinoB, LOADED_AT),
  t5: seasonEnrollment('eduardoFelipe', rankingCategories.masculinoB, LOADED_AT),
  t6: seasonEnrollment('gustavoHenrique', rankingCategories.masculinoB, LOADED_AT),
};

/** Mista C 40+: quatro duplas; a M4 se desfez e a Júlia voltou como M5. */
export const mistaC40 = {
  m1: seasonEnrollment('marcosAna', rankingCategories.mistaC40, LOADED_AT),
  m2: seasonEnrollment('pauloBeatriz', rankingCategories.mistaC40, LOADED_AT),
  m3: seasonEnrollment('sergioCarla', rankingCategories.mistaC40, LOADED_AT),
  m4: {
    ...seasonEnrollment('robertoJulia', rankingCategories.mistaC40, LOADED_AT),
    status: 'closed',
    closed_at: PARTNER_CHANGE_AT,
    closed_reason: 'partner_change',
  } satisfies Enrollment,
  m5: seasonEnrollment('viniciusJulia', rankingCategories.mistaC40, PARTNER_CHANGE_AT),
};
