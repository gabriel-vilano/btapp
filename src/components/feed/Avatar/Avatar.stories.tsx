import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar, AvatarStack } from "./Avatar";
import { STORY_AVATAR_URL } from "../storyFixtures";

const meta = {
  title: "Feed/Avatar",
  component: Avatar,
  args: { url: STORY_AVATAR_URL, alt: "Lucas Silva", size: 40 },
  argTypes: {
    size: { control: "inline-radio", options: [32, 40, 48] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPhoto: Story = {};

// Dado faltando: jogador sem foto cai no placeholder neutro.
export const Placeholder: Story = {
  args: { url: null },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="sb-row">
      <Avatar {...args} size={32} />
      <Avatar {...args} size={40} />
      <Avatar {...args} size={48} />
      <Avatar {...args} url={null} size={32} />
      <Avatar {...args} url={null} size={40} />
      <Avatar {...args} url={null} size={48} />
    </div>
  ),
};

export const Stack: Story = {
  render: () => (
    <div className="sb-row">
      <AvatarStack
        size={32}
        items={[
          { id: "a", url: STORY_AVATAR_URL, alt: "Lucas Silva" },
          { id: "b", url: null, alt: "Rafael Costa" },
        ]}
      />
      <AvatarStack
        size={48}
        items={[
          { id: "a", url: STORY_AVATAR_URL, alt: "Lucas Silva" },
          { id: "b", url: STORY_AVATAR_URL, alt: "Rafael Costa" },
        ]}
      />
    </div>
  ),
};
