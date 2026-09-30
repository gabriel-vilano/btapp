import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import type { AgendaItemModel, AgendaItemPerson } from "@/src/lib/agenda/agendaItemModel";
import { PendingBlock } from "./PendingBlock";

// Uma pendência de cada tipo de "Sua vez" (5.2), com os textos como a agenda
// os monta (src/lib/agenda/). Nomes fictícios.

const RANKING = "Ranking Praia Norte 2026 · Masculino B · Rodada 3";

function person(id: string, name: string): AgendaItemPerson {
  return { id, name, avatarUrl: null };
}

const lucas = person("p-lucas", "Lucas Silva");
const rafael = person("p-rafael", "Rafael Costa");

function pending(id: string, opponents: [string, string], situation: string, label: string): AgendaItemModel {
  const href = `/jogos/${id}`;
  return {
    matchId: id,
    ownSide: [lucas, rafael],
    opponentSide: opponents.map((name, index) => person(`${id}-${index}`, name)),
    context: RANKING,
    situation,
    badge: null,
    href,
    action: { label, href },
  };
}

const PENDING_ITEMS: AgendaItemModel[] = [
  pending("m-1", ["Caio Ferreira", "Diego Martins"], "Responder proposta · responda em 31h", "Responder proposta"),
  pending("m-2", ["Pedro Henrique", "Thiago Mendes"], "Marcar jogo · rodada fecha em 5 dias", "Propor horários"),
  pending("m-3", ["Bruno Alves", "André Lima"], "Lançar resultado · jogo de ontem", "Lançar resultado"),
  pending("m-4", ["Gustavo Rocha", "Felipe Nunes"], "Confirmar resultado · confirma sozinho em 2 dias", "Confirmar"),
  pending("m-5", ["Marcos Dias", "Vitor Souza"], "Confirmar amistoso", "Confirmar"),
];

const meta = {
  title: "Feed/PendingBlock",
  component: PendingBlock,
  // Bloco de ponta a ponta no topo do feed: a margem lateral é de cada item
  parameters: { layout: "fullscreen" },
  args: { items: PENDING_ITEMS.slice(0, 1), total: 1 },
} satisfies Meta<typeof PendingBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sem pendência, o bloco não aparece (N20): nem título, nem lista.
export const Empty: Story = {
  args: { items: [], total: 0 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("section")).toBeNull();
  },
};

// Uma pendência: o item com o botão da ação, sem "Ver todas".
export const OneItem: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Sua vez" })).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(1);
    await expect(canvas.getByRole("link", { name: "Responder proposta" })).toHaveAttribute("href", "/jogos/m-1");
    await expect(canvas.queryByRole("link", { name: /^Ver todas/ })).toBeNull();
  },
};

// Três pendências cabem inteiras: ainda sem "Ver todas".
export const ThreeItems: Story = {
  args: { items: PENDING_ITEMS.slice(0, 3), total: 3 },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    await expect(canvas.queryByRole("link", { name: /^Ver todas/ })).toBeNull();
  },
};

// Mais de três: mostra as três primeiras e leva o resto para a aba Jogos.
export const Several: Story = {
  args: { items: PENDING_ITEMS.slice(0, 3), total: PENDING_ITEMS.length },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    const seeAll = canvas.getByRole("link", { name: "Ver todas em Jogos (5)" });
    await expect(seeAll).toHaveAttribute("href", "/jogos");
  },
};
