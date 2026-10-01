import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { List } from "@/src/components/ui/ListItem";
import { H2HMatchItem } from "./H2HMatchItem";

const meta = {
  title: "H2H/H2HMatchItem",
  component: H2HMatchItem,
  // Linha de ponta a ponta na largura do mobile base: a margem lateral é do próprio item
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story, { parameters }) => (
      <div className="sb-width-393">
        {parameters.ownList ? (
          <Story />
        ) : (
          <List>
            <Story />
          </List>
        )}
      </div>
    ),
  ],
  args: {
    outcome: "win",
    score: { type: "normal", sets: [{ a: 6, b: 4 }, { a: 3, b: 6 }, { a: 10, b: 7 }] },
    playedAt: "2026-09-12T13:00:00Z",
    context: "Ranking Rankin · Masculino B · Rodada 3",
    href: "/partidas/m1",
  },
  argTypes: {
    outcome: { control: "inline-radio", options: ["win", "loss"] },
    score: { control: "object" },
    lineup: { control: "object" },
  },
} satisfies Meta<typeof H2HMatchItem>;

export default meta;
type Story = StoryObj<typeof meta>;

// Pedaços em flex ganham um espaço no nome acessível ("Vitória , 6/4"): o leitor de tela lê igual
const PAUSE = " ?, ";

// A linha inteira é um link, lido como uma frase
export const Win: Story = {
  play: async ({ canvas }) => {
    const link = await canvas.findByRole("link", {
      name: new RegExp(
        ["^Vitória", "6/4 3/6 10/7", "12 de setembro de 2026", "Ranking Rankin · Masculino B · Rodada 3$"].join(PAUSE),
      ),
    });
    await expect(link).toHaveAttribute("href", "/partidas/m1");
    await expect(canvas.getByText("12/09/2026")).toBeVisible();
    await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  },
};

// O placar é lido do lado esquerdo da página: na derrota, 4/6 3/6
export const Loss: Story = {
  args: {
    outcome: "loss",
    score: { type: "normal", sets: [{ a: 6, b: 4 }, { a: 6, b: 3 }] },
    playedAt: "2026-08-20T13:00:00Z",
  },
  play: async ({ canvas }) => {
    const name = new RegExp(["^Derrota", "4/6 3/6", "20 de agosto de 2026"].join(PAUSE));
    await expect(await canvas.findByRole("link", { name })).toBeVisible();
  },
};

// Quem desistiu leva "Desistência" no lugar de "Derrota" (FEED_CARDS.md §3.3)
export const Retired: Story = {
  args: {
    outcome: "loss",
    score: { type: "retired", completed_sets: [{ a: 6, b: 4 }], interrupted_set: { a: 2, b: 3 } },
  },
  play: async ({ canvas }) => {
    const name = new RegExp(["^Desistência", "4/6 3/2 desist\\."].join(PAUSE));
    await expect(await canvas.findByRole("link", { name })).toBeVisible();
  },
};

export const Friendly: Story = {
  args: { context: "Amistoso", score: { type: "normal", sets: [{ a: 6, b: 2 }] } },
};

// Torneio: competição · categoria, sem rodada
export const TournamentWithoutRound: Story = {
  args: { context: "Open de Verão Copacabana · Mista C" },
};

// Página de jogadores, partida em duplas: com quem e contra quem
export const DoublesWithLineup: Story = {
  args: { lineup: { partnerName: "Rafael", opponentNames: "Pedro e Thiago" } },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("com Rafael, contra Pedro e Thiago")).toBeVisible();
  },
};

// Contexto longo quebra; o placar e a data ficam numa linha só
export const LongContext: Story = {
  args: {
    context: "Circuito Metropolitano de Beach Tennis da Grande Belo Horizonte · Mista C 40+ · Rodada 12",
    lineup: { partnerName: "Maria Eduarda", opponentNames: "Ana Clara e Maria Fernanda" },
  },
  play: async ({ canvas }) => {
    const date = await canvas.findByText("12/09/2026");
    const score = canvas.getByText("6/4").parentElement as HTMLElement;
    // Uma linha de label-lg tem 20px: o placar não quebrou
    await expect(score.getBoundingClientRect().height).toBeLessThanOrEqual(20);
    await expect(date.getBoundingClientRect().height).toBeLessThanOrEqual(16);
  },
};

export const AllVariants: Story = {
  parameters: { ownList: true },
  render: (args) => (
    <List divided>
      <H2HMatchItem {...args} />
      <H2HMatchItem
        {...args}
        outcome="loss"
        score={{ type: "normal", sets: [{ a: 6, b: 4 }, { a: 6, b: 3 }] }}
        context="Amistoso"
      />
      <H2HMatchItem
        {...args}
        outcome="loss"
        score={{ type: "retired", completed_sets: [{ a: 6, b: 4 }], interrupted_set: { a: 2, b: 3 } }}
        context="Open de Verão Copacabana · Mista C"
        lineup={{ partnerName: "Rafael", opponentNames: "Pedro e Thiago" }}
      />
    </List>
  ),
};
