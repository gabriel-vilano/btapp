import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import type { AdminPendingItem } from "@/src/lib/domain/competitions-tab";
import { AdminPendingBlock } from "./AdminPendingBlock";

const contested: AdminPendingItem = {
  id: "pend-contested",
  kind: "contested",
  competition_name: "Liga Vila",
  category_name: "Masculino C",
  sides: "Bruno e Caio x Diego e Felipe",
  since: "2026-09-27T12:00:00.000Z",
  href: "/competicoes/liga-vila/administrar",
};

const notPlayed: AdminPendingItem = {
  id: "pend-not-played",
  kind: "not_played",
  competition_name: "Liga Vila",
  category_name: "Feminino B",
  sides: "Carla e Júlia x Marina e Paula",
  since: "2026-09-28T12:00:00.000Z",
  href: "/competicoes/liga-vila/administrar",
};

const tournamentNoResult: AdminPendingItem = {
  id: "pend-tournament",
  kind: "tournament_no_result",
  competition_name: "Desafio Vila",
  category_name: "Masculino B",
  sides: "Gustavo e Heitor x Igor e João",
  since: "2026-09-29T12:00:00.000Z",
  href: "/competicoes/desafio-vila/administrar",
};

const meta = {
  title: "Competitions/AdminPendingBlock",
  component: AdminPendingBlock,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Bloco \"Pendências de admin\" do topo da aba Competições: o que espera o admin, com a competição. Critérios em `docs/NAVIGATION.md`, N30.",
      },
    },
  },
  args: { pendings: [contested, notPlayed, tournamentNoResult] },
  argTypes: { pendings: { control: false } },
} satisfies Meta<typeof AdminPendingBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

// Os três tipos de pendência, cada um com o próprio ícone e rótulo
export const AllKinds: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Pendências de admin 3" })).toBeVisible();
    const link = canvas.getByRole("link", {
      name: "Contestação para arbitrar Liga Vila · Masculino C · Bruno e Caio x Diego e Felipe",
    });
    await expect(link).toHaveAttribute("href", "/competicoes/liga-vila/administrar");
    await expect(canvas.getByRole("link", { name: /^Partida não realizada/ })).toBeVisible();
    await expect(canvas.getByRole("link", { name: /^Confronto sem resultado/ })).toBeVisible();
  },
};

export const Single: Story = {
  args: { pendings: [notPlayed] },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Pendências de admin 1" })).toBeVisible();
  },
};

// Sem pendência, o bloco some: nada é renderizado
export const Empty: Story = {
  args: { pendings: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("section")).toBeNull();
  },
};

export const LongNames: Story = {
  args: {
    pendings: [
      {
        ...contested,
        competition_name: "Circuito Metropolitano de Beach Tennis da Grande Belo Horizonte",
        category_name: "Mista C 40+",
        sides: "Maria Eduarda Albuquerque e João Pedro Vasconcelos x Ana Carolina Figueiredo e Luiz Henrique Siqueira",
      },
    ],
  },
};
