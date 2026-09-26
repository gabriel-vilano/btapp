import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { H2HButton } from "./H2HButton";
import { feedFrame } from "../storyFixtures";

const meta = {
  title: "Feed/H2HButton",
  component: H2HButton,
  decorators: [feedFrame],
  args: { count: 3, onClick: fn() },
} satisfies Meta<typeof H2HButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SeveralMatches: Story = {};

export const OneMatch: Story = {
  args: { count: 1 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toHaveTextContent(
      "Já jogaram 1 vez, veja o H2H",
    );
  },
};

export const CallsOnClick: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
