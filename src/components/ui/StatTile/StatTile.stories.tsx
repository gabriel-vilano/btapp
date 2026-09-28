import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { StatTile } from "./StatTile";
import styles from "./StatTile.stories.module.css";

const meta = {
  title: "UI/StatTile",
  component: StatTile,
  parameters: {
    docs: { description: { component: "Um número com rótulo, para contagens do perfil." } },
  },
  args: { value: 274, label: "jogos", singularLabel: "jogo" },
  argTypes: { href: { control: "text" } },
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sem link: é texto, lido como uma frase só.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("274 jogos")).toBeInTheDocument();
    await expect(canvas.queryByRole("link")).toBeNull();
  },
};

// Com link: o nome acessível é "38 amigos", na ordem valor e rótulo.
export const WithLink: Story = {
  args: { value: 38, label: "amigos", singularLabel: "amigo", href: "/jogadores/lucas/amigos" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "38 amigos" })).toHaveAttribute(
      "href",
      "/jogadores/lucas/amigos",
    );
  },
};

// Jogador novo.
export const Zero: Story = {
  args: { value: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("0 jogos")).toBeInTheDocument();
  },
};

// Singular: o rótulo concorda com o número.
export const One: Story = {
  args: { value: 1 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("1 jogo")).toBeInTheDocument();
  },
};

// Quatro dígitos: milhar com ponto, como no pt-BR.
export const FourDigits: Story = {
  args: { value: 1204 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("1.204 jogos")).toBeInTheDocument();
  },
};

export const AllStates: Story = {
  render: () => (
    <>
      <StatTile value={0} label="jogos" singularLabel="jogo" />
      <StatTile value={1} label="jogos" singularLabel="jogo" />
      <StatTile value={1204} label="jogos" singularLabel="jogo" />
      <StatTile value={38} label="amigos" singularLabel="amigo" href="/jogadores/lucas/amigos" />
    </>
  ),
};
