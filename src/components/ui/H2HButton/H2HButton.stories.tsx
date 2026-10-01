import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { H2HButton } from "./H2HButton";

const meta = {
  title: "UI/H2HButton",
  component: H2HButton,
  decorators: [
    (Story) => (
      <div className="sb-width-393 sb-pad">
        <Story />
      </div>
    ),
  ],
  args: { count: 3, href: "/h2h/lucassilva+rafaelcosta/pedrohenrique+thiagomendes" },
} satisfies Meta<typeof H2HButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SeveralMatches: Story = {
  play: async ({ args, canvas }) => {
    // Link, não botão (HH18): o leitor de tela anuncia "link"
    const link = await canvas.findByRole("link", { name: "Já jogaram 3 vezes, veja o H2H" });
    await expect(link).toHaveAttribute("href", args.href);
    await expect(canvas.queryByRole("button")).toBeNull();
    await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  },
};

export const OneMatch: Story = {
  args: { count: 1 },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("link")).toHaveTextContent("Já jogaram 1 vez, veja o H2H");
  },
};

export const PlayersPage: Story = {
  args: { count: 5, href: "/h2h/lucassilva/thiagomendes" },
};
