import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { RankingList, RankingRow } from "../RankingRow";
import { STORY_PLAYERS as P } from "../RankingRow/storyFixtures";
import { ZoneDivider } from "./ZoneDivider";

const meta = {
  title: "Ranking/ZoneDivider",
  component: ZoneDivider,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Linha de corte da final dentro da classificação. Critérios em `docs/RANKING.md` §9.2.",
      },
    },
  },
  // Entre a lista das vagas e a de fora delas, como na tela
  decorators: [
    (Story) => (
      <>
        <RankingList start={8}>
          <RankingRow position={8} players={[P.caio, P.davi]} points={402} matches={5} wins={3} />
        </RankingList>
        <Story />
        <RankingList start={9}>
          <RankingRow position={9} players={[P.ana, P.bia]} points={390} matches={5} wins={3} />
        </RankingList>
      </>
    ),
  ],
  args: { label: "Classificam para a Saideira · 8 vagas" },
} satisfies Meta<typeof ZoneDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BeforeCutoff: Story = {
  play: async ({ canvas }) => {
    const divider = canvas.getByRole("separator");
    await expect(divider).toHaveAccessibleName("Classificam para a Saideira · 8 vagas");
    await expect(divider).not.toHaveAttribute("tabindex");
    // O separador não conta como item: cada linha é contada uma vez
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
    await expect(canvas.getAllByRole("list")[1]).toHaveAttribute("start", "9");
  },
};

export const AfterCutoff: Story = {
  args: { label: "Classificados para a Saideira" },
};

export const TieAtCutoff: Story = {
  args: { detail: "Empate na última vaga: decisão do admin" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("separator")).toHaveAccessibleName(
      "Classificam para a Saideira · 8 vagas. Empate na última vaga: decisão do admin",
    );
  },
};

export const LongFinalName: Story = {
  args: {
    label: "Classificam para a Grande Final do Circuito Metropolitano de Beach Tennis · 16 vagas",
  },
  play: async ({ canvasElement }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
    await expect(canvasElement.querySelector("[role=separator]")).not.toBeNull();
  },
};
