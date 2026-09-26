import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { CardHeader } from "./CardHeader";
import {
  STORY_AVATAR_URL,
  STORY_LONG_COMPETITION_NAME,
  expectNoHorizontalOverflow,
  feedFrame,
  storyCategory,
  storyLongOrg,
  storyLongPlayer,
  storyOrg,
  storyPlayer,
} from "../storyFixtures";

const meta = {
  title: "Feed/CardHeader",
  component: CardHeader,
  decorators: [feedFrame],
  args: {
    createdAt: new Date(Date.now() - 2 * 3_600_000).toISOString(),
    data: {
      header_type: "org",
      org: storyOrg,
      phase: "Rodada 3",
      competition_name: "Copa Nubeach de Beach Tennis",
      category: storyCategory,
    },
  },
} satisfies Meta<typeof CardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Org: Story = {};

export const Player: Story = {
  args: {
    data: {
      header_type: "player",
      player: storyPlayer,
      action_text: "Lucas se inscreveu em um torneio",
    },
  },
};

export const WithPhotos: Story = {
  args: {
    data: {
      header_type: "org",
      org: { ...storyOrg, avatar_url: STORY_AVATAR_URL },
      phase: "Final",
      competition_name: "Copa Nubeach de Beach Tennis",
      category: storyCategory,
    },
  },
};

// Card de amizade: aperto de mão no lugar do avatar.
export const Handshake: Story = {
  args: {
    showHandshake: true,
    data: {
      header_type: "player",
      player: storyPlayer,
      action_text: "Lucas Silva e Rafael Costa agora são amigos",
    },
  },
};

export const LongCompetitionName: Story = {
  args: {
    data: {
      header_type: "org",
      org: storyLongOrg,
      phase: "Quartas de final",
      competition_name: STORY_LONG_COMPETITION_NAME,
      category: storyCategory,
    },
  },
  play: async ({ canvas, canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement);
    // Truncado numa linha só: o texto é maior que a caixa visível.
    const name = canvas.getByText(STORY_LONG_COMPETITION_NAME, { exact: false });
    await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
  },
};

export const LongPlayerName: Story = {
  args: {
    data: {
      header_type: "player",
      player: storyLongPlayer,
      action_text:
        "Maria Eduarda Albuquerque de Vasconcelos se inscreveu no Circuito Mineiro de Beach Tennis",
    },
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement);
  },
};
