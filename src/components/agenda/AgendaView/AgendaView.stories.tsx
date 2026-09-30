import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { agendaViewModel } from "@/src/lib/agenda/agendaViewModel";
import { mockDomain, mockEntities } from "@/src/mocks/domain";
import { historyGroups, upcomingItems, waitingItems, yourTurnItems } from "../storyFixtures";
import { AgendaError } from "./AgendaError";
import { AgendaHeader } from "./AgendaHeader";
import { AgendaSkeleton } from "./AgendaSkeleton";
import { AgendaView } from "./AgendaView";

// Galeria da aba Jogos (Tier 4): a tela inteira em cada estado das seções 5
// e 9 da docs/NAVIGATION.md, com o cabeçalho, como no app.

const meta = {
  title: "Agenda/AgendaView",
  component: AgendaView,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <main>
        <AgendaHeader />
        <Story />
      </main>
    ),
  ],
  args: {
    yourTurn: yourTurnItems,
    upcoming: upcomingItems,
    waiting: waitingItems,
    history: historyGroups,
    empty: null,
  },
} satisfies Meta<typeof AgendaView>;

export default meta;
type Story = StoryObj<typeof meta>;

// As 4 seções na ordem da N12.
export const Full: Story = {
  play: async ({ canvas }) => {
    const titles = canvas.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    await expect(titles).toEqual(["Sua vez", "Próximos jogos", "Aguardando", "Histórico"]);
  },
};

// A agenda do Lucas montada do mockDomain, como a página /jogos faz.
export const FromMocks: Story = {
  args: agendaViewModel(mockDomain, { playerId: mockEntities.players.lucas.id, now: new Date().toISOString() }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Propor horários" })).toBeVisible();
  },
};

// "Sua vez" vazia vira "Nada pendente"; as outras seções vazias somem (N14).
export const NothingPending: Story = {
  args: { yourTurn: [], waiting: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Nada pendente")).toBeVisible();
    await expect(canvas.queryByRole("heading", { name: "Aguardando" })).toBeNull();
  },
};

export const NewPlayer: Story = {
  args: { yourTurn: [], upcoming: [], waiting: [], history: [], empty: { kind: "new_player" } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Você ainda não está em nenhum ranking." })).toBeVisible();
    await expect(canvas.queryByRole("heading", { name: "Histórico" })).toBeNull();
  },
};

export const BetweenRounds: Story = {
  args: {
    yourTurn: [],
    upcoming: [],
    waiting: [],
    empty: { kind: "between_rounds", competitionName: "Ranking Arena RM 2026" },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/A próxima rodada de Ranking Arena RM 2026/)).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Histórico" })).toBeVisible();
  },
};

// A posição final leva à classificação da temporada.
export const SeasonEnded: Story = {
  args: {
    yourTurn: [],
    upcoming: [],
    waiting: [],
    empty: {
      kind: "season_ended",
      position: 3,
      competitionName: "Ranking Arena RM 2026",
      categoryName: "Masculino B",
      href: "/ranking/cat-arena-rm-masculino-b?temporada=season-arena-rm-2026-2",
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "3º lugar em Ranking Arena RM 2026 · Masculino B" })).toBeVisible();
  },
};

// Sem inscrição, com histórico: só o Histórico, com "Nada pendente" no topo.
export const NoEnrollment: Story = {
  args: { yourTurn: [], upcoming: [], waiting: [], empty: { kind: "no_enrollment" } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Nada pendente")).toBeVisible();
  },
};

// Carregando: esqueleto com o formato das seções, sem spinner (N23).
export const Loading: Story = {
  render: () => <AgendaSkeleton />,
};

// Erro: no lugar do conteúdo, com "Tentar de novo" (N24).
export const LoadError: Story = {
  render: () => <AgendaError onRetry={fn()} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Tentar de novo" })).toBeVisible();
  },
};
