import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { mockAdminArea } from "@/src/mocks/adminArea";
import { AdminArea } from "./AdminArea";

// Tier 4: uma story por situação da área (NAV N31, RESULTS §5), para ver a
// composição inteira; o detalhe das peças do DS está na story de cada uma
const meta = {
  title: "Admin/AdminArea",
  component: AdminArea,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Área \"Administrar\" da competição: decisões pendentes, sorteio da rodada e partidas. Critérios em `docs/NAVIGATION.md`, N31, e `docs/RESULTS.md` §5.",
      },
    },
  },
  args: { data: mockAdminArea.withDecisions, now: new Date().toISOString() },
  argTypes: { data: { control: false }, now: { control: false } },
} satisfies Meta<typeof AdminArea>;

export default meta;
type Story = StoryObj<typeof meta>;

// Duas decisões, a mais antiga primeiro, e as partidas de duas rodadas
export const WithDecisions: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText(args.data.competition_name)).toBeVisible();
    const decisions = within(canvas.getByRole("region", { name: "Decisões pendentes 2" }));
    const items = decisions.getAllByRole("listitem");
    // A contestação espera há 2 dias, a partida não realizada há 1: a contestação vem antes
    await expect(items[0]).toHaveTextContent("Contestação para arbitrar");
    await expect(items[0]).toHaveTextContent("Masculino C · Rodada 4 · Bruno e Caio x Diego e Felipe");
    await expect(items[1]).toHaveTextContent("Partida não realizada");

    const matches = within(canvas.getByRole("region", { name: "Partidas da competição" }));
    const roundFour = within(matches.getByRole("list", { name: "Partidas da Rodada 4" }));
    await expect(roundFour.getByRole("link", { name: /Bruno e Caio x Diego e Felipe.*Em arbitragem/ })).toHaveAttribute(
      "href",
      "/jogos/match-liga-vila-mc-r4-1",
    );
    await expect(matches.getByText("Corrigido")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Lançar sorteio da rodada" })).toBeVisible();
  },
};

// Fila vazia: a seção fica, com a frase, para o admin saber que não há nada a decidir
export const WithoutDecisions: Story = {
  args: { data: mockAdminArea.withoutDecisions },
  play: async ({ canvas }) => {
    const decisions = within(canvas.getByRole("region", { name: "Decisões pendentes" }));
    await expect(decisions.getByText("Nenhuma decisão esperando você.")).toBeVisible();
    await expect(decisions.queryByRole("list")).toBeNull();
  },
};

// Temporada sem sorteio: sem rodada em andamento e sem partidas
export const BeforeFirstDraw: Story = {
  args: { data: mockAdminArea.beforeFirstDraw },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Primeira rodada ainda não sorteada")).toBeVisible();
    await expect(canvas.getByText("As partidas aparecem depois do primeiro sorteio.")).toBeVisible();
  },
};
