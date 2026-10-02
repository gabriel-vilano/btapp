import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { H2HSummary } from "./H2HSummary";

const meta = {
  title: "H2H/H2HSummary",
  component: H2HSummary,
  // Largura do viewport, de 320 a 430px: o bloco ocupa a tela como no app
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story, { parameters }) => (
      <div className={parameters.narrow ? "sb-width-320" : undefined}>
        <div className="sb-screen-fluid" data-testid="frame">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    leftWins: 3,
    rightWins: 1,
    lastPlayedAt: "2026-09-12T13:00:00Z",
    leftLabel: "Você",
    rightLabel: "Pedro",
    sideKind: "player",
  },
  argTypes: {
    sideKind: { control: "inline-radio", options: ["player", "pair"] },
  },
} satisfies Meta<typeof H2HSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sem rolagem horizontal: os dois números e a barra cabem no frame
async function expectFitsFrame(canvasElement: HTMLElement) {
  const frame = within(canvasElement).getByTestId("frame");
  await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
  const { documentElement } = canvasElement.ownerDocument;
  await expect(documentElement.scrollWidth).toBeLessThanOrEqual(documentElement.clientWidth);
}

// O leitor de tela ouve a frase; números, barra e linha de apoio ficam fora da árvore
export const LeftAhead: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(
      await canvas.findByText(
        "Você venceu 3, Pedro venceu 1, em 4 jogos. Último confronto em 12 de setembro de 2026.",
      ),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Você venceu 3 · Último: 12/09/2026")).toBeVisible();
    await expect(canvas.getByText("4 jogos")).toBeVisible();
    // 3 de 4: o grafite ocupa 75% da barra
    const left = canvasElement.querySelector("svg rect:last-of-type");
    await expect(left).toHaveAttribute("width", "75");
    await expectFitsFrame(canvasElement);
  },
};

export const RightAhead: Story = {
  args: { leftWins: 1, rightWins: 3 },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Pedro venceu 3 · Último: 12/09/2026")).toBeVisible();
  },
};

// Empate: a barra fica dividida ao meio
export const Tie: Story = {
  args: { leftWins: 2, rightWins: 2 },
  play: async ({ canvas, canvasElement }) => {
    await expect(await canvas.findByText("Empate em 2 a 2 · Último: 12/09/2026")).toBeVisible();
    await expect(canvasElement.querySelector("svg rect:last-of-type")).toHaveAttribute("width", "50");
    await expectFitsFrame(canvasElement);
  },
};

// Um confronto só: sem barra, que seria 100% de um lado e só repetiria o número
export const SingleMatch: Story = {
  args: { leftWins: 1, rightWins: 0 },
  play: async ({ canvas, canvasElement }) => {
    await expect(await canvas.findByText("1 jogo")).toBeVisible();
    await expect(canvasElement.querySelector("svg")).toBeNull();
    await expect(
      canvas.getByText(/Pedro não venceu nenhum, em 1 jogo\./),
    ).toBeInTheDocument();
  },
};

// Números de dois dígitos nas pontas, sem empurrar o total
export const TwoDigits: Story = {
  args: { leftWins: 14, rightWins: 11 },
  play: async ({ canvas, canvasElement }) => {
    await expect(await canvas.findByText("25 jogos")).toBeVisible();
    await expectFitsFrame(canvasElement);
  },
};

// Página de duplas com quem vê num dos lados: "Vocês venceram"
export const Pairs: Story = {
  args: { leftLabel: "Vocês", rightLabel: "Pedro e Thiago", sideKind: "pair" },
  play: async ({ canvas, canvasElement }) => {
    await expect(await canvas.findByText("Vocês venceram 3 · Último: 12/09/2026")).toBeVisible();
    await expectFitsFrame(canvasElement);
  },
};

// Quem vê não está em nenhum dos lados: os dois são nomes
export const Names: Story = {
  args: { leftLabel: "Lucas", rightLabel: "Pedro", leftWins: 2, rightWins: 5 },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Pedro venceu 5 · Último: 12/09/2026")).toBeVisible();
  },
};

// Menor celular suportado (320px), com números de dois dígitos e a linha de apoio mais longa
export const Narrow: Story = {
  parameters: { narrow: true },
  args: { leftLabel: "Vocês", rightLabel: "Pedro e Thiago", sideKind: "pair", leftWins: 11, rightWins: 14 },
  play: async ({ canvas, canvasElement }) => {
    await expect(await canvas.findByText("Pedro e Thiago venceram 14 · Último: 12/09/2026")).toBeVisible();
    await expectFitsFrame(canvasElement);
  },
};
