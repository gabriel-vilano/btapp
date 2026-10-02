import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { mockH2HPages } from "@/src/mocks/h2hPage";
import { H2HLoadError } from "./H2HLoadError";
import { H2HNotFound } from "./H2HNotFound";
import { H2HPage, H2HPageSkeleton } from "./H2HPage";

// Tier 4: uma story por situação da página (docs/HEAD_TO_HEAD.md §6), sobre os
// mocks do domínio vistos pelo Lucas. O detalhe de cada bloco está na story dele.
// A story não tem a casca: mostra o AppHeader com o "Voltar" fixo, para a tela
// aparecer inteira
const detailHeader: Decorator = (Story) => (
  <>
    <AppHeader title="H2H" titleAs="p" backHref="/feed" />
    <Story />
  </>
);

const meta = {
  title: "H2H/H2HPage",
  component: H2HPage,
  decorators: [detailHeader],
  parameters: {
    layout: "fullscreen",
    // "Tentar de novo" usa o router do App Router
    nextjs: { appDirectory: true },
    docs: {
      description: {
        component: "Página de H2H: lados, resumo, forma recente, no ranking, confrontos e pares cruzados (HH8).",
      },
    },
  },
  args: { view: mockH2HPages.doubles },
  argTypes: { view: { control: false } },
} satisfies Meta<typeof H2HPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Só os títulos das seções: o EmptyState também tem um h2
function sectionTitles(canvasElement: HTMLElement): string[] {
  return Array.from(canvasElement.querySelectorAll("section > h2"), (heading) => heading.textContent ?? "");
}

// Dupla × dupla de quem vê: todas as seções, na ordem da HH8
export const Doubles: Story = {
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByRole("heading", { level: 1, name: "Lucas e Rafael × Pedro e Thiago" });
    await expect(sectionTitles(canvasElement)).toEqual([
      "Forma recente",
      "No ranking",
      "Confrontos",
      "Jogador contra jogador",
    ]);
    await expect(canvas.getByText(/Vocês venceram 3, Pedro e Thiago venceram 1, em 4 jogos/)).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: /Lucas × Pedro/ })).toHaveAttribute("href", "/h2h/lucassilva/pedrohenrique");
  },
};

// Jogador × jogador: com quem cada um jogou, sem "No ranking" nem pares (HH3, HH13)
export const Players: Story = {
  args: { view: mockH2HPages.players },
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByRole("heading", { level: 1, name: "Lucas × Pedro" });
    await expect(sectionTitles(canvasElement)).toEqual(["Forma recente", "Confrontos"]);
    await expect(canvas.getAllByText("com Rafael, contra Pedro e Thiago").length).toBeGreaterThan(0);
  },
};

// Quem vê não está em nenhum lado: os textos usam os nomes (HH6)
export const ThirdParty: Story = {
  args: { view: mockH2HPages.thirdParty },
  play: async ({ canvas }) => {
    await canvas.findByRole("heading", { level: 1, name: "Rafael × Thiago" });
    await expect(canvas.getByText(/^Rafael venceu 3 · Último/)).toBeInTheDocument();
  },
};

// Um confronto só: sem barra (§6.1)
export const OneMatch: Story = {
  args: { view: mockH2HPages.oneMatch },
};

// Empate: a barra dividida ao meio (§6.1)
export const Tie: Story = {
  args: { view: mockH2HPages.tie },
};

// Nunca se enfrentaram: o vazio, e a forma recente continua (§6.1)
export const NeverMet: Story = {
  args: { view: mockH2HPages.neverMet },
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByRole("heading", { level: 2, name: "Vocês ainda não se enfrentaram." });
    await expect(sectionTitles(canvasElement)).toEqual(["Forma recente"]);
  },
};

// Forma recente e "No ranking" falham sozinhas; o resto continua (HH22)
export const SectionError: Story = {
  args: { view: mockH2HPages.sectionError },
  play: async ({ canvas }) => {
    await expect(await canvas.findAllByText("Não foi possível carregar.")).toHaveLength(2);
    await expect(canvas.getByRole("heading", { level: 2, name: "Confrontos" })).toBeVisible();
  },
};

// Carregando: o cabeçalho na hora e o esqueleto do conteúdo (HH21)
export const Loading: Story = {
  render: () => <H2HPageSkeleton />,
};

// Lados e resumo falharam: o erro ocupa a tela (HH22)
export const LoadError: Story = {
  render: () => <H2HLoadError onRetry={() => {}} />,
};

// @username inexistente, lados iguais ou dupla que nunca existiu (§6.1)
export const NotFound: Story = {
  render: () => <H2HNotFound />,
  play: async ({ canvas }) => {
    await canvas.findByText("H2H não encontrado");
    await expect(canvas.getByRole("link", { name: "Voltar ao feed" })).toHaveAttribute("href", "/feed");
  },
};
