import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { expect } from "storybook/test";
import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { STORY_AVATAR_URL } from "@/src/components/ui/Avatar/storyFixtures";
import { ProfileHeader, ProfileHeaderSkeleton, type ProfileHeaderProps } from "./ProfileHeader";
import styles from "./ProfileHeader.stories.module.css";

const LUCAS = { name: "Lucas Silva", username: "lucas", avatar_url: STORY_AVATAR_URL, total_matches: 274 };

// As ações de PF7 (PROFILE.md). O ProfileHeader só recebe o slot: estado e handlers são da página.
const ACTIONS = {
  own: <Button variant="secondary">Editar perfil</Button>,
  notFriends: (
    <Button>
      <Icon icon={PlusIcon} size="sm" weight="bold" /> Adicionar Lucas
    </Button>
  ),
  requestSent: <Button variant="secondary">Pedido enviado</Button>,
  requestReceived: (
    <>
      <Button aria-label="Aceitar pedido de Lucas">Aceitar</Button>
      <Button variant="secondary" aria-label="Recusar pedido de Lucas">
        Recusar
      </Button>
    </>
  ),
  friends: (
    <Button variant="secondary" aria-label="Amigos de Lucas, abrir opções">
      Amigos <Icon icon={CheckIcon} size="sm" weight="bold" />
    </Button>
  ),
};

const DEFAULT_ARGS: ProfileHeaderProps = {
  player: LUCAS,
  friendsCount: 38,
  wins: 182,
  losses: 92,
  action: ACTIONS.notFriends,
};

const NEW_PLAYER: Partial<ProfileHeaderProps> = {
  player: { ...LUCAS, total_matches: 0 },
  friendsCount: 1,
  wins: 0,
  losses: 0,
};

const LONG_NAME_PLAYER = {
  ...LUCAS,
  name: "Maria Eduarda Albuquerque de Vasconcelos Cavalcanti Monteiro",
  username: "mariaeduarda.albuquerque.vasconcelos",
};

const meta = {
  title: "Profile/ProfileHeader",
  component: ProfileHeader,
  parameters: {
    docs: {
      description: {
        component: "Cabeçalho do perfil: avatar, nome, @username, jogos, amigos, cartel e a ação do estado da amizade.",
      },
    },
  },
  args: DEFAULT_ARGS,
  argTypes: { action: { control: false }, player: { control: "object" } },
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Outro jogador, sem amizade: a leitura mais comum de quem veio avaliar o adversário.
export const NotFriends: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Lucas Silva" })).toBeVisible();
    await expect(canvas.getByText("274 jogos")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "38 amigos" })).toHaveAttribute(
      "href",
      "/jogadores/lucas/amigos",
    );
    await expect(canvas.getByText("182 vitórias e 92 derrotas")).toBeInTheDocument();
  },
};

export const OwnProfile: Story = {
  args: { action: ACTIONS.own },
};

export const RequestSent: Story = {
  args: { action: ACTIONS.requestSent },
};

// Aceitar e Recusar lado a lado, com a mesma largura.
export const RequestReceived: Story = {
  args: { action: ACTIONS.requestReceived },
  play: async ({ canvas }) => {
    const accept = canvas.getByRole("button", { name: "Aceitar pedido de Lucas" });
    const decline = canvas.getByRole("button", { name: "Recusar pedido de Lucas" });
    await expect(accept.getBoundingClientRect().width).toBe(decline.getBoundingClientRect().width);
  },
};

export const Friends: Story = {
  args: { action: ACTIONS.friends },
};

// Jogador novo: zeros e o cartel vira "Nenhuma partida ainda".
export const NewPlayer: Story = {
  args: NEW_PLAYER,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("0 jogos")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "1 amigo" })).toBeVisible();
    await expect(canvas.getByText("Nenhuma partida ainda")).toBeVisible();
  },
};

// Nome longo: até 2 linhas e reticências; o @username fica em 1 linha.
export const LongName: Story = {
  args: { player: LONG_NAME_PLAYER },
  play: async ({ canvas }) => {
    const heading = canvas.getByRole("heading", { level: 1 });
    const lineHeight = parseFloat(getComputedStyle(heading).lineHeight);
    await expect(heading.getBoundingClientRect().height).toBeLessThanOrEqual(lineHeight * 2);
  },
};

// Sem foto: o Avatar mostra as iniciais.
export const WithoutPhoto: Story = {
  args: { player: { ...LUCAS, avatar_url: null } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Lucas Silva" })).toHaveTextContent("LS");
  },
};

export const Loading: Story = {
  render: () => <ProfileHeaderSkeleton />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Carregando perfil")).toBeInTheDocument();
  },
};

const GALLERY: Array<{ caption: string; props: ProfileHeaderProps }> = [
  { caption: "Próprio perfil", props: { ...DEFAULT_ARGS, action: ACTIONS.own } },
  { caption: "Outro jogador, sem amizade", props: DEFAULT_ARGS },
  { caption: "Pedido enviado", props: { ...DEFAULT_ARGS, action: ACTIONS.requestSent } },
  { caption: "Pedido recebido", props: { ...DEFAULT_ARGS, action: ACTIONS.requestReceived } },
  { caption: "Amigos", props: { ...DEFAULT_ARGS, action: ACTIONS.friends } },
  { caption: "Jogador novo", props: { ...DEFAULT_ARGS, ...NEW_PLAYER } },
  { caption: "Nome longo", props: { ...DEFAULT_ARGS, player: LONG_NAME_PLAYER } },
  { caption: "Sem foto", props: { ...DEFAULT_ARGS, player: { ...LUCAS, avatar_url: null } } },
];

// Todos os estados lado a lado, como um frame do Figma.
export const Gallery: Story = {
  render: () => (
    <div className={styles.gallery}>
      {GALLERY.map(({ caption, props }) => (
        <section key={caption} aria-label={caption}>
          <p className={styles.gallery__caption}>{caption}</p>
          <ProfileHeader {...props} />
        </section>
      ))}
      <section aria-label="Carregando">
        <p className={styles.gallery__caption}>Carregando</p>
        <ProfileHeaderSkeleton />
      </section>
    </div>
  ),
};
