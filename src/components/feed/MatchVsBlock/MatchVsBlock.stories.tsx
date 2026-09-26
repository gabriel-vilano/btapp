import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MatchVsBlock } from "./MatchVsBlock";
import {
  expectNoHorizontalOverflow,
  feedFrame,
  storyLongPlayer,
  storyPartner,
  storyPlayer,
} from "../storyFixtures";

const meta = {
  title: "Feed/MatchVsBlock",
  component: MatchVsBlock,
  decorators: [feedFrame],
  args: {
    sideA: { format: "singles", player: storyPlayer },
    sideB: { format: "singles", player: storyPartner },
  },
} satisfies Meta<typeof MatchVsBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Singles: Story = {};

export const Doubles: Story = {
  args: {
    sideA: { format: "doubles", players: [storyPlayer, storyPartner] },
    sideB: { format: "doubles", players: [storyPartner, storyPlayer] },
  },
};

// Primeiro nome sem espaço para quebrar: pior caso para a coluna do grid.
const longFirstName = {
  ...storyLongPlayer,
  id: "story-player-long-first-name",
  name: "Maximiliano-Alexandre Vasconcelos",
};

export const LongNames: Story = {
  args: {
    sideA: { format: "doubles", players: [longFirstName, storyLongPlayer] },
    sideB: { format: "singles", player: longFirstName },
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement);
  },
};
