import type {
  AdminPendingItem,
  CompetitionsTabData,
  MyCompetitionItem,
  PastSeasonItem,
} from '@/src/lib/domain/competitions-tab';
import { daysAgo, daysFromNow, hoursAgo, onTheHour } from './relativeTime';

// Aba Competições do Lucas (docs/NAVIGATION.md §6) em cada situação da 9.2.
// Os nomes são os do cenário de `src/mocks/domain/` (Ranking Arena RM, Copa
// Sunset). As datas são relativas ao carregamento, para os itens não
// envelhecerem com o calendário.

const competitions: MyCompetitionItem[] = [
  {
    kind: 'tournament',
    enrollment_id: 'enr-copa-sunset',
    competition_name: 'Copa Sunset de Beach Tennis',
    category_name: 'Masculino B',
    partner_name: 'Rafael',
    href: '/competicoes/copa-sunset',
    starts_on: onTheHour(daysFromNow(3)),
    ends_on: onTheHour(daysFromNow(4)),
    next_match: { starts_at: onTheHour(daysFromNow(3)), court: 'Quadra 3' },
  },
  {
    kind: 'ranking',
    enrollment_id: 'enr-rm-masculino-b',
    competition_name: 'Ranking Arena RM',
    category_name: 'Masculino B',
    partner_name: 'Rafael',
    href: '/ranking/masculino-b',
    enrolled_at: daysAgo(60),
    position: 3,
    delta: { direction: 'up', value: 2 },
  },
  {
    kind: 'tournament',
    enrollment_id: 'enr-open-pampulha',
    competition_name: 'Open Pampulha',
    category_name: 'Mista C 40+',
    partner_name: 'Ana',
    href: '/competicoes/open-pampulha',
    starts_on: onTheHour(daysFromNow(24)),
    ends_on: onTheHour(daysFromNow(25)),
    next_match: null,
  },
  {
    kind: 'ranking',
    enrollment_id: 'enr-rm-mista-c40',
    competition_name: 'Ranking Arena RM',
    category_name: 'Mista C 40+',
    partner_name: 'Ana',
    href: '/ranking/mista-c-40',
    enrolled_at: daysAgo(20),
    position: 8,
    delta: { direction: 'down', value: 1 },
  },
];

const adminPendings: AdminPendingItem[] = [
  {
    id: 'pend-contested',
    kind: 'contested',
    competition_name: 'Liga Vila',
    category_name: 'Masculino C',
    sides: 'Bruno e Caio x Diego e Felipe',
    since: daysAgo(2),
    href: '/competicoes/liga-vila/administrar',
  },
  {
    id: 'pend-not-played',
    kind: 'not_played',
    competition_name: 'Liga Vila',
    category_name: 'Feminino B',
    sides: 'Carla e Júlia x Marina e Paula',
    since: daysAgo(1),
    href: '/competicoes/liga-vila/administrar',
  },
  {
    id: 'pend-tournament',
    kind: 'tournament_no_result',
    competition_name: 'Desafio Vila',
    category_name: 'Masculino B',
    sides: 'Gustavo e Heitor x Igor e João',
    since: hoursAgo(5),
    href: '/competicoes/desafio-vila/administrar',
  },
];

const lastSeason: PastSeasonItem = {
  enrollment_id: 'enr-rm-masculino-b-2026-1',
  competition_name: 'Ranking Arena RM',
  category_name: 'Masculino B',
  season_name: '1º semestre de 2026',
  partner_name: 'Rafael',
  final_position: 4,
  href: '/ranking/masculino-b?temporada=2026-1',
};

/**
 * Situações da aba. Ex.: `<CompetitionsTab data={mockCompetitionsTab.admin} />`.
 * - `player`: inscrito em rankings e torneios, sem ser admin;
 * - `admin`: o mesmo, e admin com três pendências;
 * - `adminWithoutPendings`: admin sem nada esperando, o bloco some;
 * - `pastSeason`: sem inscrição ativa, com a temporada passada;
 * - `newPlayer`: nunca se inscreveu.
 */
export const mockCompetitionsTab = {
  player: { is_admin: false, admin_pendings: [], competitions, last_season: lastSeason },
  admin: { is_admin: true, admin_pendings: adminPendings, competitions, last_season: lastSeason },
  adminWithoutPendings: { is_admin: true, admin_pendings: [], competitions, last_season: lastSeason },
  pastSeason: { is_admin: false, admin_pendings: [], competitions: [], last_season: lastSeason },
  newPlayer: { is_admin: false, admin_pendings: [], competitions: [], last_season: null },
} satisfies Record<string, CompetitionsTabData>;
