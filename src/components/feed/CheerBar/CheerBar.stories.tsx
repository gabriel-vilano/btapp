import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CheerBar } from "./CheerBar";
import { feedFrame } from "../storyFixtures";

const meta = {
  title: "Feed/CheerBar",
  component: CheerBar,
  decorators: [feedFrame],
  args: {
    cheerA: 12,
    cheerB: 8,
    userCheer: null,
    ariaLabelA: "Torcer pelo lado Lucas",
    ariaLabelB: "Torcer pelo lado Pedro",
  },
  argTypes: {
    userCheer: { control: "inline-radio", options: [null, "a", "b"] },
  },
} satisfies Meta<typeof CheerBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotCheered: Story = {};

export const CheeredForA: Story = {
  args: { userCheer: "a" },
};

export const CheeredForB: Story = {
  args: { userCheer: "b" },
};

// Confronto recém-anunciado: ninguém torceu ainda, a barra fica vazia.
export const NoCheersYet: Story = {
  args: { cheerA: 0, cheerB: 0 },
};
