import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { OrganizationContact } from "./OrganizationContact";

const meta = {
  title: "UI/OrganizationContact",
  component: OrganizationContact,
  args: {
    contact: "https://wa.me/5531900000001",
    linkLabel: "Falar com Arena Mangaba",
  },
} satisfies Meta<typeof OrganizationContact>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLink: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Falar com Arena Mangaba" });
    await expect(link).toHaveAttribute("href", "https://wa.me/5531900000001");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  },
};

export const WithText: Story = {
  args: { contact: "WhatsApp da recepção: (32) 90000-0002" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("WhatsApp da recepção: (32) 90000-0002")).toBeVisible();
    await expect(canvas.queryByRole("link")).toBeNull();
  },
};

// Um link que não é https (aqui, `javascript:`) aparece como texto, sem botão
export const UnsafeLinkAsText: Story = {
  args: { contact: "javascript:alert(1)" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("javascript:alert(1)")).toBeVisible();
    await expect(canvas.queryByRole("link")).toBeNull();
  },
};

// Sem contato, o componente não renderiza nada: a tela decide o que vai no lugar
export const NoContact: Story = {
  args: { contact: null },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toBeEmptyDOMElement();
  },
};
