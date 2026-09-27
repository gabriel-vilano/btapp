import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Avatar, AvatarStack } from "./Avatar";
import { STORY_AVATAR_URL } from "./storyFixtures";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  args: { url: STORY_AVATAR_URL, alt: "Lucas Silva", size: 40 },
  argTypes: {
    size: { control: "inline-radio", options: [32, 40, 48, 96] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPhoto: Story = {};

// Sem foto: iniciais do primeiro e do último nome, lidas como o nome completo.
export const Initials: Story = {
  args: { url: null },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Lucas Silva" })).toHaveTextContent("LS");
  },
};

// Nome longo: continua com duas letras, não estoura o círculo.
export const LongName: Story = {
  args: { url: null, alt: "Maria Eduarda Albuquerque de Vasconcelos" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img")).toHaveTextContent(/^MV$/);
  },
};

// Dado faltando: sem foto e sem nome, cai no círculo neutro e sai da leitura de tela.
export const Placeholder: Story = {
  args: { url: null, alt: "" },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("img")).toBeNull();
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="sb-stack">
      <div className="sb-row">
        <Avatar {...args} size={32} />
        <Avatar {...args} size={40} />
        <Avatar {...args} size={48} />
        <Avatar {...args} size={96} />
      </div>
      <div className="sb-row">
        <Avatar {...args} url={null} size={32} />
        <Avatar {...args} url={null} size={40} />
        <Avatar {...args} url={null} size={48} />
        <Avatar {...args} url={null} size={96} />
      </div>
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
        size={40}
        items={[
          { id: "a", url: null, alt: "Lucas Silva" },
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
