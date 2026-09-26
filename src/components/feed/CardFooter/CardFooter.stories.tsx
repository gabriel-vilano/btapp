import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { CardFooter } from "./CardFooter";

const meta = {
  title: "Feed/CardFooter",
  component: CardFooter,
  args: {
    initialLiked: false,
    onComment: fn(),
    onShare: fn(),
  },
} satisfies Meta<typeof CardFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Liked: Story = {
  args: { initialLiked: true },
};

// Regressão: o nome acessível não pode virar "Descurtir" (WCAG 2.5.3).
// O estado vai só no aria-pressed.
export const ToggleLike: Story = {
  play: async ({ canvas, userEvent }) => {
    const like = canvas.getByRole("button", { name: "Curtir" });
    await expect(like).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(like);
    await expect(canvas.getByRole("button", { name: "Curtir" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await userEvent.click(like);
    await expect(like).toHaveAttribute("aria-pressed", "false");
  },
};

export const ActionsCallHandlers: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Comentar" }));
    await userEvent.click(canvas.getByRole("button", { name: "Compartilhar" }));
    await expect(args.onComment).toHaveBeenCalledOnce();
    await expect(args.onShare).toHaveBeenCalledOnce();
  },
};
