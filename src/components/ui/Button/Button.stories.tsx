import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRightIcon, TrophyIcon } from "@phosphor-icons/react";
import { expect } from "storybook/test";
import { Button } from "./Button";
import { Icon } from "@/src/components/ui/Icon";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Botão de ação. Três variantes (primary/secondary/ghost), com estados loading e disabled. State layers via ::after — funcionam em qualquer cor de fundo sem variação manual.",
      },
    },
  },
  args: {
    children: "Continuar",
    variant: "primary",
    loading: false,
    fullWidth: false,
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "ghost"],
    },
    loading: { control: "boolean" },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
    onClick: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="sb-row">
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  args: { loading: true },
  parameters: {
    docs: {
      description: {
        story:
          "Estado loading esconde o conteúdo (opacity: 0) e mostra o Spinner sm. Mantém o tamanho do botão estável — sem layout shift.",
      },
    },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledVariants: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="sb-row">
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Cada variante desabilitada mantém a forma: só o primary é preenchido.",
      },
    },
  },
  play: async ({ canvas }) => {
    for (const button of canvas.getAllByRole("button")) {
      await expect(button).toBeDisabled();
    }
  },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  parameters: {
    layout: "padded",
  },
};

export const WithLeadingIcon: Story = {
  args: {
    children: (
      <>
        <Icon icon={TrophyIcon} size="sm" />
        <span>Ver ranking</span>
      </>
    ),
  },
};

export const WithTrailingIcon: Story = {
  args: {
    children: (
      <>
        <span>Continuar</span>
        <Icon icon={ArrowRightIcon} size="sm" />
      </>
    ),
  },
};
