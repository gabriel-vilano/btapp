import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Spinner } from "./Spinner";

const meta = {
  title: "UI/Spinner",
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          "Anel de carregamento em currentColor. Quatro tamanhos, na escala do Icon. Decorativo por padrão; com `label`, vira região de status.",
      },
    },
  },
  args: {
    size: "md",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg"],
    },
    label: { control: "text" },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const spinner = canvasElement.querySelector("span");
    await expect(spinner).toHaveAttribute("aria-hidden", "true");
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="sb-row">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};

export const Accent: Story = {
  args: { size: "lg" },
  decorators: [
    (Story) => (
      <div className="sb-color-accent">
        <Story />
      </div>
    ),
  ],
};

export const OnStrong: Story = {
  decorators: [
    (Story) => (
      <div className="sb-bg-strong sb-pad">
        <Story />
      </div>
    ),
  ],
};

export const WithLabel: Story = {
  args: { size: "lg", label: "Carregando ranking" },
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole("status");
    await expect(status).toHaveTextContent("Carregando ranking");
  },
};
