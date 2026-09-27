import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Tabs, type TabItem } from "./Tabs";

// Respiro entre as abas e o conteúdo, que no app é da tela
const panelText = (text: string) => (
  <div className="sb-pad">
    <p className="sb-prose">{text}</p>
  </div>
);

const PROFILE_SECTIONS: TabItem[] = [
  { value: "overview", label: "Visão geral", panel: panelText("Posição no ranking, categoria e cartel.") },
  { value: "matches", label: "Partidas", panel: panelText("Últimas partidas, com placar e adversários.") },
  { value: "stats", label: "Estatísticas", panel: panelText("Aproveitamento por set e por parceiro.") },
];

const RANKING_CATEGORIES: TabItem[] = [
  { value: "masc-b", label: "Duplas Masculinas B", panel: panelText("Ranking das Duplas Masculinas B.") },
  { value: "fem-c", label: "Duplas Femininas C", panel: panelText("Ranking das Duplas Femininas C.") },
  { value: "mistas-a", label: "Duplas Mistas A", panel: panelText("Ranking das Duplas Mistas A.") },
  { value: "iniciante", label: "Iniciante", panel: panelText("Ranking da categoria Iniciante.") },
];

type StatefulTabsProps = Omit<ComponentProps<typeof Tabs>, "value" | "onValueChange"> & {
  initialValue: string;
};

function StatefulTabs({ initialValue, ...props }: StatefulTabsProps) {
  const [value, setValue] = useState(initialValue);
  return <Tabs {...props} value={value} onValueChange={setValue} />;
}

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Abas de página no padrão Tabs do APG: troca o painel de conteúdo. Setas, Home e End navegam; o indicador da aba ativa é grafite.",
      },
    },
  },
  args: {
    label: "Perfil de Lucas Andrade",
    items: PROFILE_SECTIONS,
    value: "overview",
    onValueChange: fn(),
  },
  argTypes: {
    items: { control: false },
    onValueChange: { table: { disable: true } },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <StatefulTabs {...args} initialValue={args.value} />,
  play: async ({ canvas, userEvent }) => {
    const overview = canvas.getByRole("tab", { name: "Visão geral" });
    const matches = canvas.getByRole("tab", { name: "Partidas" });
    const stats = canvas.getByRole("tab", { name: "Estatísticas" });
    await expect(canvas.getByRole("tablist", { name: "Perfil de Lucas Andrade" })).toBeInTheDocument();
    await expect(overview).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel", { name: "Visão geral" })).toBeVisible();

    // Área tocável de 48px na própria aba
    await expect(overview.getBoundingClientRect().height).toBe(48);

    // Roving tabindex: só a aba selecionada entra na ordem do Tab
    await expect(overview).toHaveAttribute("tabindex", "0");
    await expect(matches).toHaveAttribute("tabindex", "-1");

    // Ativação automática: a seta move o foco e já troca o painel
    await userEvent.click(overview);
    await userEvent.keyboard("{ArrowRight}");
    await expect(matches).toHaveFocus();
    await expect(matches).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel", { name: "Partidas" })).toBeVisible();

    // Setas dão a volta; Home e End vão às pontas
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(overview).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(stats).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(overview).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(stats).toHaveAttribute("aria-selected", "true");

    // Tab sai da lista e vai para o painel
    await userEvent.tab();
    await expect(canvas.getByRole("tabpanel", { name: "Estatísticas" })).toHaveFocus();
  },
};

export const LongLabels: Story = {
  args: {
    label: "Categorias do ranking",
    items: RANKING_CATEGORIES,
    value: "masc-b",
  },
  render: (args) => <StatefulTabs {...args} initialValue={args.value} />,
  play: async ({ canvas, userEvent }) => {
    const last = canvas.getByRole("tab", { name: "Iniciante" });
    const tablist = canvas.getByRole("tablist");
    // Texto inteiro, sem quebra nem reticências: a lista rola
    await expect(tablist.scrollWidth).toBeGreaterThan(tablist.clientWidth);

    await userEvent.click(canvas.getByRole("tab", { name: "Duplas Masculinas B" }));
    await userEvent.keyboard("{End}");
    await expect(last).toHaveFocus();
    // O foco rola a aba para dentro da vista
    const listBox = tablist.getBoundingClientRect();
    await expect(last.getBoundingClientRect().right).toBeLessThanOrEqual(listBox.right + 1);
  },
  parameters: {
    docs: {
      description: {
        story: "Categorias do ranking com nomes longos. Em 393px não cabem: a lista rola na horizontal e a aba cortada na borda indica que há mais.",
      },
    },
  },
};

export const WithDisabledTab: Story = {
  args: {
    items: PROFILE_SECTIONS.map((item) => ({ ...item, disabled: item.value === "matches" })),
  },
  render: (args) => <StatefulTabs {...args} initialValue={args.value} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Visão geral" }));
    await userEvent.keyboard("{ArrowRight}");
    // A seta pula a aba desabilitada
    await expect(canvas.getByRole("tab", { name: "Estatísticas" })).toHaveFocus();
  },
  parameters: {
    docs: {
      description: {
        story: "Aba desabilitada: não recebe foco, e as setas pulam por ela.",
      },
    },
  },
};
