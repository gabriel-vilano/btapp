import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { RecordLine } from "./RecordLine";

const meta = {
  title: "Profile/RecordLine",
  component: RecordLine,
  parameters: {
    docs: { description: { component: "O cartel do jogador em uma linha: vitórias e derrotas, sem W.O." } },
  },
  args: { wins: 182, losses: 92 },
} satisfies Meta<typeof RecordLine>;

export default meta;
type Story = StoryObj<typeof meta>;

// Lido como uma frase: "182 vitórias e 92 derrotas".
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("182 vitórias e 92 derrotas")).toBeInTheDocument();
  },
};

// Jogador novo: a linha vira o texto de vazio, em cinza.
export const Empty: Story = {
  args: { wins: 0, losses: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Nenhuma partida ainda")).toBeVisible();
  },
};

// Só vitórias: a derrota aparece zerada, no plural.
export const OnlyWins: Story = {
  args: { wins: 7, losses: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("7 vitórias e 0 derrotas")).toBeInTheDocument();
  },
};

export const Singular: Story = {
  args: { wins: 1, losses: 1 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("1 vitória e 1 derrota")).toBeInTheDocument();
  },
};

// Números grandes: milhar com ponto.
export const LargeNumbers: Story = {
  args: { wins: 1204, losses: 987 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("1.204 vitórias e 987 derrotas")).toBeInTheDocument();
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="sb-stack">
      <RecordLine wins={182} losses={92} />
      <RecordLine wins={0} losses={0} />
      <RecordLine wins={7} losses={0} />
      <RecordLine wins={1} losses={1} />
      <RecordLine wins={1204} losses={987} />
    </div>
  ),
};
