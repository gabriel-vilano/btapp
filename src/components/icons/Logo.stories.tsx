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

// Aceite da PRD-35: caixa em 118,84 × 32 (±0,5px) e texto com folga de 8px de cada lado
const BOX_WIDTH = (208 / 56) * 32;
const MIN_SIDE_GAP = 8;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const logo = await canvas.findByText(brand.name);
    await document.fonts.ready;

    const box = logo.getBoundingClientRect();
    await expect(Math.abs(box.width - BOX_WIDTH)).toBeLessThanOrEqual(0.5);
    await expect(Math.abs(box.height - 32)).toBeLessThanOrEqual(0.5);

    const range = document.createRange();
    range.selectNodeContents(logo);
    const text = range.getBoundingClientRect();
    await expect(text.left - box.left).toBeGreaterThanOrEqual(MIN_SIDE_GAP);
    await expect(box.right - text.right).toBeGreaterThanOrEqual(MIN_SIDE_GAP);
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
