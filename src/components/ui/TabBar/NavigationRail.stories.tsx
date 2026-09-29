import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { NavigationRail } from "./NavigationRail";
import { STORY_NAVIGATION_ITEMS, withAdminBadge } from "./storyFixtures";

const meta = {
  title: "UI/NavigationRail",
  component: NavigationRail,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "A navegação principal a partir de 600px: as mesmas abas da TabBar num trilho à esquerda.",
      },
    },
  },
  globals: { viewport: { value: "tablet", isRotated: false } },
  args: {
    items: STORY_NAVIGATION_ITEMS,
    currentValue: "feed",
  },
  argTypes: {
    items: { control: false },
    currentValue: {
      control: "inline-radio",
      options: STORY_NAVIGATION_ITEMS.map((item) => item.value),
    },
  },
} satisfies Meta<typeof NavigationRail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("navigation", { name: "Principal" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Feed" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getAllByRole("link")).toHaveLength(5);
  },
};

/** O rótulo mais longo, ativo e com badge, dentro do trilho. */
export const LongestLabelCurrent: Story = {
  args: { items: withAdminBadge(STORY_NAVIGATION_ITEMS), currentValue: "competicoes" },
  play: async ({ canvasElement }) => {
    await document.fonts.ready;
    const link = within(canvasElement).getByRole("link", { name: "Competições, 1 pendência de admin" });
    const label = within(link).getByText("Competições");
    await expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(
      link.getBoundingClientRect().width,
    );
  },
};

export const ProfileCurrent: Story = {
  args: { currentValue: "perfil" },
};
