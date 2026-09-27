import type { Decorator } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import type { Category, OrgInfo, PlayerInfo } from "@/src/types/feed";

// Dados fixos só para stories. Os mocks do feed (`src/mocks/feed.ts`)
// representam o cenário real; aqui ficam os casos de borda.

// O avatar fake mora em ui/ (o feed pode importar de ui/, o contrário não).
export { STORY_AVATAR_URL } from "@/src/components/ui/Avatar/storyFixtures";

export const storyPlayer: PlayerInfo = {
  id: "story-player-lucas",
  name: "Lucas Silva",
  username: "lucassilva",
  avatar_url: null,
  total_matches: 274,
};

export const storyPartner: PlayerInfo = {
  id: "story-player-rafael",
  name: "Rafael Costa",
  username: "rafaelcosta",
  avatar_url: null,
  total_matches: 310,
};

export const storyLongPlayer: PlayerInfo = {
  id: "story-player-long",
  name: "Maria Eduarda Albuquerque de Vasconcelos",
  username: "mariaeduardaalbuquerquedevasconcelos",
  avatar_url: null,
  total_matches: 1024,
};

export const storyOrg: OrgInfo = {
  id: "story-org-arena-rm",
  name: "Arena RM",
  username: "arenarm",
  avatar_url: null,
};

export const storyLongOrg: OrgInfo = {
  id: "story-org-long",
  name: "Arena Sunset Beach Club Belo Horizonte",
  username: "arenasunsetbeachclubbelohorizonte",
  avatar_url: null,
};

export const storyCategory: Category = {
  gender: "M",
  modality: "doubles",
  level_min: "B",
  level_max: "B",
  age_group: null,
};

export const STORY_LONG_COMPETITION_NAME =
  "Circuito Mineiro de Beach Tennis Open Internacional 2026 — Etapa Belo Horizonte";

/**
 * Falha a story se algum descendente vazar na horizontal do frame.
 * Cobre o bug de texto longo estourando o card.
 */
export async function expectNoHorizontalOverflow(canvasElement: HTMLElement) {
  const frame = canvasElement.querySelector<HTMLElement>(".sb-feed-frame");
  if (!frame) {
    throw new Error("Story sem .sb-feed-frame: use o decorator feedFrame");
  }
  await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
}

/** Envolve a story na largura útil do card no mobile base (361px). */
export const feedFrame: Decorator = (Story) => (
  <div className="sb-feed-frame">
    <Story />
  </div>
);
