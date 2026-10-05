import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { brand } from "@/src/lib/brand";
import { Logo } from "./Logo";

const meta = {
  title: "Brand/Logo",
  component: Logo,
  parameters: {
    docs: {
      description: {
        component: `Wordmark provisório de ${brand.name}, em texto. Caixa fixa de 118,84 × 32 px (proporção 208×56); a cor vem do contêiner.`,
      },
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

// Aceite da caixa: 118,84 × 32 (±0,5px). A folga do texto (8px de cada lado)
// não entra aqui: no Storybook o Arimo vem do Google Fonts com display=swap,
// e até chegar (ou se a rede o bloquear) o texto sai no system-ui, mais largo.
const BOX_WIDTH = (208 / 56) * 32;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = (await canvas.findByText(brand.name)).getBoundingClientRect();
    await expect(Math.abs(box.width - BOX_WIDTH)).toBeLessThanOrEqual(0.5);
    await expect(Math.abs(box.height - 32)).toBeLessThanOrEqual(0.5);
  },
};

export const OnDarkBackground: Story = {
  decorators: [
    (StoryFn) => (
      <div className="sb-bg-strong sb-pad">
        <StoryFn />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Sobre fundo escuro, o contêiner define a cor clara e o logo a herda.",
      },
    },
  },
};
