import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { List } from "@/src/components/ui/ListItem";
import { StandingSummaryItem } from "@/src/components/ui/StandingSummaryItem";
import { TournamentSummaryItem } from "./TournamentSummaryItem";

// Datas fixas (sábado, 10 de outubro de 2026, em Brasília): o texto da linha é o que se testa
const meta = {
  title: "Competitions/TournamentSummaryItem",
  component: TournamentSummaryItem,
  // Linha de ponta a ponta, como no app: a margem lateral é do próprio item
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Inscrição num torneio em \"Minhas competições\": a data do evento ou, quando já há confronto, o próximo jogo. Critérios em `docs/NAVIGATION.md`, N29.",
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
  args: {
    competitionName: "Copa Tucum de Beach Tennis",
    categoryName: "Masculino B",
    partnerName: "Rafael",
    startsOn: "2026-10-10T11:00:00.000Z",
    endsOn: "2026-10-11T21:00:00.000Z",
    href: "/competicoes/copa-tucum",
  },
  argTypes: {
    nextMatch: { control: "object" },
  },
} satisfies Meta<typeof TournamentSummaryItem>;

export default meta;
type Story = StoryObj<typeof meta>;

// Antes do sorteio da chave: a data do evento
export const EventDates: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", {
      name: "Copa Tucum de Beach Tennis · Masculino B com Rafael · 10 e 11 de outubro",
    });
    await expect(link).toHaveAttribute("href", "/competicoes/copa-tucum");
  },
};

export const OneDay: Story = {
  args: { endsOn: "2026-10-10T21:00:00.000Z" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("com Rafael · Sáb, 10 de outubro")).toBeVisible();
  },
};

// Com confronto definido, o próximo jogo toma o lugar da data do evento
export const NextMatch: Story = {
  args: { nextMatch: { startsAt: "2026-10-10T12:00:00.000Z", court: "Quadra 3" } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("com Rafael · Sáb, 9h · Quadra 3")).toBeVisible();
  },
};

export const NextMatchWithoutCourt: Story = {
  args: { nextMatch: { startsAt: "2026-10-10T12:30:00.000Z", court: null } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("com Rafael · Sáb, 9h30")).toBeVisible();
  },
};

// Simples: sem parceiro, a linha de apoio fica só com a data
export const Singles: Story = {
  args: { partnerName: undefined, categoryName: "Simples Masculino A" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("10 e 11 de outubro")).toBeVisible();
  },
};

// Nome longo quebra linha em vez de cortar
export const LongName: Story = {
  args: {
    competitionName: "Circuito Metropolitano de Beach Tennis da Grande Belo Horizonte",
    categoryName: "Mista C 40+",
    partnerName: "Maria Eduarda Albuquerque",
    nextMatch: { startsAt: "2026-10-10T12:00:00.000Z", court: "Quadra Central Coberta" },
  },
};

export const Pressable: Story = {
  args: { href: undefined, onClick: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /^Copa Tucum/ }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

// Galeria: ao lado do StandingSummaryItem, como na lista "Minhas competições".
// Os títulos das duas linhas começam na mesma coluna.
export const WithStandings: Story = {
  parameters: { ownList: true },
  render: (args) => (
    <List aria-label="Minhas competições">
      <StandingSummaryItem
        position={3}
        competitionName="Ranking Arena Mangaba"
        categoryName="Masculino B"
        partnerName="Rafael"
        delta={{ direction: "up", value: 2 }}
        href="/ranking/masculino-b"
      />
      <TournamentSummaryItem {...args} nextMatch={{ startsAt: "2026-10-10T12:00:00.000Z", court: "Quadra 3" }} />
      <TournamentSummaryItem
        {...args}
        competitionName="Open Umbu"
        categoryName="Mista C 40+"
        partnerName="Ana"
        startsOn="2026-10-31T11:00:00.000Z"
        endsOn="2026-11-01T21:00:00.000Z"
        href="/competicoes/open-umbu"
      />
    </List>
  ),
  play: async ({ canvas }) => {
    const [ranking, tournament] = canvas.getAllByRole("link");
    const titleLeft = (link: HTMLElement) =>
      (link.querySelector("span:nth-child(2)") as HTMLElement).getBoundingClientRect().left;
    await expect(titleLeft(tournament)).toBe(titleLeft(ranking));
  },
};
