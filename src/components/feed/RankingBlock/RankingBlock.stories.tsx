import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RankingBlock } from "./RankingBlock";
import {
  expectNoHorizontalOverflow,
  feedFrame,
  storyPlayer,
} from "../storyFixtures";

const meta = {
  title: "Feed/RankingBlock",
  component: RankingBlock,
  decorators: [feedFrame],
  args: {
    data: {
      id: "story-ranking-up",
      card_type: "ranking",
      created_at: new Date().toISOString(),
      player: storyPlayer,
      ranking_name: "Ranking BH — Masculino B",
      position: 3,
      delta: 2,
      points: 520,
      movement: "up",
    },
  },
} satisfies Meta<typeof RankingBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MovedUp: Story = {};

export const MovedDown: Story = {
  args: {
    data: { ...meta.args.data, position: 7, points: 380, movement: "down" },
  },
};

export const OnePosition: Story = {
  args: { data: { ...meta.args.data, delta: 1 } },
};

export const MilestoneLeader: Story = {
  args: {
    data: {
      ...meta.args.data,
      position: 1,
      delta: 1,
      points: 580,
      movement: "milestone",
      milestone: "leader",
    },
  },
};

export const MilestoneTop10: Story = {
  args: {
    data: {
      ...meta.args.data,
      position: 10,
      delta: 3,
      movement: "milestone",
      milestone: "top10",
    },
  },
};

export const MilestoneFinals: Story = {
  args: {
    data: {
      ...meta.args.data,
      position: 8,
      delta: 1,
      movement: "milestone",
      milestone: "finals",
    },
  },
};

export const LongRankingName: Story = {
  args: {
    data: {
      ...meta.args.data,
      ranking_name:
        "Ranking Metropolitano de Belo Horizonte — Masculino B 40+",
      points: 12480,
    },
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement);
  },
};
