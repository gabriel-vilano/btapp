import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { List } from "../ListItem";
import { AgendaItem } from "./AgendaItem";

// Textos como a agenda os monta (src/lib/agenda/), um estado por linha da
// tabela 5.2 da docs/NAVIGATION.md.

const lucas = { id: "p-lucas", name: "Lucas Silva", avatarUrl: null };
const rafael = { id: "p-rafael", name: "Rafael Costa", avatarUrl: null };
const pedro = { id: "p-pedro", name: "Pedro Henrique", avatarUrl: null };
const thiago = { id: "p-thiago", name: "Thiago Mendes", avatarUrl: null };

const RANKING = "Ranking Arena Mangaba 2026 · Masculino B · Rodada 3";
const HREF = "/jogos/match-r3-1";

const meta = {
  title: "UI/AgendaItem",
  component: AgendaItem,
  // Item de ponta a ponta, como no app: a margem lateral é do próprio item
  parameters: { layout: "fullscreen" },
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
    ownSide: [lucas, rafael],
    opponentSide: [pedro, thiago],
    context: RANKING,
    situation: "Marcar jogo · rodada fecha em 5 dias",
    badge: null,
    href: HREF,
    action: { label: "Propor horários", href: HREF },
  },
  argTypes: {
    ownSide: { control: "object" },
    opponentSide: { control: "object" },
    action: { control: "object" },
  },
} satisfies Meta<typeof AgendaItem>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Sua vez: com botão ---

// O item e o botão são dois links separados: o toque no item abre a partida,
// o botão faz a ação (5.3).
export const ScheduleMatch: Story = {
  play: async ({ canvas }) => {
    const item = canvas.getByRole("link", { name: /^Lucas e Rafael × Pedro e Thiago/ });
    await expect(item).toHaveAttribute("href", HREF);
    await expect(item).toHaveAccessibleName(
      `Lucas e Rafael × Pedro e Thiago ${RANKING} Marcar jogo · rodada fecha em 5 dias`,
    );
    await expect(canvas.getByRole("link", { name: "Propor horários" })).toHaveAttribute("href", HREF);
  },
};

export const AnswerProposal: Story = {
  args: {
    situation: "Responder proposta · 3 horários",
    action: { label: "Responder proposta", href: HREF },
  },
};

// O único botão que não abre a partida: vai direto ao fluxo de lançar (N16).
export const ReportResult: Story = {
  args: {
    situation: "Lançar resultado",
    action: { label: "Lançar resultado", href: `${HREF}/resultado` },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Lançar resultado" })).toHaveAttribute(
      "href",
      `${HREF}/resultado`,
    );
  },
};

export const ConfirmResult: Story = {
  args: {
    situation: "Confirmar resultado · confirma sozinho em 31h",
    action: { label: "Confirmar", href: HREF },
  },
};

export const ConfirmFriendly: Story = {
  args: {
    context: "Amistoso",
    situation: "Confirmar amistoso",
    action: { label: "Confirmar", href: HREF },
  },
};

// --- Próximos jogos, Aguardando e Histórico: sem botão ---

export const Scheduled: Story = {
  args: { situation: "Sáb, 14h · Arena Tucum", action: null },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("link")).toHaveLength(1);
  },
};

// O selo é texto, não só cor (10.3).
export const Today: Story = {
  args: {
    context: "Copa Tucum de Beach Tennis · Masculino B · Final",
    situation: "Sáb, 9h · Quadra 3",
    badge: "Hoje",
    action: null,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Hoje")).toBeVisible();
  },
};

export const TournamentWithoutTime: Story = {
  args: { context: "Copa Tucum de Beach Tennis · Masculino B", situation: "Horário a definir", action: null },
};

export const ProposalSent: Story = {
  args: { situation: "Proposta enviada · aguardando Pedro e Thiago", action: null },
};

export const AwaitingConfirmation: Story = {
  args: { situation: "Aguardando confirmação · confirma sozinho em 31h", action: null },
};

export const WithAdmin: Story = {
  args: { situation: "Com o admin", action: null },
};

export const Confirmed: Story = {
  args: { context: "Ranking Arena Mangaba 2026 · Masculino B · Rodada 1", situation: "Vitória 6/4 · 104 pts", action: null },
};

export const FriendlyDiscarded: Story = {
  args: { context: "Amistoso", situation: "Descartado", action: null },
};

// --- Casos de borda ---

export const Singles: Story = {
  args: {
    ownSide: [lucas],
    opponentSide: [thiago],
    context: "Amistoso",
    situation: "Confirmar amistoso",
    action: { label: "Confirmar", href: HREF },
  },
};

// Nomes e contexto longos quebram linha em vez de cortar; o selo não encolhe.
export const LongText: Story = {
  args: {
    ownSide: [{ ...lucas, name: "Maximiliano Albuquerque" }, { ...rafael, name: "Bartolomeu Vasconcelos" }],
    opponentSide: [{ ...pedro, name: "Constantino Figueiredo" }, { ...thiago, name: "Anastácio Guimarães" }],
    context: "Circuito Metropolitano de Beach Tennis da Grande Belo Horizonte · Mista C 40+ · Rodada 12",
    situation: "Sáb, 14h · Arena Beach Sports Center Lagoa dos Ingleses · Nova Lima/MG",
    badge: "Hoje",
    action: null,
  },
  parameters: { ownLists: true },
  render: (args) => (
    <div className="sb-width-320">
      <List>
        <AgendaItem {...args} />
      </List>
    </div>
  ),
};

// Galeria: um item de cada seção, como na aba Jogos.
export const Uses: Story = {
  parameters: { ownLists: true },
  render: (args) => (
    <List aria-label="Agenda">
      <AgendaItem {...args} />
      <AgendaItem {...args} situation="Confirmar resultado · confirma sozinho em 31h" action={{ label: "Confirmar", href: HREF }} />
      <AgendaItem {...args} situation="Sáb, 14h · Arena Tucum" badge="Hoje" action={null} />
      <AgendaItem {...args} situation="Proposta enviada · aguardando Pedro e Thiago" action={null} />
      <AgendaItem {...args} context="Amistoso" ownSide={[lucas]} opponentSide={[thiago]} situation="Vitória 6/3" action={null} />
    </List>
  ),
};
