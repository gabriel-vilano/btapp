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

// Escopos da busca do Explorar (EX5): contagem de 1 dígito, 2 dígitos e acima de 99
const SEARCH_SCOPES: TabItem[] = [
  { value: "players", label: "Jogadores", count: 7, panel: panelText("Jogadores encontrados.") },
  { value: "competitions", label: "Competições", count: 12, panel: panelText("Competições encontradas.") },
  { value: "arenas", label: "Arenas", count: 150, panel: panelText("Arenas encontradas.") },
];

const SEARCH_SCOPE_NAMES = [
  "Jogadores, 7 resultados",
  "Competições, 12 resultados",
  "Arenas, mais de 99 resultados",
];

/** Nenhuma aba corta o próprio texto: o conteúdo cabe na largura da aba. */
function expectNoClippedTab(tabs: HTMLElement[]) {
  for (const tab of tabs) {
    expect(tab.scrollWidth).toBeLessThanOrEqual(tab.clientWidth);
  }
}

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
        story: "Rede de segurança para texto que não cabe: a lista rola na horizontal. Não é padrão de uso; lista longa como as categorias do ranking usa um botão com folha.",
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

export const WithCount: Story = {
  args: {
    label: "Escopo da busca",
    items: SEARCH_SCOPES,
    value: "players",
  },
  render: (args) => (
    <div className="sb-width-393">
      <StatefulTabs {...args} initialValue={args.value} />
    </div>
  ),
  play: async ({ canvas }) => {
    const tabs = SEARCH_SCOPE_NAMES.map((name) => canvas.getByRole("tab", { name }));
    // Acima de 99, a aba mostra "99+"; o número visível fica fora do nome acessível
    await expect(tabs[2]).toHaveTextContent("99+");
    await expect(canvas.getByRole("tabpanel", { name: "Jogadores, 7 resultados" })).toBeVisible();

    // As três cabem a 393px: a lista não rola e nenhuma aba corta o texto
    const tablist = canvas.getByRole("tablist");
    await expect(tablist.scrollWidth).toBeLessThanOrEqual(tablist.clientWidth);
    expectNoClippedTab(tabs);
  },
  parameters: {
    docs: {
      description: {
        story: "Escopos da busca do Explorar a 393px, com contagem de 1 dígito, 2 dígitos e acima de 99.",
      },
    },
  },
};

export const WithCountSingular: Story = {
  args: {
    label: "Escopo da busca",
    items: SEARCH_SCOPES.map((item, index) => ({ ...item, count: [0, 1, 99][index] })),
    value: "players",
  },
  render: (args) => (
    <div className="sb-width-393">
      <StatefulTabs {...args} initialValue={args.value} />
    </div>
  ),
  play: async ({ canvas }) => {
    // Singular só no 1; zero vai no plural, e 99 ainda é o número exato
    await expect(canvas.getByRole("tab", { name: "Jogadores, 0 resultados" })).toBeInTheDocument();
    await expect(canvas.getByRole("tab", { name: "Competições, 1 resultado" })).toBeInTheDocument();
    await expect(canvas.getByRole("tab", { name: "Arenas, 99 resultados" })).toHaveTextContent("99");
  },
  parameters: {
    docs: {
      description: {
        story: "Zero, um e 99: o nome acessível troca para o singular só no 1.",
      },
    },
  },
};

export const WithCountWidest: Story = {
  args: {
    label: "Escopo da busca",
    items: SEARCH_SCOPES.map((item) => ({ ...item, count: 100 })),
    value: "competitions",
  },
  render: (args) => (
    <div className="sb-width-393">
      <StatefulTabs {...args} initialValue={args.value} />
    </div>
  ),
  play: async ({ canvas }) => {
    const tablist = canvas.getByRole("tablist");
    await expect(tablist.scrollWidth).toBeLessThanOrEqual(tablist.clientWidth);
    expectNoClippedTab(canvas.getAllByRole("tab"));
  },
  parameters: {
    docs: {
      description: {
        story: "Pior caso de largura: as três abas com \"99+\" ainda cabem a 393px.",
      },
    },
  },
};

export const WithCountLargeText: Story = {
  args: {
    label: "Escopo da busca",
    items: SEARCH_SCOPES,
    value: "players",
  },
  render: (args) => (
    <div className="sb-width-393 sb-text-200">
      <StatefulTabs {...args} initialValue={args.value} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const tabs = SEARCH_SCOPE_NAMES.map((name) => canvas.getByRole("tab", { name }));
    const tablist = canvas.getByRole("tablist");
    // Texto a 200% (WCAG 1.4.4): a lista rola, e cada aba mantém o texto inteiro
    await expect(tablist.scrollWidth).toBeGreaterThan(tablist.clientWidth);
    expectNoClippedTab(tabs);

    // A última aba, fora da vista, rola para dentro dela ao receber foco
    await userEvent.click(tabs[0]);
    await userEvent.keyboard("{End}");
    await expect(tabs[2]).toHaveFocus();
    const listBox = tablist.getBoundingClientRect();
    await expect(tabs[2].getBoundingClientRect().right).toBeLessThanOrEqual(listBox.right + 1);
  },
  parameters: {
    docs: {
      description: {
        story: "Texto ampliado a 200%: as abas com contagem rolam na horizontal, sem cortar texto.",
      },
    },
  },
};
