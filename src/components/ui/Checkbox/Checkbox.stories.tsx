import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Checkbox } from "./Checkbox";

const PHONE_CONSENT =
  "Mostrar meu telefone aos adversários e ao meu parceiro enquanto o jogo não acontece, para marcarmos pelo WhatsApp";

function StatefulCheckbox(props: ComponentProps<typeof Checkbox>) {
  const [checked, setChecked] = useState(props.checked);
  return (
    <Checkbox
      {...props}
      checked={checked}
      onCheckedChange={(next) => {
        setChecked(next);
        props.onCheckedChange(next);
      }}
    />
  );
}

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          "Caixa de marcação com rótulo clicável, área tocável de 48px e seleção em grafite. Desmarcada por padrão.",
      },
    },
  },
  args: {
    name: "phone-consent",
    label: PHONE_CONSENT,
    checked: false,
    disabled: false,
    onCheckedChange: fn(),
  },
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "text" },
    label: { control: "text" },
    onCheckedChange: { table: { disable: true } },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <StatefulCheckbox {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const checkbox = canvas.getByRole("checkbox", { name: PHONE_CONSENT });
    await expect(checkbox).not.toBeChecked();

    // Rótulo clicável: tocar no texto marca a caixa
    await userEvent.click(canvas.getByText(PHONE_CONSENT));
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);

    // Regra do DS: a linha tem pelo menos 48px de área tocável
    const row = checkbox.closest("label");
    await expect(row?.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);

    // Teclado: espaço alterna o valor
    await userEvent.keyboard(" ");
    await expect(checkbox).not.toBeChecked();
  },
};

export const Checked: Story = {
  args: { checked: true },
  render: (args) => <StatefulCheckbox {...args} />,
};

export const ShortLabel: Story = {
  args: { label: "Lembrar de mim", name: "remember-me" },
  render: (args) => <StatefulCheckbox {...args} />,
  play: async ({ canvas }) => {
    // Uma linha de texto: a linha tem exatamente 48px
    const row = canvas.getByRole("checkbox").closest("label");
    await expect(row?.getBoundingClientRect().height).toBe(48);
  },
};

export const WithError: Story = {
  args: { error: "Marque a caixa para salvar o telefone." },
  render: (args) => <StatefulCheckbox {...args} />,
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole("checkbox", { name: PHONE_CONSENT });
    await expect(checkbox).toHaveAttribute("aria-invalid", "true");
    await expect(checkbox).toHaveAccessibleDescription("Marque a caixa para salvar o telefone.");
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="sb-stack">
      <Checkbox {...args} name="disabled-unchecked" label="Desabilitado e desmarcado" checked={false} />
      <Checkbox {...args} name="disabled-checked" label="Desabilitado e marcado" checked />
    </div>
  ),
  play: async ({ canvas, userEvent, args }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Desabilitado e desmarcado" });
    await expect(checkbox).toBeDisabled();
    await userEvent.click(canvas.getByText("Desabilitado e desmarcado"));
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="sb-stack">
      <Checkbox name="all-unchecked" label="Desmarcado" checked={false} onCheckedChange={() => {}} />
      <Checkbox name="all-checked" label="Marcado" checked onCheckedChange={() => {}} />
      <Checkbox
        name="all-error"
        label="Com erro"
        checked={false}
        error="Marque a caixa para continuar."
        onCheckedChange={() => {}}
      />
      <Checkbox name="all-disabled" label="Desabilitado" checked={false} disabled onCheckedChange={() => {}} />
      <Checkbox
        name="all-disabled-checked"
        label="Desabilitado e marcado"
        checked
        disabled
        onCheckedChange={() => {}}
      />
    </div>
  ),
};
