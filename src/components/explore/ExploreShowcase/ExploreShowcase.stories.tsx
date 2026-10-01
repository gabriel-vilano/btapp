import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { mockExploreShowcase } from "@/src/mocks/explorePage";
import { ExploreShowcase } from "./ExploreShowcase";

// Tier 4: a vitrine com os mocks do Explorar e os vazios da EX13; o detalhe
// do item está na story do CompetitionListItem
const showcase = mockExploreShowcase(new Date().toISOString());
const betweenSeasonsOnly = showcase.competitions.filter((item) => item.situation === "Entre temporadas");

const meta = {
  title: "Explore/ExploreShowcase",
  component: ExploreShowcase,
  // O cabeçalho é da página: a story mostra o AppHeader para a tela aparecer inteira
  decorators: [
    (Story) => (
      <>
        <AppHeader title="Explorar" />
        <Story />
      </>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Vitrine do Explorar, sem termo digitado: competições (EX8) e arenas (EX11). Critérios em `docs/EXPLORE.md` §3.",
      },
    },
  },
  args: { showcase },
  argTypes: { showcase: { control: false } },
} satisfies Meta<typeof ExploreShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

// O Lucas participa do Ranking Arena Mangaba e da Copa Tucum (EX9)
export const Default: Story = {
  play: async ({ canvas }) => {
    const competitions = within(await canvas.findByRole("region", { name: "Competições" }));
    await expect(competitions.getAllByRole("link")).toHaveLength(5);
    await expect(competitions.getAllByText("Você participa")).toHaveLength(2);
    const arenas = within(canvas.getByRole("region", { name: "Arenas" }));
    await expect(arenas.getByRole("link", { name: /^Arena Jenipapo/ })).toHaveAttribute("href", "/organizacoes/arenajenipapo");
    await expect(arenas.getByText("Sete Lagoas · Nenhuma competição aberta")).toBeVisible();
  },
};

// Sem competição aberta: a frase, e os rankings entre temporadas abaixo dela (EX13)
export const NoOpenCompetition: Story = {
  args: { showcase: { ...showcase, competitions: betweenSeasonsOnly, hasOpenCompetition: false } },
  play: async ({ canvas }) => {
    const competitions = within(await canvas.findByRole("region", { name: "Competições" }));
    await expect(competitions.getByText("Nenhuma competição aberta agora.")).toBeVisible();
    await expect(competitions.getByText("Entre temporadas")).toBeVisible();
  },
};

// Sem organização do tipo arena, a seção some (EX13)
export const NoArenas: Story = {
  args: { showcase: { ...showcase, arenas: [] } },
  play: async ({ canvas }) => {
    await canvas.findByRole("region", { name: "Competições" });
    await expect(canvas.queryByRole("region", { name: "Arenas" })).toBeNull();
  },
};

// As duas vazias: só em desenvolvimento (EX13)
export const Empty: Story = {
  args: { showcase: { competitions: [], hasOpenCompetition: false, arenas: [] } },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Ainda não há competições no LetzPlay." })).toBeVisible();
  },
};
