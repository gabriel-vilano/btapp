import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProfileMiniCard } from "./ProfileMiniCard";
import {
  expectNoHorizontalOverflow,
  feedFrame,
  storyLongPlayer,
  storyPlayer,
} from "../storyFixtures";

const meta = {
  title: "Feed/ProfileMiniCard",
  component: ProfileMiniCard,
  decorators: [feedFrame],
  args: { player: storyPlayer },
} satisfies Meta<typeof ProfileMiniCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongName: Story = {
  args: { player: storyLongPlayer },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement);
  },
};
