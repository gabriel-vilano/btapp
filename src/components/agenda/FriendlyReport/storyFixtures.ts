import type { PickablePlayer } from "@/src/components/ui/SidePicker";
import type { FriendlyReportData } from "./friendlyReportData";

// Jogadores fictícios para as stories do registro de amistoso. O "agora" é
// fixo em UTC (a tela mostra o dia de Brasília), para a data padrão não mudar com o relógio.

/** Quinta, 1º/10, 9h em Brasília. */
export const FRIENDLY_STORY_NOW = "2026-10-01T12:00:00.000Z";

function player(id: string, name: string, isFriend = false): PickablePlayer {
  const username = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "");
  return { id, name, username, avatarUrl: null, isFriend };
}

/** Dados do registro do Lucas, amigo do Pedro, sem amistoso anterior. */
export function friendlyStoryData(overrides: Partial<FriendlyReportData> = {}): FriendlyReportData {
  return {
    viewer: player("story-lucas", "Lucas Silva"),
    players: [
      player("story-pedro", "Pedro Henrique", true),
      player("story-thiago", "Thiago Mendes"),
      player("story-andre", "André Lima"),
      player("story-caio", "Caio Ferreira"),
    ],
    lastFormat: null,
    ...overrides,
  };
}
