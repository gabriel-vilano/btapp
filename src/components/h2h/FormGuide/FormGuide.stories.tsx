import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { FormGuide } from "./FormGuide";

const meta = {
  title: "H2H/FormGuide",
  component: FormGuide,
  parameters: {
    docs: {
      description: {
        component: "Forma recente de um lado: até 5 círculos com V ou D, a mais recente à direita.",
      },
    },
  },
  args: {
    results: ["win", "win", "loss", "win", "loss"],
    label: "Lucas",
  },
} satisfies Meta<typeof FormGuide>;

export default meta;
type Story = StoryObj<typeof meta>;

// O grupo tem um nome por extenso; as letras não são lidas uma a uma
export const Five: Story = {
  play: async ({ canvas }) => {
    const group = await canvas.findByRole("img", {
      name: "Últimas 5 de Lucas: vitória, vitória, derrota, vitória, derrota, da mais antiga para a mais recente",
    });
    await expect(group.textContent).toBe("VVDVD");
  },
};

export const FewerThanFive: Story = {
  args: { results: ["loss", "win"] },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("img", { name: /^Últimas 2 de Lucas: derrota, vitória/ }),
    ).toBeVisible();
  },
};

// Sem partidas: o texto ocupa o lugar dos círculos
export const Empty: Story = {
  args: { results: [] },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Sem partidas")).toBeVisible();
    await expect(canvas.queryByRole("img")).toBeNull();
  },
};

export const AllWins: Story = {
  args: { results: ["win", "win", "win", "win", "win"] },
};

export const AllLosses: Story = {
  args: { results: ["loss", "loss", "loss", "loss", "loss"] },
};

// Com mais de 5 resultados, ficam os 5 mais recentes
export const MoreThanFive: Story = {
  args: { results: ["loss", "loss", "win", "win", "win", "win", "win"] },
  play: async ({ canvas }) => {
    const group = await canvas.findByRole("img", { name: /^Últimas 5 de Lucas/ });
    await expect(group.textContent).toBe("VVVVV");
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="sb-stack">
      <FormGuide results={["win", "win", "loss", "win", "loss"]} label="Lucas" />
      <FormGuide results={["loss", "win"]} label="Pedro" />
      <FormGuide results={["win", "win", "win", "win", "win"]} label="Rafael" />
      <FormGuide results={["loss", "loss", "loss", "loss", "loss"]} label="Thiago" />
      <FormGuide results={[]} label="Bruno" />
    </div>
  ),
};
