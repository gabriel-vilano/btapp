import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Stepper } from "./Stepper";

const LABEL = "Games de Lucas e Rafael";

function StatefulStepper(props: ComponentProps<typeof Stepper>) {
  const [value, setValue] = useState(props.value);
  return (
    <Stepper
      {...props}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        props.onValueChange(next);
      }}
    />
  );
}

const meta = {
  title: "UI/Stepper",
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component:
          "Número inteiro ajustado de 1 em 1 entre um mínimo e um máximo, com botões de 48×48 e setas do teclado (APG Spinbutton).",
      },
    },
  },
  args: {
    label: LABEL,
    value: 2,
    min: 0,
    max: 6,
    disabled: false,
    onValueChange: fn(),
  },
  argTypes: {
    label: { control: "text" },
    value: { control: "number" },
    min: { control: "number" },
    max: { control: "number" },
    disabled: { control: "boolean" },
    onValueChange: { table: { disable: true } },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <StatefulStepper {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const spinbutton = canvas.getByRole("spinbutton", { name: LABEL });
    await expect(spinbutton).toHaveAttribute("aria-valuenow", "2");
    await expect(spinbutton).toHaveAttribute("aria-valuemin", "0");
    await expect(spinbutton).toHaveAttribute("aria-valuemax", "6");

    // Regra do DS: cada botão tem 48×48 de área tocável
    const increase = canvas.getByRole("button", { name: `Aumentar ${LABEL}` });
    const box = increase.getBoundingClientRect();
    await expect(box.width).toBe(48);
    await expect(box.height).toBe(48);

    await userEvent.click(increase);
    await expect(spinbutton).toHaveAttribute("aria-valuenow", "3");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(3);

    await userEvent.click(canvas.getByRole("button", { name: `Diminuir ${LABEL}` }));
    await expect(spinbutton).toHaveAttribute("aria-valuenow", "2");

    // Teclado: Tab chega no valor, não nos botões
    await userEvent.tab();
    await expect(spinbutton).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(spinbutton).toHaveAttribute("aria-valuenow", "3");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(spinbutton).toHaveAttribute("aria-valuenow", "1");
    await userEvent.keyboard("{End}");
    await expect(spinbutton).toHaveAttribute("aria-valuenow", "6");
    await userEvent.keyboard("{Home}");
    await expect(spinbutton).toHaveAttribute("aria-valuenow", "0");
  },
};

export const AtMinimum: Story = {
  args: { value: 0 },
  render: (args) => <StatefulStepper {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole("button", { name: `Diminuir ${LABEL}` })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: `Aumentar ${LABEL}` })).toBeEnabled();

    // A seta não passa do limite
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("spinbutton")).toHaveAttribute("aria-valuenow", "0");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const AtMaximum: Story = {
  args: { value: 6 },
  render: (args) => <StatefulStepper {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole("button", { name: `Aumentar ${LABEL}` })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: `Diminuir ${LABEL}` })).toBeEnabled();

    await userEvent.tab();
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("spinbutton")).toHaveAttribute("aria-valuenow", "6");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <StatefulStepper {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const spinbutton = canvas.getByRole("spinbutton", { name: LABEL });
    await expect(spinbutton).toHaveAttribute("aria-disabled", "true");
    await expect(canvas.getByRole("button", { name: `Diminuir ${LABEL}` })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: `Aumentar ${LABEL}` })).toBeDisabled();

    // Fora do Tab: o foco passa direto
    await userEvent.tab();
    await expect(spinbutton).not.toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

// Os dois lados do set interrompido, como no ScoreInput (docs/RESULTS.md §3.4)
export const InterruptedSet: Story = {
  render: () => (
    <div className="sb-width-320">
      <StatefulStepper label="Games de Você e Pedro" value={3} min={0} max={6} onValueChange={() => {}} />
      <StatefulStepper label="Games de Lucas e Rafael" value={2} min={0} max={6} onValueChange={() => {}} />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="sb-width-320">
      <Stepper label="Padrão" value={2} min={0} max={6} onValueChange={() => {}} />
      <Stepper label="No mínimo" value={0} min={0} max={6} onValueChange={() => {}} />
      <Stepper label="No máximo" value={6} min={0} max={6} onValueChange={() => {}} />
      <Stepper label="Desabilitado" value={2} min={0} max={6} disabled onValueChange={() => {}} />
    </div>
  ),
};
