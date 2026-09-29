import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { mockProfilePages } from "@/src/mocks/profilePage";
import { PlayerNotFound } from "./PlayerNotFound";
import { ProfilePage, ProfilePageSkeleton } from "./ProfilePage";

// Tier 4: uma story por situação do perfil (docs/PROFILE.md §6), sobre os
// mocks do domínio vistos pelo Lucas. O detalhe de cada peça está na story dela
const meta = {
  title: "Profile/ProfilePage",
  component: ProfilePage,
  parameters: {
    layout: "fullscreen",
    // "Tentar de novo" usa o router do App Router
    nextjs: { appDirectory: true },
    docs: {
      description: {
        component:
          "Perfil do jogador: cabeçalho, Vocês, Rankings, Partidas recentes e Temporadas, numa rolagem só (PF1).",
      },
    },
  },
  args: { data: mockProfilePages.own },
  argTypes: { data: { control: false } },
} satisfies Meta<typeof ProfilePage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Só os títulos das seções: o EmptyState de "Partidas recentes" também tem um h2
function sectionTitles(canvasElement: HTMLElement): string[] {
  return Array.from(canvasElement.querySelectorAll("section > h2"), (heading) => heading.textContent ?? "");
}

// Próprio perfil: engrenagem, "Editar perfil", "Melhor: 1º" e sem o bloco "Vocês" (PF3)
export const Own: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("link", { name: "Configurações" })).toHaveAttribute("href", "/perfil/configuracoes");
    await expect(canvas.getByRole("link", { name: "Editar perfil" })).toBeVisible();
    await expect(sectionTitles(canvasElement)).toEqual(["Rankings", "Partidas recentes", "Temporadas"]);
    await expect(canvas.getByText(/Melhor: 1º/)).toBeVisible();
    // "Ver todas" do próprio perfil é o Histórico da aba Jogos (PF18)
    await expect(canvas.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "/jogos#historico");
  },
};

// Amigo com H2H: "Vocês" vem antes de "Rankings" (PF1, PF17)
export const Friend: Story = {
  args: { data: mockProfilePages.friend },
  play: async ({ canvas, canvasElement }) => {
    await expect(sectionTitles(canvasElement)).toEqual(["Vocês", "Rankings", "Partidas recentes", "Temporadas"]);
    await expect(canvas.getByRole("link", { name: /Vocês se enfrentaram 3 vezes/ })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Amigos de Pedro, abrir opções" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Ver todas" })).toHaveAttribute(
      "href",
      "/jogadores/pedrohenrique/partidas",
    );
    await expect(canvas.getByText("Saideira")).toBeVisible();
  },
};

// Adversário sem amizade, com o confronto da rodada ainda sem data (PF16)
export const Opponent: Story = {
  args: { data: mockProfilePages.opponent },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /Próximo confronto · Rodada 3/ })).toBeVisible();
    await expect(canvas.getByText("Data a combinar")).toBeVisible();
    await expect(canvas.getByRole("button", { name: /Adicionar Caio/ })).toBeVisible();
  },
};

export const RequestSent: Story = {
  args: { data: mockProfilePages.requestSent },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Pedido enviado" })).toBeVisible();
  },
};

export const RequestReceived: Story = {
  args: { data: mockProfilePages.requestReceived },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Aceitar pedido de Thiago" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Recusar pedido de Thiago" })).toBeVisible();
  },
};

// Jogador novo visto por outro: só o cabeçalho e "Partidas recentes" vazia, sem CTA (§6.2)
export const NewPlayer: Story = {
  args: { data: mockProfilePages.newPlayer },
  play: async ({ canvas, canvasElement }) => {
    await expect(sectionTitles(canvasElement)).toEqual(["Partidas recentes"]);
    await expect(canvas.getByText("As partidas de Marina aparecem aqui.")).toBeVisible();
    await expect(canvas.queryByRole("link", { name: "Registrar amistoso" })).toBeNull();
  },
};

// O próprio perfil novo: "0 jogos" e o CTA "Registrar amistoso" (§6.2, N19)
export const OwnNew: Story = {
  args: { data: mockProfilePages.ownNew },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Suas partidas confirmadas aparecem aqui.")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Registrar amistoso" })).toHaveAttribute("href", "/jogos/amistoso");
  },
};

// Uma seção que falha mostra o erro só nela; o resto do perfil continua (PF22)
export const SectionError: Story = {
  args: { data: mockProfilePages.sectionError },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText("Não foi possível carregar.")).toHaveLength(2);
    await expect(canvas.getAllByRole("button", { name: "Tentar de novo" })).toHaveLength(2);
    await expect(canvas.getByRole("heading", { level: 2, name: "Temporadas" })).toBeVisible();
  },
};

// Carregando: o cabeçalho da tela na hora e o esqueleto do conteúdo (PF21)
export const Loading: Story = {
  render: () => <ProfilePageSkeleton />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Perfil" })).toBeVisible();
    await expect(canvas.getByText("Carregando perfil")).toBeInTheDocument();
  },
};

// @username inexistente (§6.2)
export const NotFound: Story = {
  render: () => <PlayerNotFound />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Jogador não encontrado")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Voltar ao feed" })).toHaveAttribute("href", "/feed");
  },
};
