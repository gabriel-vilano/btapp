import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { TabBar } from "./TabBar";
import { STORY_NAVIGATION_ITEMS, withAdminBadge } from "./storyFixtures";

const meta = {
  title: "UI/TabBar",
  component: TabBar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Navegação principal no mobile: as 5 abas no rodapé, com badge de contagem e área segura do iOS.",
      },
    },
  },
  args: {
    items: STORY_NAVIGATION_ITEMS,
    currentValue: "feed",
  },
  argTypes: {
    items: { control: false },
    currentValue: {
      control: "inline-radio",
      options: STORY_NAVIGATION_ITEMS.map((item) => item.value),
    },
  },
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("navigation", { name: "Principal" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Feed" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("link", { name: "Jogos, 2 pendências" })).not.toHaveAttribute(
      "aria-current",
    );
    // O avatar é decorativo: o nome da aba é "Perfil", não o nome do jogador
    await expect(canvas.getByRole("link", { name: "Perfil" })).toBeVisible();
  },
};

/**
 * N25: "Competições" cabe inteiro a 393px, em negrito (ativa) e com badge.
 * Mede cada rótulo contra a largura da própria aba, depois de a fonte carregar.
 */
export const LongestLabelAt393: Story = {
  args: { items: withAdminBadge(STORY_NAVIGATION_ITEMS), currentValue: "competicoes" },
  decorators: [
    (Story) => (
      <div className="sb-width-393">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await document.fonts.ready;
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("link", { name: "Competições, 1 pendência de admin" }),
    ).toHaveAttribute("aria-current", "page");

    for (const item of canvasElement.querySelectorAll("li")) {
      const label = within(item).getByText(/^[A-Za-zÀ-ú]+$/);
      const labelWidth = label.getBoundingClientRect().width;
      await expect(labelWidth).toBeLessThanOrEqual(item.getBoundingClientRect().width);
    }
  },
};

export const ProfileCurrent: Story = {
  args: { currentValue: "perfil" },
};

export const ProfileWithoutPhoto: Story = {
  args: {
    currentValue: "perfil",
    items: STORY_NAVIGATION_ITEMS.map((item) =>
      item.avatar ? { ...item, avatar: { ...item.avatar, url: null } } : item,
    ),
  },
};

export const WithoutBadges: Story = {
  args: {
    currentValue: "jogos",
    items: STORY_NAVIGATION_ITEMS.map((item) => ({ ...item, badge: undefined })),
  },
};

/**
 * Menor celular suportado, abaixo da referência de 393px (N25): "Competições" passa
 * um pouco da coluna, mas não corta nem encosta nos rótulos vizinhos.
 */
export const At320: Story = {
  args: { items: withAdminBadge(STORY_NAVIGATION_ITEMS), currentValue: "competicoes" },
  decorators: [
    (Story) => (
      <div className="sb-width-320">
        <Story />
      </div>
    ),
  ],
};
