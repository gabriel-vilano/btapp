import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { RankingLoadError } from "../RankingLoadError";
import { RankingTableSkeleton } from "./RankingTableSkeleton";

const meta = {
  title: "Ranking/RankingTableSkeleton",
  component: RankingTableSkeleton,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Classificação carregando: 8 linhas no formato do RankingRow (RANKING.md 8.3). A story de erro mostra o que fica no lugar da tabela quando a carga falha.",
      },
    },
  },
} satisfies Meta<typeof RankingTableSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveAccessibleName("Carregando a classificação");
  },
};

// Erro: aviso e "Tentar de novo" no lugar da tabela (N24)
export const LoadError: Story = {
  render: () => <RankingLoadError onRetry={() => undefined} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent("Não foi possível carregar a classificação.");
    await expect(canvas.getByRole("button", { name: "Tentar de novo" })).toBeVisible();
  },
};
