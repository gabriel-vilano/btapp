// Competição e sua estrutura (docs/DOMAIN.md §1, "Competição").
// Os registros se ligam por id, como linhas de tabela: é o formato que o
// Supabase devolve e o que deixa os mocks checáveis por integridade.

/** O tipo aparece escrito na página da organização (EXPLORE.md, EX22). */
export type OrganizationKind = 'arena' | 'club' | 'federation' | 'group';

/** Arena, clube, federação ou grupo que promove competições. */
export interface Organization {
  id: string;
  name: string;
  username: string; // também é o slug da página: /organizacoes/[username]
  avatar_url: string | null;
  kind: OrganizationKind;
  city: string; // 'Belo Horizonte'
  // Um campo só, como a organização informou: link ('https://wa.me/…') ou
  // texto ('WhatsApp da recepção: (31) 90000-0000'). Quem decide se vira
  // botão é `readOrganizationContact`. Público para quem está logado (EXPLORE.md §7.1).
  contact: string | null;
}

/**
 * Como a partida se decide (R29):
 * - `one_set_of_8`: no 7/7 vai a 9; no 8/8, tie-break a 7.
 * - `one_set_of_6`: no 5/5 vai a 7; no 6/6, tie-break a 7.
 * - `two_sets_of_6_stb`: dois sets de 6; no 1 set a 1, super tiebreak.
 */
export type MatchFormat = 'one_set_of_8' | 'one_set_of_6' | 'two_sets_of_6_stb';

/**
 * Tabela de pontos do ranking (R9–R11, R36). Todos os valores ficam guardados
 * por ranking; o padrão está em `DEFAULT_SCORING_RULE`.
 * O W.O. duplo não tem campo: vale 0 e 0 sempre (R36).
 */
export interface ScoringRule {
  win: number;
  loss: number;
  per_game_won: number;
  per_game_lost: number; // negativo: o padrão é −2
  wo_winner: number;
  wo_absent: number;
  retirement_winner: number;
  retirement_retiree: number;
}

export const DEFAULT_SCORING_RULE: ScoringRule = {
  win: 100,
  loss: 50,
  per_game_won: 2,
  per_game_lost: -2,
  wo_winner: 100,
  wo_absent: 0,
  retirement_winner: 100,
  retirement_retiree: 50,
};

/** Prazo padrão para o adversário responder a um resultado lançado (R14). */
export const DEFAULT_RESPONSE_DEADLINE_HOURS = 48;

/**
 * Política de troca de parceiro (R17). O campo já existe no ranking porque a
 * regra varia na vida real, mas no MVP só "nova dupla do zero" funciona.
 */
export type PartnerChangePolicy = 'new_team';

interface CompetitionBase {
  id: string;
  organization_id: string;
  name: string;
}

/** Competição contínua, em temporadas → rodadas → sorteio (R7). */
export interface RankingCompetition extends CompetitionBase {
  type: 'ranking';
  match_format: MatchFormat; // um formato só no ranking (R29)
  response_deadline_hours: number;
  matches_per_round: number; // Rankin: 4; Vila: 2
  partner_change_policy: PartnerChangePolicy;
  scoring_rule: ScoringRule;
}

/**
 * Competição discreta, de 1 ou 2 dias. No MVP o app não gera a chave (R31):
 * os confrontos são cadastrados e o admin lança o resultado (R38).
 */
export interface TournamentCompetition extends CompetitionBase {
  type: 'tournament';
  default_match_format: MatchFormat; // a partida pode trocar (R29)
  starts_on: string; // ISO 8601
  ends_on: string; // ISO 8601; igual a starts_on no torneio de 1 dia
  venue: string;
}

export type Competition = RankingCompetition | TournamentCompetition;

export type CompetitionType = Competition['type'];

/** Final da temporada: um torneio comum, definido pela posição no corte (R27, R28). */
export interface SeasonFinal {
  name: string; // livre: "Saideira", "Finals"
  qualifiers: number; // quantos se classificam, por categoria
  cutoff_date: string; // ISO 8601
  tournament_id: string | null; // o torneio da final, quando já existe
}

/** Período de um ranking, em geral um semestre. Os pontos somam dentro dela (R8). */
export interface Season {
  id: string;
  ranking_id: string;
  name: string;
  starts_on: string; // ISO 8601
  ends_on: string; // ISO 8601
  final: SeasonFinal | null; // sem final, o marco Top N usa N = 10 (R47)
}

/**
 * Etapa da temporada, com prazo. Os confrontos saem do sorteio da rodada, que
 * cria as partidas (R7, R30). Uma categoria pode ter mais de um sorteio na
 * rodada: o desfazer (R51) e a categoria sorteada depois (docs/ROUND_DRAW.md,
 * SR14). A rodada fecha no prazo (R46).
 */
export interface Round {
  id: string;
  season_id: string;
  number: number; // começa em 1
  starts_at: string; // ISO 8601
  deadline: string; // ISO 8601
}

export type CategoryGender = 'M' | 'F' | 'mixed';

export type Modality = 'singles' | 'doubles';

/**
 * Divisão da competição por gênero + nível + idade, com a modalidade (R3, R4).
 * O nome ("Masculino B", "Mista C 40+") é derivado, não guardado.
 */
export interface CompetitionCategory {
  id: string;
  competition_id: string;
  gender: CategoryGender;
  modality: Modality;
  level_min: string; // igual a level_max quando não é faixa
  level_max: string;
  min_age: number | null; // 40 em "40+"; conta pelo ano de nascimento (R33)
}

/**
 * Jogador com permissões numa competição específica (R15): sortear, lançar o
 * resultado do torneio, arbitrar, decidir a partida não realizada e corrigir.
 * No MVP o papel é um só, então não há lista de permissões.
 */
export interface CompetitionAdmin {
  competition_id: string;
  player_id: string;
  granted_at: string; // ISO 8601
}
