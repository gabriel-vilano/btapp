import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { mockCompetitionPage } from "@/src/mocks/competitionPage";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { CompetitionPage } from "./CompetitionPage";

// Tier 4: uma story por relação de quem vê com a competição (RANKING.md RK17,
// NAV N31 e N33), para ver a composição inteira; o detalhe das peças do DS
// está na story de cada uma
const meta = {
  title: "Competitions/CompetitionPage",
  component: CompetitionPage,
  // O cabeçalho é da página (DetailHeader). A story não tem a casca: mostra o
  // AppHeader com o "Voltar" fixo, para a tela aparecer inteira
  decorators: [
    (Story, { args }) => (
      <>
        <AppHeader title={args.data.name} backHref="/competicoes" />
        <Story />
      </>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Página da competição de ranking: cabeçalho, categorias, temporada e regras, com os blocos de admin (N31) e de quem não está inscrito (N33).",
      },
    },
  },
  args: { data: mockCompetitionPage.enrolled, now: new Date().toISOString() },
  argTypes: { data: { control: false }, now: { control: false } },
} satisfies Meta<typeof CompetitionPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Inscrito: a posição em cada categoria, sem "Como se inscrever" nem admin
export const Enrolled: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("region", { name: "Como se inscrever" })).toBeNull();
    await expect(canvas.queryByRole("link", { name: /Administrar/ })).toBeNull();
    const categories = within(canvas.getByRole("region", { name: "Categorias" }));
    await expect(categories.getByRole("link", { name: /3º, Ranking Arena Mangaba · Masculino B/ })).toHaveAttribute(
      "href",
      "/ranking/masculino-b",
    );
    // Regra padrão em 1 set de 6: o exemplo é 6/4, pelo matchPoints (RK18)
    await expect(canvas.getByText(/vitória por 6\/4 dá 104 pontos/)).toBeVisible();
  },
};

// Admin: a entrada da área "Administrar"; a regra própria aparece com os valores dela (RK18)
export const Admin: Story = {
  args: { data: mockCompetitionPage.admin },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /Administrar/ })).toHaveAttribute(
      "href",
      "/competicoes/liga-pitanga/administrar",
    );
    await expect(canvas.queryByRole("button", { name: /Lançar sorteio/ })).toBeNull();
    await expect(canvas.getByText("60 pontos, mais 1 por game vencido e menos 1 por game perdido")).toBeVisible();
    await expect(canvas.getByText(/vitória por 6\/4 6\/3 dá 65 pontos/)).toBeVisible();
    await expect(canvas.getByText(/tem 72h para confirmar/)).toBeVisible();
  },
};

// Não inscrito: contato só em texto, "Tenho interesse" registra e desfaz (N33)
export const NotEnrolled: Story = {
  args: { data: mockCompetitionPage.notEnrolled },
  play: async ({ canvas }) => {
    const enrollment = within(canvas.getByRole("region", { name: "Como se inscrever" }));
    await expect(enrollment.getByText(/Procure o Carlos/)).toBeVisible();
    await expect(enrollment.queryByRole("link", { name: "Falar com o organizador" })).toBeNull();
    const toggle = enrollment.getByRole("button", { name: "Tenho interesse" });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAccessibleName("Interesse registrado");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAccessibleName("Tenho interesse");
    await expect(canvas.getByText("20 jogadores")).toBeVisible();
    await expect(canvas.getByText("Primeira rodada ainda não sorteada")).toBeVisible();
  },
};

// Já marcou interesse antes: a página abre com o estado registrado
export const Interested: Story = {
  args: { data: mockCompetitionPage.interested },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Interesse registrado" })).toBeVisible();
  },
};

// Contato com link: vira o botão que abre fora do app
export const ContactWithLink: Story = {
  args: {
    data: { ...mockCompetitionPage.enrolled, categories: mockCompetitionPage.notEnrolled.categories },
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Falar com o organizador" });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  },
};

// Sem contato cadastrado: fica só a linha com o organizador
export const WithoutContact: Story = {
  args: { data: mockCompetitionPage.withoutContact },
};

// Competição sem temporada em andamento (RK19): as regras continuam na página
export const WithoutSeason: Story = {
  args: { data: mockCompetitionPage.withoutSeason },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Nenhuma temporada em andamento.")).toBeVisible();
    await expect(canvas.getByRole("region", { name: "Regras" })).toBeVisible();
  },
};
