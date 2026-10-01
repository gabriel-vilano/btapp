import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { mockCompetitionPage, mockTournamentPage } from "@/src/mocks/competitionPage";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { ToastProvider } from "@/src/components/ui/Toast";
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
      <ToastProvider>
        <AppHeader title={args.data.name} backHref="/competicoes" />
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Página da competição. Ranking: cabeçalho, categorias, temporada e regras. Torneio: cabeçalho, data e local e categorias (EX34). Nos dois, a entrada de admin (N31) e o \"Como se inscrever\" por categoria (EX26 a EX28).",
      },
    },
  },
  args: {
    data: mockCompetitionPage.enrolled,
    now: new Date().toISOString(),
    registerInterest: fn(async () => ({ ok: true })),
  },
  argTypes: { data: { control: false }, now: { control: false }, registerInterest: { control: false } },
} satisfies Meta<typeof CompetitionPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Inscrito em todas as categorias: a posição em cada uma, sem "Como se inscrever" nem admin
export const Enrolled: Story = {
  play: async ({ canvas }) => {
    await canvas.findByRole("region", { name: "Categorias" });
    await expect(canvas.queryByRole("region", { name: "Como se inscrever" })).toBeNull();
    await expect(canvas.queryByRole("link", { name: /Administrar/ })).toBeNull();
    // A organização do cabeçalho leva à página dela (EX23); o tipo vem do dado
    await expect(canvas.getByRole("link", { name: "Arena Mangaba" })).toHaveAttribute("href", "/organizacoes/arenamangaba");
    await expect(canvas.getByText("Ranking")).toBeVisible();
    const categories = within(canvas.getByRole("region", { name: "Categorias" }));
    await expect(categories.getByRole("link", { name: /3º, Ranking Arena Mangaba · Masculino B/ })).toHaveAttribute(
      "href",
      "/ranking/masculino-b",
    );
    // Regra padrão em 1 set de 6: o exemplo é 6/4, pelo matchPoints (RK18)
    await expect(canvas.getByText(/vitória por 6\/4 dá 104 pontos/)).toBeVisible();
  },
};

// Inscrito numa categoria, com outra livre: o "Como se inscrever" compacto, abaixo das
// categorias e sem "Tenho interesse" (EX26, EX27)
export const PartiallyEnrolled: Story = {
  args: { data: mockCompetitionPage.partiallyEnrolled },
  play: async ({ canvas }) => {
    const enrollment = await canvas.findByRole("region", { name: "Como se inscrever" });
    const categories = canvas.getByRole("region", { name: "Categorias" });
    // DOCUMENT_POSITION_FOLLOWING: o bloco vem depois das categorias
    await expect(categories.compareDocumentPosition(enrollment) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await expect(within(enrollment).getByRole("link", { name: "Falar com o organizador" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: /interesse/i })).toBeNull();
  },
};

// Admin: a entrada da área "Administrar"; a regra própria aparece com os valores dela (RK18)
export const Admin: Story = {
  args: { data: mockCompetitionPage.admin },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("link", { name: /Administrar/ })).toHaveAttribute(
      "href",
      "/competicoes/liga-pitanga/administrar",
    );
    await expect(canvas.queryByRole("button", { name: /Lançar sorteio/ })).toBeNull();
    await expect(canvas.getByText("60 pontos, mais 1 por game vencido e menos 1 por game perdido")).toBeVisible();
    await expect(canvas.getByText(/vitória por 6\/4 6\/3 dá 65 pontos/)).toBeVisible();
    await expect(canvas.getByText(/tem 72h para confirmar/)).toBeVisible();
  },
};

// Não inscrito, contato em texto: o bloco completo, antes das categorias; "Tenho
// interesse" registra e desfaz (EX28, EX29)
export const NotEnrolled: Story = {
  args: { data: mockCompetitionPage.notEnrolled },
  play: async ({ args, canvas }) => {
    const region = await canvas.findByRole("region", { name: "Como se inscrever" });
    const categories = canvas.getByRole("region", { name: "Categorias" });
    await expect(region.compareDocumentPosition(categories) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const enrollment = within(region);
    await expect(enrollment.getByText("A inscrição é feita com o organizador.")).toBeVisible();
    await expect(enrollment.getByText("Secretaria do clube: (31) 90000-0003")).toBeVisible();
    await expect(enrollment.queryByRole("link", { name: "Falar com o organizador" })).toBeNull();
    await userEvent.click(enrollment.getByRole("button", { name: "Tenho interesse" }));
    await expect(await enrollment.findByRole("button", { name: "Interesse registrado" })).toBeEnabled();
    await expect(args.registerInterest).toHaveBeenLastCalledWith(true);
    await userEvent.click(enrollment.getByRole("button", { name: "Interesse registrado" }));
    await expect(await enrollment.findByRole("button", { name: "Tenho interesse" })).toBeEnabled();
    await expect(args.registerInterest).toHaveBeenLastCalledWith(false);
    await expect(canvas.getByText("20 jogadores")).toBeVisible();
    await expect(canvas.getByText("Primeira rodada ainda não sorteada")).toBeVisible();
  },
};

// O registro falha: o botão fica como estava e o Toast avisa (EX33)
export const InterestFails: Story = {
  args: { data: mockCompetitionPage.notEnrolled, registerInterest: fn(async () => ({ ok: false })) },
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Tenho interesse" }));
    // O Toast entra com fade: confere o alerta, não a opacidade da animação
    const toast = await canvas.findByText("Não foi possível registrar. Tente de novo.");
    await expect(toast.closest('[role="alert"]')).not.toBeNull();
    await expect(canvas.getByRole("button", { name: "Tenho interesse" })).toBeEnabled();
  },
};

