import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { mockPlayerMatchesLists } from "@/src/mocks/profilePage";
import { PlayerMatches, PlayerMatchesSkeleton, playerMatchesTitle, type PlayerMatchesProps } from "./PlayerMatches";

// Tier 4: uma story por situação da lista de partidas de outro jogador (PROFILE.md
// PF18), sobre os mocks do domínio. O cabeçalho é da página: a story mostra o
// AppHeader com o "Voltar" fixo no perfil, para a tela aparecer inteira
const pageHeader: Decorator<PlayerMatchesProps> = (Story, { args, parameters }) => {
  if (parameters.ownPageHeader) return <Story />;
  return (
    <>
      <AppHeader title={playerMatchesTitle(args.data)} backHref={args.data.profile_href} />
      <Story />
    </>
  );
};

const meta = {
  title: "Profile/PlayerMatches",
  component: PlayerMatches,
  decorators: [pageHeader],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Todas as partidas de outro jogador, o destino do “Ver todas” de “Partidas recentes” (PF18).",
      },
    },
  },
  args: { data: mockPlayerMatchesLists.other },
  argTypes: { data: { control: false } },
} satisfies Meta<typeof PlayerMatches>;

export default meta;
type Story = StoryObj<typeof meta>;

// As 8 partidas do Pedro, além das 5 do perfil; cada linha abre a partida
export const Other: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { level: 1, name: "Partidas de Pedro" })).toBeVisible();
    const links = within(canvas.getByRole("list", { name: "Partidas de Pedro" })).getAllByRole("link");
    await expect(links).toHaveLength(8);
    for (const link of links) await expect(link).toHaveAttribute("href", expect.stringMatching(/^\/jogos\//));
  },
};

// Jogador sem partida: o mesmo vazio do perfil de outro jogador, sem ação
export const Empty: Story = {
  args: { data: mockPlayerMatchesLists.empty },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("As partidas de Marina aparecem aqui.")).toBeVisible();
    await expect(canvas.queryByRole("list")).toBeNull();
  },
};

// Carregando: o cabeçalho na hora e o esqueleto da lista (N23)
export const Loading: Story = {
  parameters: { ownPageHeader: true },
  render: () => (
    <>
      <AppHeader title="Partidas" backHref="/jogadores/pedrohenrique" />
      <PlayerMatchesSkeleton />
    </>
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { level: 1, name: "Partidas" })).toBeVisible();
  },
};
