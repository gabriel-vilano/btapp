import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { mockFriendsLists } from "@/src/mocks/profilePage";
import { FriendsList, FriendsListSkeleton, friendsListTitle, type FriendsListProps } from "./FriendsList";

// Tier 4: uma story por situação da lista de amigos (PROFILE.md PF5), sobre os
// mocks do domínio vistos pelo Lucas. O cabeçalho é da página: a story mostra o
// AppHeader com o "Voltar" fixo no perfil, para a tela aparecer inteira
const pageHeader: Decorator<FriendsListProps> = (Story, { args, parameters }) => {
  if (parameters.ownPageHeader) return <Story />;
  return (
    <>
      <AppHeader title={friendsListTitle(args.data)} backHref={args.data.profile_href} />
      <Story />
    </>
  );
};

const meta = {
  title: "Profile/FriendsList",
  component: FriendsList,
  decorators: [pageHeader],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Lista de amigos do jogador, o destino do número “amigos” do cabeçalho do perfil (PF5).",
      },
    },
  },
  args: { data: mockFriendsLists.own },
  argTypes: { data: { control: false } },
} satisfies Meta<typeof FriendsList>;

export default meta;
type Story = StoryObj<typeof meta>;

// A própria lista: "Seus amigos", e cada linha leva ao perfil do amigo
export const Own: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { level: 1, name: "Seus amigos" })).toBeVisible();
    await expect(canvas.getByText("1 amigo")).toBeVisible();
    await expect(canvas.getByRole("link", { name: /Pedro Henrique/ })).toHaveAttribute("href", "/jogadores/pedrohenrique");
  },
};

// Lista longa, em ordem alfabética, com "@username · N jogos" em cada linha
export const LongList: Story = {
  args: { data: mockFriendsLists.longList },
  play: async ({ canvas }) => {
    const names = [
      "Ana Paula Ribeiro",
      "Bruno Araújo",
      "Carla Nogueira",
      "Eduardo Rocha",
      "Pedro Henrique",
      "Rafael Costa",
      "Thiago Mendes",
    ];
    const links = within(await canvas.findByRole("list")).getAllByRole("link");
    await expect(links).toHaveLength(names.length);
    // O avatar sai do nome acessível: a linha é lida "Ana Paula Ribeiro @anapaularibeiro · 3 jogos"
    for (const [index, name] of names.entries()) {
      await expect(links[index]).toHaveAccessibleName(new RegExp(`^${name} @\\w+ · \\d+ jogos?$`));
    }
    await expect(canvas.getByText("7 amigos")).toBeVisible();
  },
};

// A lista de outro jogador: a linha de quem vê leva ao próprio perfil (N10)
export const Other: Story = {
  args: { data: mockFriendsLists.other },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { level: 1, name: "Amigos de Pedro" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: /Lucas Silva/ })).toHaveAttribute("href", "/perfil");
  },
};

// Outro jogador sem amigos: só o aviso, sem ação
export const Empty: Story = {
  args: { data: mockFriendsLists.empty },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Marina ainda não tem amigos no LetzPlay.")).toBeVisible();
    await expect(canvas.queryByRole("link", { name: "Buscar jogadores" })).toBeNull();
  },
};

// A própria lista vazia: o próximo passo é a busca de jogadores do Explorar (N32)
export const OwnEmpty: Story = {
  args: { data: mockFriendsLists.ownEmpty },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Você ainda não tem amigos no LetzPlay.")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Buscar jogadores" })).toHaveAttribute("href", "/explorar");
  },
};

// Carregando: o cabeçalho na hora e o esqueleto da lista (N23)
export const Loading: Story = {
  parameters: { ownPageHeader: true },
  render: () => (
    <>
      <AppHeader title="Amigos" backHref="/perfil" />
      <FriendsListSkeleton />
    </>
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { level: 1, name: "Amigos" })).toBeVisible();
  },
};
