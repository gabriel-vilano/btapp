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

export const AllDirections: Story = {
  render: () => (
    <div className="sb-stack">
      <DeltaIndicator direction="up" value={2} />
      <DeltaIndicator direction="down" value={3} />
      <DeltaIndicator direction="none" />
    </div>
  ),
};
