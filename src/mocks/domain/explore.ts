import {
  DEFAULT_RESPONSE_DEADLINE_HOURS,
  DEFAULT_SCORING_RULE,
  type Organization,
  type RankingCompetition,
  type Round,
  type Season,
  type TournamentCompetition,
} from '@/src/types/domain';
import { daysAgo, daysFromNow, onTheHour } from '../relativeTime';
import { RANKING_VENUE } from './scheduling';

// Organizações e competições que só a vitrine do Explorar usa (docs/EXPLORE.md,
// EX8 a EX11 e EX22). Ficam fora do `mockDomain`, como a temporada encerrada
// do perfil, para as contagens dos outros testes não mudarem. Todos os nomes
// são fictícios (EX36): os dados reais entram pela carga no Supabase.
//
// Com as duas arenas do `mockDomain`, o cenário cobre:
// | Organização         | Tipo      | Contato | Competição                         |
// | Arena Mangaba       | arena     | link    | ranking com temporada em andamento |
// | Arena Tucum         | arena     | texto   | torneio em andamento               |
// | Arena Jenipapo      | arena     | link    | torneio passado (nenhuma aberta)   |
// | Clube Cajuí         | clube     | texto   | ranking entre temporadas           |
// | Grupo Saque Curto   | grupo     | —       | torneio futuro                     |
// | Federação Vale Azul | federação | link    | torneio futuro, mais distante      |

export const exploreOrganizations = {
  arenaJenipapo: {
    id: 'org-arena-jenipapo',
    name: 'Arena Jenipapo',
    username: 'arenajenipapo',
    avatar_url: null,
    kind: 'arena',
    city: 'Sete Lagoas',
    contact: 'https://instagram.com/arenajenipapo',
  },
  clubeCajui: {
    id: 'org-clube-cajui',
    name: 'Clube Cajuí',
    username: 'clubecajui',
    avatar_url: null,
    kind: 'club',
    city: 'Belo Horizonte',
    contact: 'Secretaria do clube: (31) 90000-0003',
  },
  grupoSaqueCurto: {
    id: 'org-grupo-saque-curto',
    name: 'Grupo Saque Curto',
    username: 'gruposaquecurto',
    avatar_url: null,
    kind: 'group',
    city: 'Belo Horizonte',
    contact: null,
  },
  federacaoValeAzul: {
    id: 'org-federacao-vale-azul',
    name: 'Federação Vale Azul de Beach Tennis',
    username: 'federacaovaleazul',
    avatar_url: null,
    kind: 'federation',
    city: 'Belo Horizonte',
    contact: 'https://federacaovaleazul.com.br/inscricoes',
  },
} satisfies Record<string, Organization>;

/** Ranking entre temporadas: a de 2026/1 terminou e a de 2026/2 ainda não começou. */
export const cajuiRanking: RankingCompetition = {
  id: 'comp-ranking-clube-cajui',
  organization_id: exploreOrganizations.clubeCajui.id,
  name: 'Ranking Clube Cajuí',
  type: 'ranking',
  match_format: 'one_set_of_6',
  response_deadline_hours: DEFAULT_RESPONSE_DEADLINE_HOURS,
  matches_per_round: 2,
  partner_change_policy: 'new_team',
  scoring_rule: DEFAULT_SCORING_RULE,
};

export const cajuiSeasons = {
  past: {
    id: 'season-clube-cajui-2026-1',
    ranking_id: cajuiRanking.id,
    name: '1º semestre de 2026',
    starts_on: daysAgo(150),
    ends_on: daysAgo(20),
    final: null,
  },
  next: {
    id: 'season-clube-cajui-2026-2',
    ranking_id: cajuiRanking.id,
    name: '2º semestre de 2026',
    starts_on: daysFromNow(15),
    ends_on: daysFromNow(135),
    final: null,
  },
} satisfies Record<string, Season>;

export const cajuiRounds: Round[] = [
  { id: 'round-clube-cajui-1', season_id: cajuiSeasons.past.id, number: 1, starts_at: daysAgo(150), deadline: daysAgo(85) },
  { id: 'round-clube-cajui-2', season_id: cajuiSeasons.past.id, number: 2, starts_at: daysAgo(85), deadline: daysAgo(20) },
];

/** Torneio futuro de um grupo, jogado na Arena Mangaba: o local é texto (EX25). */
export const saqueCurtoTournament: TournamentCompetition = {
  id: 'comp-desafio-saque-curto',
  organization_id: exploreOrganizations.grupoSaqueCurto.id,
  name: 'Desafio Saque Curto',
  type: 'tournament',
  default_match_format: 'one_set_of_6',
  starts_on: onTheHour(daysFromNow(20)),
  ends_on: onTheHour(daysFromNow(21)),
  venue: RANKING_VENUE,
};

/** Torneio que já aconteceu: a Arena Jenipapo fica sem competição aberta (EX11). */
export const jenipapoTournament: TournamentCompetition = {
  id: 'comp-torneio-inverno-jenipapo',
  organization_id: exploreOrganizations.arenaJenipapo.id,
  name: 'Torneio de Inverno Jenipapo',
  type: 'tournament',
  default_match_format: 'one_set_of_8',
  starts_on: onTheHour(daysAgo(46)),
  ends_on: onTheHour(daysAgo(45)),
  venue: 'Arena Jenipapo · Sete Lagoas/MG',
};

/** Etapa de circuito de uma federação, depois do torneio do grupo (EX8: pela data). */
export const valeAzulTournament: TournamentCompetition = {
  id: 'comp-etapa-vale-azul',
  organization_id: exploreOrganizations.federacaoValeAzul.id,
  name: 'Etapa Vale Azul',
  type: 'tournament',
  default_match_format: 'two_sets_of_6_stb',
  starts_on: onTheHour(daysFromNow(40)),
  ends_on: onTheHour(daysFromNow(41)),
  venue: 'Arena Tucum · Carandaí/MG',
};
