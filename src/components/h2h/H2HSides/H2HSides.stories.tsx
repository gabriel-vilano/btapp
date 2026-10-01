import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { H2HSides, type H2HSidesPlayer } from "./H2HSides";

function player(username: string, name: string, shownName = name): H2HSidesPlayer {
  return { id: `player-${username}`, name, shownName, avatarUrl: null, href: `/jogadores/${username}` };
}

const lucas = player("lucassilva", "Lucas Silva", "Lucas");
const rafael = player("rafaelcosta", "Rafael Costa", "Rafael");
const pedro = player("pedrohenrique", "Pedro Henrique", "Pedro");
const thiago = player("thiagomendes", "Thiago Mendes", "Thiago");

const meta = {
  title: "H2H/H2HSides",
  component: H2HSides,
  // Largura do viewport, de 320 a 430px: o bloco ocupa a tela como no app
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story, { parameters }) => (
      <div className={parameters.narrow ? "sb-width-320" : undefined}>
        <div className="sb-screen-fluid">
          <Story />
        </div>
      </div>
    ),
  ],
  args: { left: [player("lucassilva", "Lucas Silva")], right: [player("pedrohenrique", "Pedro Henrique")] },
  argTypes: { left: { control: false }, right: { control: false } },
} satisfies Meta<typeof H2HSides>;

export default meta;
type Story = StoryObj<typeof meta>;

// Jogador × jogador: o nome completo (HH9), e cada lado é um link para o perfil
export const Players: Story = {
  play: async ({ canvas }) => {
    const link = await canvas.findByRole("link", { name: "Lucas Silva" });
    await expect(link).toHaveAttribute("href", "/jogadores/lucassilva");
    await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  },
};

// Dupla × dupla: o primeiro nome, e cada jogador é um alvo próprio
export const Doubles: Story = {
  args: { left: [lucas, rafael], right: [pedro, thiago] },
  play: async ({ canvas }) => {
    await canvas.findByRole("link", { name: "Lucas Silva" });
    await expect(canvas.getAllByRole("link")).toHaveLength(4);
    await expect(canvas.getByText("Rafael")).toBeVisible();
  },
};

// Nome longo: até 2 linhas, depois reticências (§6.1), a 320px
export const LongNames: Story = {
  parameters: { narrow: true },
  args: {
    left: [player("anapaula", "Ana Paula Ribeiro de Albuquerque Cavalcanti")],
    right: [player("paulocesar", "Paulo César Duarte Nogueira Vasconcelos")],
  },
};

// Dupla com primeiros nomes longos, a 320px
export const LongDoubles: Story = {
  parameters: { narrow: true },
  args: {
    left: [player("maximiliano", "Maximiliano Ferreira", "Maximiliano"), player("bartolomeu", "Bartolomeu Souza", "Bartolomeu")],
    right: [player("cristovao", "Cristóvão Lima", "Cristóvão"), player("valdemar", "Valdemar Rocha", "Valdemar")],
  },
};
