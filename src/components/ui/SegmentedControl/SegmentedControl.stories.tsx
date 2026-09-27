import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SegmentedControl, type SegmentedControlOption } from "./SegmentedControl";

const H2H_SCOPES: SegmentedControlOption[] = [
  { value: "pairs", label: "Duplas" },
  { value: "players", label: "Jogadores" },
];

const PERIODS: SegmentedControlOption[] = [
  { value: "season", label: "Semestre" },
  { value: "year", label: "Ano" },
  { value: "career", label: "Carreira" },
];

const LONG_LABELS: SegmentedControlOption[] = [
  { value: "upcoming", label: "Próximos jogos" },
  { value: "pending", label: "Pendências de placar" },
  { value: "history", label: "Histórico completo" },
];

type StatefulProps = Omit<ComponentProps<typeof SegmentedControl>, "value" | "onValueChange"> & {
  initialValue: string;
};

function StatefulSegmentedControl({ initialValue, ...props }: StatefulProps) {
  const [value, setValue] = useState(initialValue);
  return <SegmentedControl {...props} value={value} onValueChange={setValue} />;
}

const meta = {
  title: "UI/SegmentedControl",
  component: SegmentedControl,
  parameters: {
    docs: {
      description: {
        component:
          "Escolha única entre 2 a 4 visões da mesma tela, com rádios nativos. Segmentos de 40px com área tocável de 48px; o selecionado é preenchido em grafite.",
      },
    },
  },
  args: {
    label: "Recorte do confronto",
    name: "h2h-scope",
    options: H2H_SCOPES,
    value: "pairs",
    hideLabel: false,
    disabled: false,
    onValueChange: fn(),
  },
  argTypes: {
    options: { control: false },
    onValueChange: { table: { disable: true } },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // Padding para a área tocável, que passa 4px do segmento, caber no viewport do teste
  render: (args) => (
    <div className="sb-pad">
      <StatefulSegmentedControl {...args} initialValue={args.value} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("group", { name: "Recorte do confronto" })).toBeInTheDocument();
    const pairs = canvas.getByRole("radio", { name: "Duplas" });
    const players = canvas.getByRole("radio", { name: "Jogadores" });
    await expect(pairs).toBeChecked();

    // Regra do DS: segmento de 40px com área tocável de 48px
    const segment = canvas.getByText("Jogadores");
    const { top, bottom, left, width, height } = segment.getBoundingClientRect();
    await expect(height).toBe(40);
    const centerX = left + width / 2;
    const option = segment.closest("label");
    await expect(document.elementFromPoint(centerX, top - 3.5)).toBe(option);
    await expect(document.elementFromPoint(centerX, bottom + 3.5)).toBe(option);

    await userEvent.click(segment);
    await expect(players).toBeChecked();

    // Rádio nativo: a seta volta para o segmento anterior
    await userEvent.keyboard("{ArrowLeft}");
    await expect(pairs).toBeChecked();
    await expect(pairs).toHaveFocus();
  },
};

export const ThreeOptions: Story = {
  args: { label: "Período", name: "period", options: PERIODS, value: "season" },
  render: (args) => <StatefulSegmentedControl {...args} initialValue={args.value} />,
  parameters: {
    docs: {
      description: {
        story: "Três segmentos dividem a largura por igual, qualquer que seja o rótulo.",
      },
    },
  },
};

export const HiddenLabel: Story = {
  args: { hideLabel: true, name: "h2h-scope-hidden" },
  render: (args) => <StatefulSegmentedControl {...args} initialValue={args.value} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Recorte do confronto" })).toBeInTheDocument();
  },
};

export const LongLabels: Story = {
  args: { label: "Jogos", name: "games-long", options: LONG_LABELS, value: "pending" },
  render: (args) => <StatefulSegmentedControl {...args} initialValue={args.value} />,
  play: async ({ canvas }) => {
    // Rótulo cortado na tela, inteiro para o leitor de tela
    await expect(canvas.getByRole("radio", { name: "Pendências de placar" })).toBeChecked();
  },
  parameters: {
    docs: {
      description: {
        story: "Rótulo longo demais para o segmento termina em reticências. É o sinal para encurtar o texto, não um estado para usar.",
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="sb-stack">
      <StatefulSegmentedControl
        label="Grupo desabilitado"
        name="disabled-group"
        options={PERIODS}
        initialValue="year"
        disabled
      />
      <StatefulSegmentedControl
        label="Uma opção desabilitada"
        name="disabled-option"
        options={PERIODS.map((option) => ({ ...option, disabled: option.value === "career" }))}
        initialValue="season"
      />
    </div>
  ),
};
