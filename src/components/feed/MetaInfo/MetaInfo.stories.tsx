import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MetaInfo } from "./MetaInfo";
import { expectNoHorizontalOverflow, feedFrame } from "../storyFixtures";

const meta = {
  title: "Feed/MetaInfo",
  component: MetaInfo,
  decorators: [feedFrame],
  args: {
    // Data fixa: o texto formatado não muda com o relógio.
    date: "2026-05-20T22:00:00Z",
    location: "Arena RM – Beach · Nova Lima/MG",
  },
} satisfies Meta<typeof MetaInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WalkOverNote: Story = {
  args: { note: "Jogo encerrado por W.O." },
};

export const RetiredNote: Story = {
  args: { note: "Jogo encerrado por desistência" },
};

export const LongLocation: Story = {
  args: {
    location:
      "Arena Sunset Beach Club – Quadras Cobertas 1 a 6 · Belo Horizonte/MG",
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement);
  },
};
