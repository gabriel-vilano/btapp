import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, waitFor } from "storybook/test";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { mockProfilePages } from "@/src/mocks/profilePage";
import { PlayerNotFound } from "./PlayerNotFound";
import { OwnProfileHeader, ProfilePage, ProfilePageSkeleton, type ProfilePageProps } from "./ProfilePage";
import { ProfileMenu } from "./ProfileMenu";

// Tier 4: uma story por situação do perfil (docs/PROFILE.md §6), sobre os
// mocks do domínio vistos pelo Lucas. O detalhe de cada peça está na story dela
// O cabeçalho é da página: o OwnProfileHeader na aba Perfil; o DetailHeader, com
// o menu ⋯, no perfil de outro. A story não tem a casca: mostra o AppHeader com o
// "Voltar" fixo, para a tela aparecer inteira
const pageHeader: Decorator<ProfilePageProps> = (Story, { args, parameters }) => {
  // Carregando e não encontrado não têm perfil: trazem o próprio cabeçalho
  if (parameters.ownPageHeader) return <Story />;
  const { username, name } = args.data.player;
  return (
    <>
      {args.data.relation === "self" ? (
        <OwnProfileHeader username={username} />
      ) : (
        <AppHeader
          title={`@${username}`}
          titleAs="p"
          backHref="/feed"
          actions={<ProfileMenu username={username} name={name} />}
        />
      )}
      <Story />
    </>
  );
};

/** Carregando e não encontrado: o cabeçalho de detalhe com o título "Perfil". */
const detailHeader: Decorator = (Story) => (
  <>
    <AppHeader title="Perfil" backHref="/feed" />
    <Story />
  </>
);

const meta = {
  title: "Profile/ProfilePage",
  component: ProfilePage,
  decorators: [pageHeader],
  parameters: {
    layout: "fullscreen",
    // "Tentar de novo" usa o router do App Router
    nextjs: { appDirectory: true },
    docs: {
      description: {
        component:
          "Perfil do jogador: cabeçalho, Vocês, Rankings, Partidas recentes e Temporadas, numa rolagem só (PF1).",
      },
    },
  },
  args: { data: mockProfilePages.own },
  argTypes: { data: { control: false } },
} satisfies Meta<typeof ProfilePage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Só os títulos das seções: o EmptyState de "Partidas recentes" também tem um h2
function sectionTitles(canvasElement: HTMLElement): string[] {
  return Array.from(canvasElement.querySelectorAll("section > h2"), (heading) => heading.textContent ?? "");
}

// Próprio perfil: engrenagem, "Editar perfil", "Melhor: 1º" e sem o bloco "Vocês" (PF3)
export const Own: Story = {
  play: async ({ canvas, canvasElement }) => {
    // Um só h1, o nome (PROFILE.md §7); jogos sai da conta do cartel (PF6)
    await expect(canvas.getAllByRole("heading", { level: 1 }).map((h) => h.textContent)).toEqual(["Lucas Silva"]);
    await expect(canvas.getByText("9 jogos")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "Configurações" })).toHaveAttribute("href", "/perfil/configuracoes");
    await expect(canvas.getByRole("link", { name: "Editar perfil" })).toBeVisible();
    await expect(sectionTitles(canvasElement)).toEqual(["Rankings", "Partidas recentes", "Temporadas"]);
    await expect(canvas.getByText(/Melhor: 1º/)).toBeVisible();
    // "Ver todas" do próprio perfil é o Histórico da aba Jogos (PF18)
    await expect(canvas.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "/jogos#historico");
  },
};

// Amigo com H2H: "Vocês" vem antes de "Rankings" (PF1, PF17)
export const Friend: Story = {
  args: { data: mockProfilePages.friend },
  play: async ({ canvas, canvasElement }) => {
    await expect(sectionTitles(canvasElement)).toEqual(["Vocês", "Rankings", "Partidas recentes", "Temporadas"]);
    await expect(canvas.getByRole("link", { name: /Vocês se enfrentaram 3 vezes/ })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Amigos de Pedro, abrir opções" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Ver todas" })).toHaveAttribute(
      "href",
      "/jogadores/pedrohenrique/partidas",
    );
    await expect(canvas.getByText("Saideira")).toBeVisible();
  },
};

// Adversário sem amizade, com o confronto da rodada ainda sem data (PF16)
export const Opponent: Story = {
  args: { data: mockProfilePages.opponent },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /Próximo confronto · Rodada 3/ })).toBeVisible();
    await expect(canvas.getByText("Data a combinar")).toBeVisible();
    await expect(canvas.getByRole("button", { name: /Adicionar Caio/ })).toBeVisible();
  },
};

export const RequestSent: Story = {
  args: { data: mockProfilePages.requestSent },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Pedido enviado para Thiago, abrir opções" })).toBeVisible();
  },
};

export const RequestReceived: Story = {
  args: { data: mockProfilePages.requestReceived },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Aceitar pedido de Thiago" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Recusar pedido de Thiago" })).toBeVisible();
  },
};

// --- Ações de amizade (PF7): com os mocks, a ação muda só a tela ---

