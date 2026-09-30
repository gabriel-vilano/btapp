import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BellIcon, CalendarBlankIcon } from "@phosphor-icons/react";
import { expect, within } from "storybook/test";
import { IconButton } from "@/src/components/ui/IconButton";
import { CountBadge } from "./CountBadge";

const meta = {
  title: "UI/CountBadge",
  component: CountBadge,
  parameters: {
    docs: {
      description: {
        component:
          "Contador ou ponto sobre um ícone de navegação. Só visual: a contagem entra no nome acessível do controle pai.",
      },
    },
  },
  args: {
    count: 2,
  },
  argTypes: {
    count: { control: { type: "number", min: 0 } },
    max: { control: { type: "number", min: 1 } },
  },
} satisfies Meta<typeof CountBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Count: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[aria-hidden='true']")).toHaveTextContent("2");
  },
};

export const Dot: Story = {
  args: { count: undefined },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[aria-hidden='true']")).toBeEmptyDOMElement();
  },
};

/** Acima do máximo (9 por padrão), o número vira "9+". */
export const Overflow: Story = {
  args: { count: 12 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[aria-hidden='true']")).toHaveTextContent("9+");
  },
};

/** Com zero, nada aparece. */
export const Zero: Story = {
  args: { count: 0 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toBeEmptyDOMElement();
  },
};

/** O badge no contexto: sobre o ícone de um IconButton. O nome acessível inclui a contagem. */
export const OnIcon: Story = {
  render: () => (
    <div className="sb-row">
      <IconButton icon={BellIcon} label="Notificações" badge={{ description: "há novas" }} />
      <IconButton
        icon={CalendarBlankIcon}
        label="Jogos"
        badge={{ count: 2, description: "2 pendências" }}
      />
      <IconButton
        icon={CalendarBlankIcon}
        label="Jogos"
        badge={{ count: 12, description: "12 pendências" }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Notificações, há novas" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Jogos, 2 pendências" })).toBeVisible();
  },
};
