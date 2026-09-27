import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StarIcon } from "@phosphor-icons/react";
import { expect, within } from "storybook/test";
import { Badge } from "./Badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          "Selo curto de status ou categoria. Quatro tons: neutral, accent, success e attention. Ícone opcional antes do texto.",
      },
    },
  },
  args: {
    tone: "neutral",
    children: "Categoria B",
  },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["neutral", "accent", "success", "attention"],
    },
    children: { control: "text" },
    icon: { control: false },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

export const Accent: Story = {
  args: { tone: "accent", children: "Top 10" },
};

export const Success: Story = {
  args: { tone: "success", children: "VITÓRIA" },
};

export const Attention: Story = {
  args: { tone: "attention", children: "DERROTA" },
};

export const WithIcon: Story = {
  args: { tone: "accent", icon: StarIcon, children: "Assumiu a liderança" },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector("svg");
    await expect(svg).toHaveAttribute("aria-hidden", "true");
    await expect(within(canvasElement).getByText("Assumiu a liderança")).toBeVisible();
  },
};

export const AllTones: Story = {
  render: () => (
    <div className="sb-row">
      <Badge tone="neutral">Categoria B</Badge>
      <Badge tone="accent">Top 10</Badge>
      <Badge tone="success">VITÓRIA</Badge>
      <Badge tone="attention">DERROTA</Badge>
    </div>
  ),
};
