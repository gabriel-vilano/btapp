import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ScoreBlock } from "./ScoreBlock";
import { feedFrame } from "../storyFixtures";

const meta = {
  title: "Feed/ScoreBlock",
  component: ScoreBlock,
  decorators: [feedFrame],
  args: {
    score: { type: "normal", sets: [{ a: 6, b: 4 }] },
  },
} satisfies Meta<typeof ScoreBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneSet: Story = {};

export const TwoSets: Story = {
  args: {
    score: { type: "normal", sets: [{ a: 6, b: 4 }, { a: 6, b: 3 }] },
  },
};

export const ThreeSetsWithTiebreak: Story = {
  args: {
    score: {
      type: "normal",
      sets: [{ a: 6, b: 4 }, { a: 4, b: 6 }, { a: 10, b: 7 }],
    },
  },
};

// Sem jogo, sem placar: a área mostra só o rótulo (FEED_CARDS.md §4.3).
export const WalkOver: Story = {
  args: { score: { type: "wo" } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent("Vitória por W.O.");
    await expect(canvasElement.textContent).not.toMatch(/\d/);
  },
};

export const RetiredAfterOneSet: Story = {
  args: { score: { type: "retired", completed_sets: [{ a: 6, b: 2 }] } },
};

// Nenhum set completo: mesma estrutura do W.O. (§4.4).
export const RetiredBeforeFirstSet: Story = {
  args: { score: { type: "retired", completed_sets: [] } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent("Vitória por desistência");
    await expect(canvasElement.textContent).not.toMatch(/\d/);
  },
};
