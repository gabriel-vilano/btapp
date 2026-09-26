import type { Decorator } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import type { Category, OrgInfo, PlayerInfo } from "@/src/types/feed";

// Dados fixos só para stories. Os mocks do feed (`src/mocks/feed.ts`)
// representam o cenário real; aqui ficam os casos de borda.

// Avatar inline (SVG em data URI): a story não depende de rede nem do Storage.
export const STORY_AVATAR_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#ffa78a"/><circle cx="20" cy="16" r="7" fill="#5e1d08"/><rect x="8" y="26" width="24" height="14" rx="7" fill="#5e1d08"/></svg>',
  );

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
