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

// Desistência: placar real, com o set interrompido rotulado (FEED_CARDS.md §4.4).
// Exemplo da R11: o desistente venceu o 1º set e desistiu perdendo o 2º por 2/3.
export const RetiredInSecondSet: Story = {
  args: {
    score: {
      type: "retired",
      completed_sets: [{ a: 4, b: 6 }],
      interrupted_set: { a: 3, b: 2 },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent("Interrompido");
    await expect(canvasElement.textContent).not.toMatch(/[-–—]/);
  },
};

export const RetiredInFirstSet: Story = {
  args: {
    score: { type: "retired", completed_sets: [], interrupted_set: { a: 3, b: 2 } },
  },
};

export const RetiredInSuperTiebreak: Story = {
  args: {
    score: {
      type: "retired",
      completed_sets: [{ a: 6, b: 4 }, { a: 3, b: 6 }],
      interrupted_set: { a: 5, b: 3 },
    },
  },
};

// O set seguinte não começou: nenhuma coluna para ele.
export const RetiredBetweenSets: Story = {
  args: {
    score: { type: "retired", completed_sets: [{ a: 6, b: 4 }], interrupted_set: { a: 0, b: 0 } },
  },
};

// Nenhum game jogado: mesma estrutura do W.O. (§4.4).
export const RetiredBeforeFirstGame: Story = {
  args: { score: { type: "retired", completed_sets: [], interrupted_set: { a: 0, b: 0 } } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent("Vitória por desistência");
    await expect(canvasElement.textContent).not.toMatch(/\d/);
  },
};
