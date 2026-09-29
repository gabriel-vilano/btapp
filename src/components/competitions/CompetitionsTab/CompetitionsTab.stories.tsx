import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { mockCompetitionsTab } from "@/src/mocks/competitionsTab";
import { CompetitionsTab } from "./CompetitionsTab";

// Tier 4: uma story por situação da aba (docs/NAVIGATION.md §6 e 9.2), para
// ver a composição inteira; o detalhe de cada peça está na story dela
const meta = {
  title: "Competitions/CompetitionsTab",
  component: CompetitionsTab,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Aba Competições: \"Pendências de admin\" (N30), quando há, e \"Minhas competições\" (N29), com os vazios da 9.2.",
      },
    },
  },
  args: { data: mockCompetitionsTab.player },
  argTypes: { data: { control: false } },
} satisfies Meta<typeof CompetitionsTab>;

export default meta;
type Story = StoryObj<typeof meta>;

// Rankings primeiro, da inscrição mais recente; depois torneios, do mais próximo
export const Player: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("region", { name: /Pendências de admin/ })).toBeNull();
    const list = within(canvas.getByRole("region", { name: "Minhas competições" }));
    const hrefs = list.getAllByRole("link").map((link) => link.getAttribute("href"));
    await expect(hrefs).toEqual([
      "/ranking/mista-c-40",
      "/ranking/masculino-b",
      "/competicoes/copa-sunset",
      "/competicoes/open-pampulha",
    ]);
  },
};

export const Admin: Story = {
  args: { data: mockCompetitionsTab.admin },
  play: async ({ canvas }) => {
    const block = canvas.getByRole("region", { name: "Pendências de admin 3" });
    const list = canvas.getByRole("region", { name: "Minhas competições" });
    // O bloco vem acima da lista (N30)
    await expect(block.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  },
};

// Admin sem nada esperando: o bloco some, a aba fica igual à do jogador
export const AdminWithoutPendings: Story = {
  args: { data: mockCompetitionsTab.adminWithoutPendings },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("region", { name: /Pendências de admin/ })).toBeNull();
  },
};

// Sem inscrição ativa: a última temporada, "Encerrada", e o caminho para o Explorar
export const PastSeason: Story = {
  args: { data: mockCompetitionsTab.pastSeason },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("com Rafael · Encerrada · 1º semestre de 2026")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Explorar competições" })).toHaveAttribute("href", "/explorar");
  },
};

export const NewPlayer: Story = {
  args: { data: mockCompetitionsTab.newPlayer },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Você ainda não está em nenhuma competição." })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Explorar competições" })).toHaveAttribute("href", "/explorar");
  },
};
