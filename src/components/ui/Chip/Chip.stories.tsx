import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { FilterChip } from "./FilterChip";
import { ChoiceChipGroup, type ChoiceChipOption } from "./ChoiceChipGroup";

const CATEGORIES = ["A", "B", "C", "D", "Iniciante"];

const gamesOptions = (max: number): ChoiceChipOption[] =>
  Array.from({ length: max + 1 }, (_, games) => ({
    value: String(games),
    label: String(games),
  }));

const DISPUTE_REASONS: ChoiceChipOption[] = [
  { value: "score", label: "Placar diferente" },
  { value: "winner", label: "Outro vencedor" },
  { value: "not-played", label: "O jogo não aconteceu" },
  { value: "other", label: "Outro" },
];

function StatefulFilterChip(props: ComponentProps<typeof FilterChip>) {
  const [selected, setSelected] = useState(props.selected);
  return <FilterChip {...props} selected={selected} onSelectedChange={setSelected} />;
}

function CategoryFilters() {
  const [category, setCategory] = useState("B");
  return (
    <div role="group" aria-label="Categoria" className="sb-row">
      {CATEGORIES.map((name) => (
        <FilterChip
          key={name}
          selected={category === name}
          onSelectedChange={() => setCategory(name)}
        >
          {name}
        </FilterChip>
      ))}
    </div>
  );
}

type StatefulChoiceProps = Omit<ComponentProps<typeof ChoiceChipGroup>, "value" | "onValueChange"> & {
  initialValue?: string;
};

function StatefulChoiceChipGroup({ initialValue, ...props }: StatefulChoiceProps) {
  const [value, setValue] = useState<string | null>(initialValue ?? null);
  return <ChoiceChipGroup {...props} value={value} onValueChange={setValue} />;
}

const meta = {
  title: "UI/Chip",
  component: FilterChip,
  parameters: {
    docs: {
      description: {
        component:
          "Chip de filtro (botão de alternância) e chip de escolha em grupo de rádio. 40px de altura, área tocável de 48px e seleção com fundo escuro.",
      },
    },
  },
  args: {
    children: "Categoria B",
    selected: false,
    disabled: false,
    onSelectedChange: fn(),
  },
  argTypes: {
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
    onSelectedChange: { table: { disable: true } },
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Filter: Story = {
  // Padding para a área tocável, que passa 4px do chip, caber no viewport do teste
  render: (args) => (
    <div className="sb-pad">
      <StatefulFilterChip {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const chip = canvas.getByRole("button", { name: "Categoria B" });
    await expect(chip).toHaveAttribute("aria-pressed", "false");

    // Regra do DS: área tocável de 48px, mesmo com o chip de 40px
    const { top, bottom, left, width, height } = chip.getBoundingClientRect();
    await expect(height).toBe(40);
    await expect(width).toBeGreaterThanOrEqual(40);
    const centerX = left + width / 2;
    // 3,5px fora do chip de 40px ainda é o chip: a área chega a 48px
    await expect(document.elementFromPoint(centerX, top - 3.5)).toBe(chip);
    await expect(document.elementFromPoint(centerX, bottom + 3.5)).toBe(chip);

    await userEvent.click(chip);
    await expect(chip).toHaveAttribute("aria-pressed", "true");
  },
};

export const FilterSelected: Story = {
  args: { selected: true },
  render: (args) => <StatefulFilterChip {...args} />,
};

export const FilterDisabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="sb-row">
      <FilterChip {...args} selected={false}>
        Categoria A
      </FilterChip>
      <FilterChip {...args} selected>
        Categoria B
      </FilterChip>
    </div>
  ),
};

export const FilterGroup: Story = {
  render: () => <CategoryFilters />,
  parameters: {
    docs: {
      description: {
        story: "Filtro de categoria do ranking: uma categoria por vez, dentro de um `role=\"group\"` com nome.",
      },
    },
  },
};

export const ChoiceGames: Story = {
  render: () => (
    <StatefulChoiceChipGroup
      label="Games de Lucas e Rafael no set 1"
      name="set-1-loser-games"
      options={gamesOptions(6)}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole("group", { name: "Games de Lucas e Rafael no set 1" });
    await expect(group).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("radio", { name: "4" }));
    await expect(canvas.getByRole("radio", { name: "4" })).toBeChecked();

    // Rádio nativo: a seta move a seleção para a próxima opção
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("radio", { name: "5" })).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "5" })).toHaveFocus();
  },
  parameters: {
    docs: {
      description: {
        story: "Games de quem perdeu o set, no set de 6 (0 a 6). Sete chips cabem numa linha em 393px.",
      },
    },
  },
};

export const ChoiceGamesSetOf8: Story = {
  render: () => (
    <StatefulChoiceChipGroup
      label="Games de Lucas e Rafael no set 1"
      name="set-1-loser-games-8"
      options={gamesOptions(8)}
      initialValue="6"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Set de 8 (0 a 8). Nove chips não cabem numa linha em 393px e quebram em duas.",
      },
    },
  },
};

export const ChoiceText: Story = {
  render: () => (
    <StatefulChoiceChipGroup
      label="Por que você está contestando?"
      name="dispute-reason"
      options={DISPUTE_REASONS}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Motivo da contestação: opções em texto no mesmo grupo de rádio.",
      },
    },
  },
};

export const ChoiceHiddenLabel: Story = {
  render: () => (
    <StatefulChoiceChipGroup
      label="Games de Lucas e Rafael no set 1"
      hideLabel
      name="set-1-hidden-label"
      options={gamesOptions(6)}
      initialValue="3"
    />
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("group", { name: "Games de Lucas e Rafael no set 1" }),
    ).toBeInTheDocument();
  },
};

export const ChoiceDisabled: Story = {
  render: () => (
    <div className="sb-stack">
      <StatefulChoiceChipGroup
        label="Grupo desabilitado"
        name="disabled-group"
        options={gamesOptions(6)}
        initialValue="4"
        disabled
      />
      <StatefulChoiceChipGroup
        label="Uma opção desabilitada"
        name="disabled-option"
        options={DISPUTE_REASONS.map((option) => ({
          ...option,
          disabled: option.value === "not-played",
        }))}
      />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="sb-stack">
      <div className="sb-row">
        <FilterChip selected={false} onSelectedChange={() => {}}>
          Filtro
        </FilterChip>
        <FilterChip selected onSelectedChange={() => {}}>
          Filtro selecionado
        </FilterChip>
      </div>
      <ChoiceChipGroup
        label="Escolha em grupo de rádio"
        name="all-variants"
        options={gamesOptions(6)}
        value="4"
        onValueChange={() => {}}
      />
    </div>
  ),
};
