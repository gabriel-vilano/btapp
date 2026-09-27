import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  BellIcon,
  CalendarBlankIcon,
  CaretRightIcon,
  LockIcon,
  SignOutIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { expect, fn } from "storybook/test";
import { Avatar, AvatarStack } from "../Avatar";
import { STORY_AVATAR_URL } from "../Avatar/storyFixtures";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { List, ListItem } from "./ListItem";

const chevron = <Icon icon={CaretRightIcon} size="sm" />;

const meta = {
  title: "UI/ListItem",
  component: ListItem,
  // Linha de ponta a ponta, como no app: a margem lateral é do próprio item
  parameters: { layout: "fullscreen" },
  // Cada story vira um item dentro de uma lista; a galeria Uses monta as próprias listas
  decorators: [
    (Story, { parameters }) =>
      parameters.ownLists ? (
        <Story />
      ) : (
        <List>
          <Story />
        </List>
      ),
  ],
  args: {
    leading: <Avatar url={STORY_AVATAR_URL} alt="Lucas Silva" size={40} />,
    title: "Lucas Silva",
    supportingText: "Categoria B · Arena Beira-Mar",
  },
  argTypes: {
    leading: { control: false },
    trailing: { control: false },
  },
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

// Só exibe: nenhum alvo de toque, nenhum state layer.
export const Static: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("link")).toBeNull();
    await expect(canvas.queryByRole("button")).toBeNull();
  },
};

// Navega: a linha inteira é um link, com chevron indicando que leva a outra tela.
// O nome do link não repete o nome do avatar: o leading é decorativo.
export const Navigable: Story = {
  args: { href: "/perfil/lucas", trailing: chevron },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", {
      name: "Lucas Silva Categoria B · Arena Beira-Mar",
    });
    await expect(link).toHaveAttribute("href", "/perfil/lucas");
  },
};

// Age sem navegar (abrir folha, alternar algo): a linha inteira é um botão.
export const Pressable: Story = {
  args: { onClick: fn(), trailing: chevron },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Lucas Silva/ }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const TitleOnly: Story = {
  args: { supportingText: undefined, trailing: chevron, href: "/perfil/lucas" },
};

export const WithIcon: Story = {
  args: {
    leading: <Icon icon={BellIcon} />,
    title: "Notificações",
    supportingText: undefined,
    href: "/configuracoes/notificacoes",
    trailing: chevron,
  },
};

export const WithDoubles: Story = {
  args: {
    leading: (
      <AvatarStack
        size={40}
        items={[
          { id: "a", url: STORY_AVATAR_URL, alt: "Lucas Silva" },
          { id: "b", url: null, alt: "Rafael Costa" },
        ]}
      />
    ),
    title: "Lucas Silva e Rafael Costa",
    supportingText: "Dupla · Categoria B",
  },
};

// Valor à direita: pontos no ranking, placar, contagem.
export const TrailingValue: Story = {
  args: { trailing: "1.240 pts" },
};

// Ação à direita: a linha fica estática e o botão é o único alvo.
export const TrailingAction: Story = {
  args: {
    title: "Rafael Costa",
    leading: <Avatar url={null} alt="Rafael Costa" size={40} />,
    supportingText: "Propôs 3 horários para o jogo da rodada 4",
    trailing: <Button variant="secondary">Responder</Button>,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("button")).toHaveLength(1);
    await expect(canvas.queryByRole("link")).toBeNull();
  },
};

// Texto longo quebra linha em vez de cortar; leading e trailing não encolhem.
export const LongText: Story = {
  args: {
    title: "Maria Eduarda Albuquerque de Vasconcelos e Ana Beatriz Figueiredo",
    supportingText: "Sábado, 12 de outubro · 18h · Arena Beira-Mar, quadra 3 (coberta)",
    trailing: "1.240 pts",
  },
};

// Dado faltando: sem leading nem apoio, a linha continua com 48px de altura mínima.
export const MissingData: Story = {
  args: { leading: undefined, supportingText: undefined, title: "Sair da conta" },
};

// Galeria dos usos previstos, lado a lado, na largura do app.
export const Uses: Story = {
  parameters: { ownLists: true },
  render: () => (
    <div>
      <List aria-label="Próximos jogos">
        <ListItem
          href="/jogos/1"
          leading={<Icon icon={CalendarBlankIcon} />}
          title="vs. Rafael Costa e Bruno Lima"
          supportingText="Sáb, 12/10 · 18h · Arena Beira-Mar"
          trailing={chevron}
        />
        <ListItem
          leading={<Avatar url={null} alt="Pedro Alves" size={40} />}
          title="Pedro Alves"
          supportingText="Lançou 6/4 6/3. Confirme o placar"
          trailing={<Button variant="secondary">Confirmar</Button>}
        />
      </List>
      <List aria-label="Configurações" divided>
        <ListItem href="/perfil/editar" leading={<Icon icon={UserIcon} />} title="Editar perfil" trailing={chevron} />
        <ListItem href="/senha" leading={<Icon icon={LockIcon} />} title="Alterar senha" trailing={chevron} />
        <ListItem onClick={fn()} leading={<Icon icon={SignOutIcon} />} title="Sair" />
      </List>
    </div>
  ),
};
