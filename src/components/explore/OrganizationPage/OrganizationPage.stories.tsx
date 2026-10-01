import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { exploreEntities, mockEntities } from "@/src/mocks/domain";
import { mockOrganizationPage } from "@/src/mocks/explorePage";
import type { OrganizationPageView } from "@/src/lib/domain/explore";
import { OrganizationNotFound } from "./OrganizationNotFound";
import { OrganizationPage } from "./OrganizationPage";

// Tier 4: uma story por caso do cenário do Explorar (EX22): contato em link,
// em texto e sem contato; competição aberta, só entre temporadas e só encerradas
const now = new Date().toISOString();
const { organizations } = exploreEntities;

function pageOf(username: string): OrganizationPageView {
  const page = mockOrganizationPage(username, now);
  if (page === null) throw new Error(`Organização '${username}' não está nos mocks do Explorar`);
  return page;
}

const meta = {
  title: "Explore/OrganizationPage",
  component: OrganizationPage,
  // O cabeçalho é da página (DetailHeader): a story mostra o AppHeader com o "Voltar" fixo
  decorators: [
    (Story, { args }) => (
      <>
        <AppHeader title={`@${args.data.username}`} titleAs="p" backHref="/explorar" />
        <Story />
      </>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Página da organização: cabeçalho, contato e competições. Critérios em `docs/EXPLORE.md`, EX22 a EX24.",
      },
    },
  },
  args: { data: pageOf(mockEntities.organizations.arenaMangaba.username) },
  argTypes: { data: { control: false } },
} satisfies Meta<typeof OrganizationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Arena com ranking em andamento e contato em link: o botão abre fora do app
export const ArenaWithLink: Story = {
  play: async ({ canvas, args }) => {
    await expect(await canvas.findByRole("heading", { level: 1, name: args.data.name })).toBeVisible();
    await expect(canvas.getByText(`Arena · ${args.data.city}`)).toBeVisible();
    const contact = canvas.getByRole("link", { name: `Falar com ${args.data.name}` });
    await expect(contact).toHaveAttribute("target", "_blank");
    const competitions = within(canvas.getByRole("region", { name: "Competições" }));
    await expect(competitions.getByText("Você participa")).toBeVisible();
  },
};

// Clube com contato em texto e só o ranking entre temporadas, que fica na lista
export const ClubBetweenSeasons: Story = {
  args: { data: pageOf(organizations.clubeCajui.username) },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Secretaria do clube: (31) 90000-0003")).toBeVisible();
    await expect(canvas.queryByRole("link", { name: /^Falar com/ })).toBeNull();
    await expect(canvas.getByText("Nenhuma competição aberta agora.")).toBeVisible();
    await expect(canvas.getByText("Entre temporadas")).toBeVisible();
    await expect(canvas.queryByRole("button", { name: /Ver encerradas/ })).toBeNull();
  },
};

// Grupo sem contato cadastrado: o bloco some
export const GroupWithoutContact: Story = {
  args: { data: pageOf(organizations.grupoSaqueCurto.username) },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Grupo · Belo Horizonte")).toBeVisible();
    await expect(canvas.queryByRole("region", { name: "Contato" })).toBeNull();
  },
};

// Só um torneio passado: atrás de "Ver encerradas (1)", que abre e fecha
export const OnlyClosed: Story = {
  args: { data: pageOf(organizations.arenaJenipapo.username) },
  play: async ({ canvas }) => {
    const toggle = await canvas.findByRole("button", { name: "Ver encerradas (1)" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByText("Encerrado")).toBeNull();
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(await canvas.findByText("Encerrado")).toBeVisible();
    await userEvent.click(toggle);
    await expect(canvas.queryByText("Encerrado")).toBeNull();
  },
};

export const NotFound: Story = {
  render: () => <OrganizationNotFound />,
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Organização não encontrada" })).toBeVisible();
  },
};
