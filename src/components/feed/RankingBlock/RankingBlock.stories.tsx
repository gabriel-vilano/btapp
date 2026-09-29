import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import type { RankingUpCard, Side } from "@/src/types/feed";
import { RankingBlock } from "./RankingBlock";
import {
  expectNoHorizontalOverflow,
  feedFrame,
  storyPartner,
  storyPlayer,
} from "../storyFixtures";

// A posição é da unidade competidora (R1): a dupla é o caso padrão.
const storyDoubles: Side = { format: "doubles", players: [storyPlayer, storyPartner] };

const movedUp: RankingUpCard = {
  id: "story-ranking-up",
  card_type: "ranking",
  created_at: new Date().toISOString(),
  competitor: storyDoubles,
  visibility: "public",
  ranking_name: "Ranking BH — Masculino B",
  position: 3,
  delta: 2,
  points: 520,
  movement: "up",
};

const meta = {
  title: "Feed/RankingBlock",
  component: RankingBlock,
  decorators: [feedFrame],
  args: { data: movedUp },
} satisfies Meta<typeof RankingBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MovedUp: Story = {};

export const MovedDown: Story = {
  args: {
    data: { ...movedUp, position: 7, points: 380, movement: "down", visibility: "private" },
  },
};

export const OnePosition: Story = {
  args: { data: { ...movedUp, delta: 1 } },
};

export const MilestoneLeader: Story = {
  args: {
    data: {
      ...movedUp,
      position: 1,
      delta: 1,
      points: 580,
      movement: "milestone",
      milestone: { type: "leader" },
    },
  },
};

export const MilestoneLeaderSingles: Story = {
  args: {
    data: {
      ...movedUp,
      competitor: { format: "singles", player: storyPlayer },
      ranking_name: "Ranking BH — Masculino B · Simples",
      position: 1,
      delta: 2,
      points: 580,
      movement: "milestone",
      milestone: { type: "leader" },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Assumiu a liderança")).toBeVisible();
  },
};

export const MilestoneTopN: Story = {
  args: {
    data: {
      ...movedUp,
      position: 8,
      delta: 3,
      movement: "milestone",
      milestone: { type: "top_n", n: 8 },
    },
  },
};

// Marco na 1ª rodada: sem foto anterior, não há delta (R46).
export const MilestoneFirstRound: Story = {
  args: {
    data: {
      ...movedUp,
      position: 1,
      delta: null,
      movement: "milestone",
      milestone: { type: "leader" },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText(/posiç/)).toBeNull();
  },
};

export const FinalQualification: Story = {
  args: {
    data: {
      id: movedUp.id,
      card_type: "ranking",
      created_at: movedUp.created_at,
      competitor: storyDoubles,
      visibility: "public",
      ranking_name: movedUp.ranking_name,
      position: 2,
      points: 640,
      movement: "final_qualification",
      final_name: "Saideira",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Saideira")).toBeVisible();
    await expect(canvas.queryByText(/posiç/)).toBeNull();
  },
};

export const LongRankingName: Story = {
  args: {
    data: {
      ...movedUp,
      ranking_name:
        "Ranking Metropolitano de Belo Horizonte — Masculino B 40+",
      points: 12480,
    },
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement);
  },
};
