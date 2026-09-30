import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BellIcon, GearSixIcon, XIcon } from "@phosphor-icons/react";
import { expect, within } from "storybook/test";
import { Logo } from "@/src/components/icons/Logo";
import { Button } from "@/src/components/ui/Button";
import { IconButton, IconButtonLink } from "@/src/components/ui/IconButton";
import { AppHeader } from "./AppHeader";

const meta = {
  title: "UI/AppHeader",
  component: AppHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Cabeçalho das abas e das telas de detalhe: \"Voltar\", título e ações.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="sb-width-393">
        <Story />
      </div>
    ),
  ],
  args: {
    title: "Competições",
  },
  argTypes: {
    title: { control: "text" },
    actions: { control: false },
  },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Raiz de uma aba: só o título. */
export const TabRoot: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Competições" })).toBeVisible();
    await expect(canvas.queryByRole("link", { name: "Voltar" })).not.toBeInTheDocument();
  },
};

/** Feed: o logo no lugar do título e o sino com o ponto de não lidas (N7). */
export const Feed: Story = {
  args: {
    title: <Logo />,
    actions: (
      <IconButtonLink
        href="/notificacoes"
        icon={BellIcon}
        label="Notificações"
        badge={{ description: "há novas" }}
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "LetzPlay" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Notificações, há novas" })).toBeVisible();
  },
};

/** Jogos: título e a ação "Registrar amistoso" (N19). */
export const WithTextAction: Story = {
  args: {
    title: "Jogos",
    actions: <Button variant="ghost">Registrar amistoso</Button>,
  },
};

/** Perfil: o @username e a engrenagem (N8). O `h1` da tela é o nome, no conteúdo: o título vira `p`. */
export const Profile: Story = {
  args: {
    title: "@lucassilva",
    titleAs: "p",
    actions: <IconButtonLink href="/perfil/configuracoes" icon={GearSixIcon} label="Configurações" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("@lucassilva").tagName).toBe("P");
    await expect(canvas.queryByRole("heading", { level: 1 })).toBeNull();
  },
};

/** Tela de detalhe: "Voltar" e o título da entidade. */
export const Detail: Story = {
  args: { title: "Ranking Verão 2026", backHref: "/competicoes" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/competicoes");
    await expect(canvas.getByRole("heading", { level: 1, name: "Ranking Verão 2026" })).toBeVisible();
  },
};

/** Nome longo: o título fica numa linha, com reticências, e as ações não saem da tela. */
export const LongTitle: Story = {
  args: {
    title: "Ranking Arena Beach Point Masculino Categoria B — Temporada Verão 2026",
    backHref: "/competicoes",
    actions: <IconButtonLink href="/notificacoes" icon={BellIcon} label="Notificações" />,
  },
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector("header");
    await expect(header?.scrollWidth).toBeLessThanOrEqual(header?.clientWidth ?? 0);
  },
};

/** Fluxo modal de tarefa (N4): título e "Fechar", sem "Voltar". */
export const ModalTask: Story = {
  args: {
    title: "Lançar resultado",
    actions: <IconButton icon={XIcon} label="Fechar" />,
  },
};
