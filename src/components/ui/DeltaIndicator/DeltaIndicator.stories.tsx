import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { DeltaIndicator } from "./DeltaIndicator";

const meta = {
  title: "UI/DeltaIndicator",
  component: DeltaIndicator,
  parameters: {
    docs: {
      description: {
        component:
          "Variação de posição no ranking. Três sentidos: subiu, caiu e manteve. Cada um tem ícone, texto e cor.",
      },
    },
  },
  args: { direction: "up", value: 2 },
  argTypes: {
    direction: { control: "inline-radio", options: ["up", "down", "none"] },
    value: { control: { type: "number", min: 1 } },
    compact: { control: "boolean" },
  },
} satisfies Meta<typeof DeltaIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Up: Story = {
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector("svg");
    await expect(svg).toHaveAttribute("aria-hidden", "true");
    // O sentido chega ao leitor de tela pelo texto, não pela seta
    await expect(canvasElement.textContent).toBe("Subiu 2 posições");
  },
};

export const Down: Story = {
  args: { direction: "down", value: 3 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).toBe("Caiu 3 posições");
  },
};

export const Unchanged: Story = {
  args: { direction: "none" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Manteve a posição")).toBeVisible();
  },
};

export const OnePosition: Story = {
  args: { direction: "up", value: 1 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).toBe("Subiu 1 posição");
  },
};

// Coluna estreita (linha do ranking): só seta e número à vista, frase inteira no leitor de tela
export const Compact: Story = {
  args: { direction: "down", value: 2, compact: true },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).toBe("Caiu 2 posições");
    const root = canvasElement.firstElementChild as HTMLElement;
    // Seta (16px) + 4px de gap + um dígito: sem a palavra "posições" à vista
    await expect(root.getBoundingClientRect().width).toBeLessThan(40);
  },
};

// Compacto no "Manteve": só o traço à vista, a frase inteira no leitor de tela
export const UnchangedCompact: Story = {
  args: { direction: "none", compact: true },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).toBe("Manteve a posição");
    const root = canvasElement.firstElementChild as HTMLElement;
    // Só o traço (16px): o texto oculto não soma o gap
    await expect(root.getBoundingClientRect().width).toBeLessThanOrEqual(16);
  },
};

export const AllDirections: Story = {
  render: () => (
    <div className="sb-stack">
      <DeltaIndicator direction="up" value={2} />
      <DeltaIndicator direction="down" value={3} />
      <DeltaIndicator direction="none" />
    </div>
  ),
};
