import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { AppShell } from "@/src/components/shell/AppShell";
import { DetailHeader } from "./DetailHeader";

// O "Voltar" depende da casca (a aba marcada, N10), então a story monta o
// AppShell de verdade em volta do cabeçalho, na rota de uma tela de detalhe
const meta = {
  title: "Shell/DetailHeader",
  component: DetailHeader,
  decorators: [
    (Story) => (
      <AppShell badges={{}} profileAvatar={null}>
        <Story />
      </AppShell>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/competicoes/liga-pitanga/administrar" } },
    docs: {
      description: {
        component:
          "Cabeçalho das telas de detalhe. O \"Voltar\" leva à raiz da aba marcada (N10) ou, com `parentHref`, à tela pai.",
      },
    },
  },
  args: { title: "Administrar" },
} satisfies Meta<typeof DetailHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sem tela pai: o "Voltar" vai à raiz da aba marcada, Competições (N10)
export const TabRoot: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/competicoes");
  },
};

// Área "Administrar": o "Voltar" volta à página da competição, a tela pai (N31)
export const ParentScreen: Story = {
  args: { parentHref: "/competicoes/liga-pitanga" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/competicoes/liga-pitanga");
    await expect(canvas.getByRole("heading", { level: 1, name: "Administrar" })).toBeVisible();
  },
};
