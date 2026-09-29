import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BellIcon, GearSixIcon, XIcon } from "@phosphor-icons/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { IconButton } from "./IconButton";
import { IconButtonLink } from "./IconButtonLink";

const meta = {
  title: "UI/IconButton",
  component: IconButton,
  parameters: {
    docs: {
      description: {
        component:
          "Botão só de ícone, com área tocável de 48×48 e nome acessível obrigatório. O IconButtonLink tem a mesma forma para ícones que levam a outra tela.",
      },
    },
  },
  args: {
    icon: XIcon,
    label: "Fechar",
    onClick: fn(),
  },
  argTypes: {
    icon: { control: false },
    badge: { control: false },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Fechar" });
    const { width, height } = button.getBoundingClientRect();
    await expect(width).toBe(48);
    await expect(height).toBe(48);
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const WithDot: Story = {
  args: { icon: BellIcon, label: "Notificações", badge: { description: "há novas" } },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Notificações, há novas" }),
    ).toBeVisible();
  },
};

export const WithCount: Story = {
  args: { icon: BellIcon, label: "Notificações", badge: { count: 3, description: "3 novas" } },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** O sino e a engrenagem levam a outra tela: são links, com a mesma forma. */
export const AsLink: Story = {
  render: () => (
    <div className="sb-row">
      <IconButtonLink
        href="/notificacoes"
        icon={BellIcon}
        label="Notificações"
        badge={{ description: "há novas" }}
      />
      <IconButtonLink href="/perfil/configuracoes" icon={GearSixIcon} label="Configurações" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Notificações, há novas" })).toHaveAttribute(
      "href",
      "/notificacoes",
    );
    await expect(canvas.getByRole("link", { name: "Configurações" })).toBeVisible();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="sb-row">
      <IconButton icon={XIcon} label="Fechar" />
      <IconButton icon={BellIcon} label="Notificações" badge={{ description: "há novas" }} />
      <IconButton icon={BellIcon} label="Notificações" badge={{ count: 3, description: "3 novas" }} />
      <IconButton icon={GearSixIcon} label="Configurações" disabled />
    </div>
  ),
};
