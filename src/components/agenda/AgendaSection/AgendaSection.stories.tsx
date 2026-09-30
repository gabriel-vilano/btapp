import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { historyGroups, upcomingItems, yourTurnItems } from "../storyFixtures";
import { AgendaSection } from "./AgendaSection";

const meta = {
  title: "Agenda/AgendaSection",
  component: AgendaSection,
  parameters: { layout: "fullscreen" },
  args: {
    id: "sua-vez",
    title: "Sua vez",
    groups: [{ label: null, items: yourTurnItems }],
    emptyText: "Nada pendente",
  },
} satisfies Meta<typeof AgendaSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// Cada seção é um <section> com título h2 e uma lista (10.3).
export const WithItems: Story = {
  play: async ({ canvas }) => {
    const section = canvas.getByRole("region", { name: "Sua vez" });
    await expect(section).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
  },
};

// "Sua vez" vazia não some: vira a linha "Nada pendente" (N14).
export const YourTurnEmpty: Story = {
  args: { groups: [{ label: null, items: [] }] },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Sua vez" })).toBeVisible();
    await expect(canvas.getByText("Nada pendente")).toBeVisible();
  },
};

// As outras seções, vazias, somem.
export const EmptyHidden: Story = {
  args: { id: "proximos", title: "Próximos jogos", groups: [{ label: null, items: [] }], emptyText: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("heading")).toBeNull();
  },
};

export const Upcoming: Story = {
  args: { id: "proximos", title: "Próximos jogos", groups: [{ label: null, items: upcomingItems }], emptyText: undefined },
};

// O histórico agrupa por mês, com o mês como subtítulo.
export const HistoryByMonth: Story = {
  args: { id: "historico", title: "Histórico", groups: historyGroups, emptyText: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 3, name: "Setembro de 2026" })).toBeVisible();
    await expect(canvas.getAllByRole("list")).toHaveLength(2);
  },
};
