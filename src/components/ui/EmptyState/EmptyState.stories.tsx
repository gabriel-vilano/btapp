import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarBlankIcon, TrophyIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { expect, within } from "storybook/test";
import { Button, ButtonLink } from "@/src/components/ui/Button";
import { EmptyState } from "./EmptyState";

// Copy provisória: a da agenda e a do ranking vêm da spec de navegação (7.2),
// ainda em revisão; a do feed segue o padrão das referências (título + apoio + CTA).
const meta = {
  title: "UI/EmptyState",
  component: EmptyState,
  parameters: {
    docs: {
      description: {
        component:
          "Estado vazio de uma tela ou seção: título, linha de apoio, ícone opcional e uma ação.",
      },
    },
  },
  args: {
    title: "Nenhum jogo agora.",
    description:
      "A próxima rodada do Ranking Praia Norte começa quando o organizador sortear.",
  },
  argTypes: {
    icon: { control: false },
    action: { control: false },
    description: { control: "text" },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: CalendarBlankIcon,
    action: <ButtonLink href="/jogos/amistoso">Registrar amistoso</ButtonLink>,
  },
};

export const AgendaEmpty: Story = {
  args: {
    icon: CalendarBlankIcon,
    title: "Você ainda não está em nenhum ranking.",
    description: "A inscrição é feita pelo organizador do ranking.",
    action: <ButtonLink href="/jogos/amistoso">Registrar amistoso</ButtonLink>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { level: 2, name: "Você ainda não está em nenhum ranking." }),
    ).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Registrar amistoso" })).toBeVisible();
    await expect(canvasElement.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  },
};

export const RankingNoSeason: Story = {
  args: {
    icon: TrophyIcon,
    title: "Temporada encerrada.",
    description:
      "Sua dupla terminou em 3º lugar. A próxima temporada começa quando o organizador abrir as inscrições.",
    action: <ButtonLink href="/ranking">Ver classificação final</ButtonLink>,
  },
};

export const FeedNoFriends: Story = {
  args: {
    icon: UsersThreeIcon,
    title: "Siga jogadores para ver os jogos deles.",
    description: "Resultados, inscrições e mudanças no ranking de quem você segue aparecem aqui.",
    action: <Button>Encontrar jogadores</Button>,
  },
};

export const WithoutIcon: Story = {
  args: {
    action: <ButtonLink href="/jogos/amistoso">Registrar amistoso</ButtonLink>,
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("svg")).toBeNull();
  },
};

export const WithoutAction: Story = {
  args: {
    icon: CalendarBlankIcon,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button")).toBeNull();
    await expect(canvas.queryByRole("link")).toBeNull();
  },
};

export const AllCases: Story = {
  render: () => (
    <div className="sb-stack">
      <EmptyState
        icon={CalendarBlankIcon}
        title="Você ainda não está em nenhum ranking."
        description="A inscrição é feita pelo organizador do ranking."
        action={<ButtonLink href="/jogos/amistoso">Registrar amistoso</ButtonLink>}
      />
      <EmptyState
        icon={TrophyIcon}
        title="Temporada encerrada."
        description="Sua dupla terminou em 3º lugar. A próxima temporada começa quando o organizador abrir as inscrições."
        action={<ButtonLink href="/ranking">Ver classificação final</ButtonLink>}
      />
      <EmptyState
        icon={UsersThreeIcon}
        title="Siga jogadores para ver os jogos deles."
        description="Resultados, inscrições e mudanças no ranking de quem você segue aparecem aqui."
        action={<Button>Encontrar jogadores</Button>}
      />
    </div>
  ),
};