// Já marcou interesse antes: a página abre com o estado registrado
export const Interested: Story = {
  args: { data: mockCompetitionPage.interested },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("button", { name: "Interesse registrado" })).toBeVisible();
  },
};

// Contato em link: vira o botão "Falar com o organizador", que abre fora do app (EX28)
export const ContactWithLink: Story = {
  args: {
    data: { ...mockCompetitionPage.notEnrolled, organizer: mockCompetitionPage.enrolled.organizer },
  },
  play: async ({ canvas }) => {
    const enrollment = within(await canvas.findByRole("region", { name: "Como se inscrever" }));
    const link = enrollment.getByRole("link", { name: "Falar com o organizador" });
    await expect(link).toHaveAttribute("href", "https://wa.me/5531900000001");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  },
};

// Sem contato cadastrado: fica a linha, com o nome que leva à página da organização (EX28)
export const WithoutContact: Story = {
  args: { data: mockCompetitionPage.withoutContact },
  play: async ({ canvas }) => {
    const enrollment = within(await canvas.findByRole("region", { name: "Como se inscrever" }));
    await expect(enrollment.getByText(/A inscrição é feita com o organizador,/)).toBeVisible();
    await expect(enrollment.getByRole("link", { name: "Grupo Saque Curto" })).toHaveAttribute(
      "href",
      "/organizacoes/gruposaquecurto",
    );
    await expect(enrollment.queryByRole("link", { name: "Falar com o organizador" })).toBeNull();
  },
};

// Competição sem temporada em andamento (RK19): as regras continuam na página
export const WithoutSeason: Story = {
  args: { data: mockCompetitionPage.withoutSeason },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Nenhuma temporada em andamento.")).toBeVisible();
    await expect(canvas.getByRole("region", { name: "Regras" })).toBeVisible();
  },
};

// Torneio em andamento, inscrito numa categoria: data e local, a dupla na categoria e o
// "Como se inscrever" compacto para o simples, que está livre (EX26, EX34)
export const TournamentEnrolled: Story = {
  args: { data: mockTournamentPage.enrolled },
  play: async ({ canvas }) => {
    const info = within(await canvas.findByRole("region", { name: "Data e local" }));
    await expect(info.getByText("Arena Tucum · Carandaí/MG")).toBeVisible();
    await expect(canvas.getByText("Torneio")).toBeVisible();
    const categories = within(canvas.getByRole("region", { name: "Categorias" }));
    await expect(categories.getByText("4 duplas · você joga com Rafael")).toBeVisible();
    // A chave é da spec do torneio: a categoria ainda não leva a lugar nenhum
    await expect(categories.queryByRole("link")).toBeNull();
    const enrollment = canvas.getByRole("region", { name: "Como se inscrever" });
    await expect(categories.getByText("4 jogadores")).toBeVisible();
    await expect(canvas.getByRole("region", { name: "Categorias" }).compareDocumentPosition(enrollment) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await expect(canvas.queryByRole("button", { name: /interesse/i })).toBeNull();
    await expect(canvas.queryByRole("region", { name: "Regras" })).toBeNull();
  },
};

// Torneio futuro, não inscrito: o bloco completo no topo, com "Tenho interesse" (EX26, EX27)
export const TournamentNotEnrolled: Story = {
  args: { data: mockTournamentPage.notEnrolled },
  play: async ({ canvas }) => {
    const enrollment = await canvas.findByRole("region", { name: "Como se inscrever" });
    const info = canvas.getByRole("region", { name: "Data e local" });
    await expect(enrollment.compareDocumentPosition(info) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await expect(within(enrollment).getByRole("link", { name: "Falar com o organizador" })).toBeVisible();
    await expect(within(enrollment).getByRole("button", { name: "Tenho interesse" })).toBeEnabled();
    await expect(canvas.getByRole("link", { name: "Federação Vale Azul de Beach Tennis" })).toHaveAttribute(
      "href",
      "/organizacoes/federacaovaleazul",
    );
    await expect(canvas.getByText("20 jogadores")).toBeVisible();
  },
};

// Torneio que já aconteceu: sem "Como se inscrever" nem "Tenho interesse" (EX34)
export const TournamentPast: Story = {
  args: { data: mockTournamentPage.past },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Este torneio já aconteceu.")).toBeVisible();
    await expect(canvas.queryByRole("region", { name: "Como se inscrever" })).toBeNull();
    await expect(canvas.queryByRole("button", { name: /interesse/i })).toBeNull();
    await expect(canvas.getByText("12 duplas")).toBeVisible();
  },
};
