import { STORY_AVATAR_URL } from "@/src/components/ui/Avatar/storyFixtures";
import type {
  RankingLine,
  RankingPlayer,
  RankingScreenContent,
  RankingScreenModel,
  SeasonHeader,
} from "@/src/lib/domain/ranking-screen";
import type { CompetitionCategory } from "@/src/types/domain";
import type { RankingScreenLinks } from "./RankingScreen";

// Modelos prontos da tela para as stories: os casos do mapa de estados
// (RANKING.md 8.4) sem depender das datas relativas dos mocks do domínio.

export const STORY_NOW = "2026-10-01T15:00:00Z";
export const STORY_VIEWER_ID = "p-viewer";

function player(id: string, name: string, withPhoto = false): RankingPlayer {
  const username = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ\s]/g, "");
  return { id, name, username, avatar_url: withPhoto ? STORY_AVATAR_URL : null };
}

const VIEWER = player(STORY_VIEWER_ID, "Gabriel Vilano", true);
const FIRST = ["Lucas", "Ana", "Caio", "Bia", "Davi", "Rita", "Igor", "Lia", "Hugo", "Nina", "Otto", "Zeca"];
const LAST = ["Silva", "Souza", "Reis", "Lima", "Melo", "Costa", "Alves", "Rocha", "Prado", "Dias", "Moura", "Nunes"];

/** 2 jogadores por linha; a linha `ownAt` tem o jogador logado. */
function pairFor(index: number, ownAt: number | null): RankingPlayer[] {
  const partner = player(`p-${index}-b`, `${FIRST[(index + 5) % 12]} ${LAST[(index + 7) % 12]}`);
  if (index === ownAt) return [VIEWER, partner];
  return [player(`p-${index}-a`, `${FIRST[index % 12]} ${LAST[index % 12]}`, index % 3 === 0), partner];
}

const DELTAS: (number | null)[] = [1, -1, null, 2, null, -2, null, 1, -1, null, 3, null, -1, null, 2, null, null, -3, 2, null];

interface TableOptions {
  count?: number;
  ownAt?: number | null; // índice da própria linha; null: não inscrito
  qualifiers?: number | null; // vagas da final; null: sem final
  withDelta?: boolean;
  afterCutoff?: boolean;
}

function line(index: number, options: Required<TableOptions>): RankingLine {
  const isOwn = index === options.ownAt;
  return {
    enrollment_id: `enr-${index}`,
    players: pairFor(index, options.ownAt),
    position: index + 1,
    points: 620 - index * 24,
    played: 6 - Math.floor(index / 6),
    wins: Math.max(0, 5 - Math.floor(index / 3)),
    delta: options.withDelta ? DELTAS[index % DELTAS.length] : null,
    status: "active",
    awaiting_admin: false,
    is_own: isOwn,
    cutoff_distance: null,
  };
}

export const STORY_HEADER: SeasonHeader = {
  season_name: "2º semestre de 2026",
  phase: "open",
  ends_on: "2026-12-15T15:00:00Z",
  current_round: { number: 3, total: 4, deadline: "2026-10-06T15:00:00Z" },
  final: { name: "Saideira", qualifiers: 8, cutoff_date: "2026-11-30T15:00:00Z" },
  all_qualify: false,
  previous_season_id: "season-anterior",
};

/** Tabela com linha de corte; a própria linha fora da zona mostra a distância da vaga. */
export function storyTable(options: TableOptions = {}): Extract<RankingScreenContent, { kind: "table" }> {
  const full: Required<TableOptions> = { count: 20, ownAt: 17, qualifiers: 8, withDelta: true, afterCutoff: false, ...options };
  const lines = Array.from({ length: full.count }, (_, index) => line(index, full));
  const cut = full.qualifiers ?? lines.length;
  const own = lines.find((candidate) => candidate.is_own);
  if (own && own.position > cut && !full.afterCutoff) {
    own.cutoff_distance = { points: lines[cut - 1].points - own.points, position: cut };
  }
  return {
    kind: "table",
    header: { ...STORY_HEADER, phase: full.afterCutoff ? "after_cutoff" : "open" },
    qualified: lines.slice(0, cut),
    outside: lines.slice(cut),
    divider: full.qualifiers
      ? { final_name: "Saideira", qualifiers: full.qualifiers, after_cutoff: full.afterCutoff, awaiting_admin: false }
      : null,
    has_tie: false,
    own_enrollment_id: own?.enrollment_id ?? null,
  };
}

export const STORY_CATEGORY: CompetitionCategory = {
  id: "cat-masculino-b",
  competition_id: "comp-ranking-bh",
  gender: "M",
  modality: "doubles",
  level_min: "B",
  level_max: "B",
  min_age: null,
};

export function storyModel(content: RankingScreenContent): RankingScreenModel {
  return {
    competition_id: "comp-ranking-bh",
    competition_name: "Ranking BH",
    category: STORY_CATEGORY,
    season_id: content.kind === "no_season" ? null : "season-atual",
    content,
  };
}

export const STORY_LINKS: RankingScreenLinks = {
  rules: "/competicoes/ranking-bh#pontuacao",
  previousSeason: "/ranking/masculino-b?temporada=2026-1",
};

export function storyUnranked(): Extract<RankingScreenContent, { kind: "unranked" }> {
  // Em ordem alfabética do nome exibido, como o domínio entrega (RK20)
  const players = [2, 0, 4, 1, 3]
    .map((index) => pairFor(index, 4))
    .sort((x, y) => x[0].name.localeCompare(y[0].name, "pt-BR"));
  return {
    kind: "unranked",
    header: { ...STORY_HEADER, current_round: { number: 1, total: 4, deadline: "2026-10-20T15:00:00Z" } },
    entries: players.map((pair, index) => ({ enrollment_id: `enr-${index}`, players: pair, is_own: pair[0].id === STORY_VIEWER_ID })),
  };
}
