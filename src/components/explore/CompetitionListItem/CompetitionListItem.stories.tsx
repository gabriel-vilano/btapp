import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { List } from "@/src/components/ui/ListItem";
import { CompetitionListItem, type CompetitionListItemProps } from "./CompetitionListItem";

// Textos fixos, como a vitrine os recebe prontos de `exploreShowcase`: a
// situação de cada caso é a que as funções do Explorar escrevem (EX10)
const runningRanking: CompetitionListItemProps = {
  name: "Ranking Arena Mangaba",
  typeLabel: "Ranking",
  organizationName: "Arena Mangaba",
  organizationAvatarUrl: null,
  city: "Belo Horizonte",
  situation: "Rodada 3 de 4",
  participating: false,
  href: "/competicoes/ranking-arena-mangaba",
};

const rankingBetweenSeasons: CompetitionListItemProps = {
  ...runningRanking,
  name: "Ranking Clube Cajuí",
  organizationName: "Clube Cajuí",
  situation: "Entre temporadas",
  href: "/competicoes/ranking-clube-cajui",
};

const upcomingTournament: CompetitionListItemProps = {
  name: "Desafio Saque Curto",
  typeLabel: "Torneio",
  organizationName: "Grupo Saque Curto",
  organizationAvatarUrl: null,
  city: "Belo Horizonte",
  situation: "20 e 21 de outubro · Arena Mangaba · Belo Horizonte/MG",
  participating: false,
  href: "/competicoes/desafio-saque-curto",
};

const pastTournament: CompetitionListItemProps = {
  ...upcomingTournament,
  name: "Torneio de Inverno Jenipapo",
  organizationName: "Arena Jenipapo",
  city: "Sete Lagoas",
  situation: "Encerrado",
  href: "/competicoes/torneio-inverno-jenipapo",
};

const meta = {
  title: "Explore/CompetitionListItem",
  component: CompetitionListItem,
  // Linha de ponta a ponta, como no app: a margem lateral é do próprio item
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Competição na vitrine do Explorar, na busca e na página da organização. Critérios em `docs/EXPLORE.md`, EX10.",
      },
    },
  },
  decorators: [
    (Story, { parameters }) =>
      parameters.ownList ? (
        <Story />
      ) : (
        <List>
          <Story />
        </List>
      ),
  ],
  args: runningRanking,
} satisfies Meta<typeof CompetitionListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RunningRanking: Story = {
  play: async ({ canvas }) => {
    const link = await canvas.findByRole("link", { name: /^Ranking Arena Mangaba/ });
    await expect(link).toHaveAttribute("href", "/competicoes/ranking-arena-mangaba");
    await expect(canvas.getByText("Ranking · Arena Mangaba · Belo Horizonte")).toBeVisible();
    await expect(canvas.getByText("Rodada 3 de 4")).toBeVisible();
    await expect(canvas.queryByText("Você participa")).toBeNull();
  },
};

export const RankingBetweenSeasons: Story = {
  args: rankingBetweenSeasons,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Entre temporadas")).toBeVisible();
  },
};

export const UpcomingTournament: Story = {
  args: upcomingTournament,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Torneio · Grupo Saque Curto · Belo Horizonte")).toBeVisible();
  },
};

export const PastTournament: Story = {
  args: pastTournament,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Encerrado")).toBeVisible();
  },
};

// Inscrição ativa do jogador (EX9): a competição fica no mesmo lugar, com o selo
export const Participating: Story = {
  args: { participating: true },
  play: async ({ canvas }) => {
    const link = await canvas.findByRole("link", { name: /Você participa$/ });
    await expect(link).toHaveAttribute("href", "/competicoes/ranking-arena-mangaba");
  },
};

// Nomes longos quebram a linha em vez de empurrar o selo para fora da tela
export const LongNames: Story = {
  args: {
    name: "Etapa Vale Azul do Circuito Mineiro de Beach Tennis",
    typeLabel: "Torneio",
    organizationName: "Federação Vale Azul de Beach Tennis",
    situation: "Sáb, 9 de novembro · Arena Tucum · Carandaí/MG",
    participating: true,
  },
};

// Galeria: os casos da EX10 lado a lado, na ordem da vitrine (EX8)
export const Gallery: Story = {
  parameters: { ownList: true },
  render: () => (
    <List>
      <CompetitionListItem {...upcomingTournament} />
      <CompetitionListItem {...runningRanking} participating />
      <CompetitionListItem {...rankingBetweenSeasons} />
      <CompetitionListItem {...pastTournament} />
    </List>
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findAllByRole("link")).toHaveLength(4);
  },
};