// "+ Adicionar" vira "Pedido enviado" sem confirmação; o foco fica no botão e o leitor de tela ouve o aviso
export const AddFriend: Story = {
  args: { data: mockProfilePages.opponent },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: /Adicionar Caio/ }));
    const sent = await canvas.findByRole("button", { name: "Pedido enviado para Caio, abrir opções" });
    await expect(sent).toHaveFocus();
    await expect(canvas.getByRole("status")).toHaveTextContent("Pedido enviado para Caio.");
  },
};

// Cancelar o pedido pede confirmação, com o foco inicial na opção que não desfaz nada
export const CancelRequest: Story = {
  args: { data: mockProfilePages.requestSent },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: /Pedido enviado para Thiago/ }));
    const dialog = await screen.findByRole("dialog", { name: "Cancelar o pedido para Thiago?" });
    await expect(dialog).toHaveAccessibleDescription(/Thiago não recebe aviso/);
    await expect(screen.getByRole("button", { name: "Manter pedido" })).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Cancelar pedido" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(await canvas.findByRole("button", { name: /Adicionar Thiago/ })).toHaveFocus();
  },
};

// Aceitar vira "Amigos ✓" e o número de amigos do Thiago sobe (PF5)
export const AcceptRequest: Story = {
  args: { data: mockProfilePages.requestReceived },
  play: async ({ canvas, userEvent }) => {
    await expect(await canvas.findByRole("link", { name: "1 amigo" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Aceitar pedido de Thiago" }));
    await expect(await canvas.findByRole("button", { name: "Amigos de Thiago, abrir opções" })).toHaveFocus();
    await expect(canvas.queryByRole("button", { name: /Recusar/ })).toBeNull();
    await expect(canvas.getByRole("link", { name: "2 amigos" })).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent("Agora vocês são amigos.");
  },
};

// Recusar não pede confirmação; o botão some, e o foco vai para o que fica
export const DeclineRequest: Story = {
  args: { data: mockProfilePages.requestReceived },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Recusar pedido de Thiago" }));
    await expect(await canvas.findByRole("button", { name: /Adicionar Thiago/ })).toHaveFocus();
    await expect(canvas.getByRole("status")).toHaveTextContent("Pedido de Thiago recusado.");
  },
};

// Desfazer a amizade pede confirmação; confirmado, o número de amigos do Pedro cai
export const Unfriend: Story = {
  args: { data: mockProfilePages.friend },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Amigos de Pedro, abrir opções" }));
    await screen.findByRole("dialog", { name: "Desfazer a amizade com Pedro?" });
    await userEvent.click(screen.getByRole("button", { name: "Desfazer amizade" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(await canvas.findByRole("button", { name: /Adicionar Pedro/ })).toHaveFocus();
    await expect(canvas.getByRole("link", { name: "0 amigos" })).toBeVisible();
  },
};

// "Manter amizade" fecha sem mudar nada
export const KeepFriendship: Story = {
  args: { data: mockProfilePages.friend },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Amigos de Pedro, abrir opções" }));
    await userEvent.click(await screen.findByRole("button", { name: "Manter amizade" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(canvas.getByRole("button", { name: "Amigos de Pedro, abrir opções" })).toHaveFocus();
    await expect(canvas.getByRole("status")).toBeEmptyDOMElement();
  },
};

// Jogador novo visto por outro: só o cabeçalho e "Partidas recentes" vazia, sem CTA (§6.2)
export const NewPlayer: Story = {
  args: { data: mockProfilePages.newPlayer },
  play: async ({ canvas, canvasElement }) => {
    await expect(sectionTitles(canvasElement)).toEqual(["Partidas recentes"]);
    await expect(canvas.getByText("As partidas de Marina aparecem aqui.")).toBeVisible();
    await expect(canvas.queryByRole("link", { name: "Registrar amistoso" })).toBeNull();
  },
};

// O próprio perfil novo: "0 jogos" e o CTA "Registrar amistoso" (§6.2, N19)
export const OwnNew: Story = {
  args: { data: mockProfilePages.ownNew },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Suas partidas confirmadas aparecem aqui.")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Registrar amistoso" })).toHaveAttribute("href", "/jogos/amistoso");
  },
};

// Uma seção que falha mostra o erro só nela; o resto do perfil continua (PF22)
export const SectionError: Story = {
  args: { data: mockProfilePages.sectionError },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText("Não foi possível carregar.")).toHaveLength(2);
    await expect(canvas.getAllByRole("button", { name: "Tentar de novo" })).toHaveLength(2);
    await expect(canvas.getByRole("heading", { level: 2, name: "Temporadas" })).toBeVisible();
  },
};

// Carregando: o cabeçalho da tela na hora e o esqueleto do conteúdo (PF21)
export const Loading: Story = {
  decorators: [detailHeader],
  parameters: { ownPageHeader: true },
  render: () => <ProfilePageSkeleton />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Perfil" })).toBeVisible();
    await expect(canvas.getByText("Carregando perfil")).toBeInTheDocument();
  },
};

// @username inexistente (§6.2)
export const NotFound: Story = {
  decorators: [detailHeader],
  parameters: { ownPageHeader: true },
  render: () => <PlayerNotFound />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Jogador não encontrado")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Voltar ao feed" })).toHaveAttribute("href", "/feed");
  },
};
