import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { STORY_PLAYERS as P, VIEWER } from "../RankingRow/storyFixtures";
import { PinnedStandingRow } from "./PinnedStandingRow";

const meta = {
  title: "Ranking/PinnedStandingRow",
  component: PinnedStandingRow,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Cópia fixa da própria linha quando ela sai da vista, no rodapé ou no topo (RK9). Fora da leitura de tela: a linha é lida só no lugar dela.",
      },
    },
  },
  args: {
    side: "bottom",
    row: {
      position: 9,
      players: [P.pedro, VIEWER],
      points: 390,
      matches: 5,
      wins: 3,
      delta: 2,
      isOwn: true,
      status: "active",
      awaitingAdmin: false,
      cutoffDistance: "Faltam 12 pts para o 8º",
    },
    onActivate: fn(),
  },
  argTypes: { row: { control: false }, side: { control: "inline-radio", options: ["top", "bottom"] } },
} satisfies Meta<typeof PinnedStandingRow>;

export default meta;
type Story = StoryObj<typeof meta>;

// A linha saiu por baixo: a cópia fica no rodapé, acima da tab bar
export const Bottom: Story = {
  play: async ({ args, canvasElement, userEvent }) => {
    const pinned = canvasElement.querySelector("[aria-hidden='true']") as HTMLElement;
    // Sem foco e fora da árvore de acessibilidade: o leitor lê a linha na tabela
    await expect(pinned.querySelector("a, button")).toBeNull();
    await expect(pinned).toHaveTextContent("Você e Pedro A.");
    await userEvent.click(pinned);
    await expect(args.onActivate).toHaveBeenCalledOnce();
  },
};

// A linha saiu por cima: a cópia fica no topo, abaixo do cabeçalho
export const Top: Story = {
  args: { side: "top" },
};
