import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SettingsList, SettingsRow } from "./SettingsList";

const meta = {
  title: "Profile/SettingsList",
  component: SettingsRow,
  // Linha de ponta a ponta, como no app: a margem lateral é da própria linha
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "Grupo e linha da tela de configurações: rótulo, valor e navegação (N8)." } },
  },
  decorators: [
    (Story, { parameters }) =>
      parameters.ownLists ? (
        <Story />
      ) : (
        <SettingsList title="Conta">
          <Story />
        </SettingsList>
      ),
  ],
  args: { label: "E-mail", value: "ana.clara@email.com" },
} satisfies Meta<typeof SettingsRow>;

export default meta;
type Story = StoryObj<typeof meta>;

// Só exibe: sem chevron nem alvo de toque.
export const ValueOnly: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Conta" })).toBeVisible();
    await expect(canvas.getByText("ana.clara@email.com")).toBeVisible();
    await expect(canvas.queryByRole("link")).toBeNull();
    await expect(canvas.queryByRole("button")).toBeNull();
  },
};

// Abre outra tela: a linha inteira é o link, com o chevron.
export const Navigates: Story = {
  args: { label: "Telefone para o WhatsApp", value: "Não informado", href: "/perfil/configuracoes/telefone" },
  play: async ({ canvas }) => {
    const link = await canvas.findByRole("link", { name: /Telefone para o WhatsApp/ });
    await expect(link).toHaveAttribute("href", "/perfil/configuracoes/telefone");
  },
};

// Age na própria linha, como o "Sair".
export const Action: Story = {
  args: { label: "Sair", value: undefined, onClick: fn() },
  parameters: { ownLists: true },
  render: (args) => (
    <SettingsList>
      <SettingsRow {...args} />
    </SettingsList>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Sair" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

// Ação em andamento: o spinner anuncia, e o toque repetido não refaz a ação.
export const Pending: Story = {
  args: { label: "Sair", value: undefined, onClick: fn(), pending: true, pendingLabel: "Saindo" },
  parameters: { ownLists: true },
  render: (args) => (
    <SettingsList>
      <SettingsRow {...args} />
    </SettingsList>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await expect(await canvas.findByRole("status")).toHaveTextContent("Saindo");
    await userEvent.click(canvas.getByRole("button", { name: /Sair/ }));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

// E-mail longo a 393px: quebra embaixo do rótulo, sem vazar da tela.
export const LongValue: Story = {
  args: { value: "ana.clara.de.souza.competicoes.beachtennis@provedor-de-email.com.br" },
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByText(/ana\.clara\.de\.souza/);
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

// A tela como fica: o grupo "Conta" e, por último, o "Sair".
export const Screen: Story = {
  parameters: { ownLists: true },
  render: () => (
    <>
      <SettingsList title="Conta">
        <SettingsRow label="E-mail" value="ana.clara@email.com" />
      </SettingsList>
      <SettingsList>
        <SettingsRow label="Sair" onClick={fn()} />
      </SettingsList>
    </>
  ),
};
