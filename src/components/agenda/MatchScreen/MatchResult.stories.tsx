import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, waitFor, within } from "storybook/test";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { MatchScreen } from "./MatchScreen";
import { RESULT_MATCHES } from "./resultStoryFixtures";
import { OUTSIDER_ID, STORY_HISTORIES, STORY_NOW, storyData } from "./storyFixtures";

// O resultado na tela do confronto (docs/RESULTS.md §4), vista pelo Pedro, do
// lado A. As stories da marcação ficam em MatchScreen.stories.tsx.
const screenFrame: Decorator = (Story) => (
  <div className="sb-screen-frame">
    <AppHeader title="Confronto" backHref="/jogos" />
    <Story />
  </div>
);

// Relógio parado no "agora" das stories: as ações acontecem na mesma quinta, 9h
const clock = () => STORY_NOW;
const createId = () => "story-new";

/** O Dialog abre num portal, fora do canvas da story. */
async function findDialog(name: string): Promise<HTMLElement> {
  return screen.findByRole("dialog", { name });
}

const meta = {
  title: "Agenda/MatchResult",
  component: MatchScreen,
  decorators: [screenFrame],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Seção do resultado na tela do confronto: o estado do lançamento, a resposta do lado adversário (confirmar ou contestar), o desfazer de quem lançou e o histórico (RESULTS.md §4). Vista pelo Pedro, do lado A.",
      },
    },
  },
  args: {
    data: storyData(STORY_HISTORIES.empty, { match: RESULT_MATCHES.awaitingYou }),
    now: STORY_NOW,
    clock,
    createId,
  },
  argTypes: {
    data: { control: false },
    clock: { table: { disable: true } },
    createId: { table: { disable: true } },
  },
} satisfies Meta<typeof MatchScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

const withMatch = (match: (typeof RESULT_MATCHES)[keyof typeof RESULT_MATCHES], overrides = {}) => ({
  data: storyData(STORY_HISTORIES.empty, { match, ...overrides }),
});

export const AwaitingYourAnswer: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Caio lançou o resultado" })).toBeInTheDocument();
    await expect(canvas.getByText("Vitória de Caio e Diego")).toBeInTheDocument();
    await expect(canvas.getByText(/^Se confirmado: \+\d+ para vocês, \+\d+ para Caio e Diego\.$/)).toBeInTheDocument();
    // Prazo em contagem e em data absoluta, lado a lado (RG9)
    await expect(canvas.getByText(/Confirma sozinho/)).toHaveTextContent("Confirma sozinho em 36h (sex, 02/10, 21h10)");
    // Confirmar vem antes de contestar e é a primária (RG10)
    const [confirm, contest] = within(canvas.getByRole("region", { name: "Resultado" })).getAllByRole("button");
    await expect(confirm).toHaveAccessibleName("Confirmar");
    await expect(contest).toHaveAccessibleName("Contestar");
    for (const button of [confirm, contest]) {
      await expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    }
    // Com o resultado lançado, a marcação vira registro
    await expect(canvas.getByRole("heading", { name: "Marcação encerrada" })).toBeInTheDocument();
  },
};

export const UrgentDeadline: Story = {
  args: withMatch(RESULT_MATCHES.awaitingYouUrgent),
  play: async ({ canvas }) => {
    const countdown = await canvas.findByText("em 13h");
    // Nas últimas 24h, só a contagem ganha a cor de atenção (RG9)
    await expect(getComputedStyle(countdown).color).toBe("rgb(213, 11, 11)");
    await expect(getComputedStyle(canvas.getByText(/Confirma sozinho/)).color).not.toBe("rgb(213, 11, 11)");
  },
};

export const DeadlinePassed: Story = {
  args: withMatch(RESULT_MATCHES.awaitingExpired),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/O prazo de resposta acabou em/)).toBeInTheDocument();
    // Depois do prazo, a resposta não vale mais (R14)
    await expect(canvas.queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Contestar" })).not.toBeInTheDocument();
  },
};

export const ConfirmFlow: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Confirmar" }));
    const title = await canvas.findByRole("heading", { name: "Resultado confirmado" });
    // O botão sumiu com o estado antigo: o foco vai para o estado novo
    await waitFor(() => expect(title).toHaveFocus());
    await expect(canvas.getByText(/^Confirmado por você · qui, 01\/10, 9h$/)).toBeInTheDocument();
    await userEvent.click(canvas.getByText("Histórico do resultado"));
    await expect(canvas.getByText("confirmou o resultado")).toBeInTheDocument();
  },
};

export const ContestFlow: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Contestar" }));
    const dialog = within(await findDialog("Contestar o resultado"));
    await expect(dialog.getByText(/vai para o admin do Ranking Arena Mangaba 2026/)).toBeInTheDocument();

    // O motivo é obrigatório (RG15)
    await userEvent.click(dialog.getByRole("button", { name: "Contestar resultado" }));
    await expect(dialog.getByText("Escolha o motivo da contestação.")).toBeInTheDocument();

    // Com "placar diferente", o placar lembrado aparece, e é opcional
    await userEvent.click(dialog.getByRole("radio", { name: "Placar diferente" }));
    await expect(dialog.getByText(/informe o placar que você lembra/)).toBeInTheDocument();
    await userEvent.click(dialog.getByRole("button", { name: "Contestar resultado" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(await canvas.findByRole("heading", { name: "Você contestou o resultado" })).toBeInTheDocument();
    await expect(canvas.getByText("Em arbitragem")).toBeInTheDocument();
    await expect(canvas.getByText(/Motivo: placar diferente/)).toBeInTheDocument();
  },
};

export const YouReported: Story = {
  args: withMatch(RESULT_MATCHES.awaitingOtherSide),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Aguardando Caio ou Diego" })).toBeInTheDocument();
    await expect(canvas.getByText(/^Você lançou /)).toBeInTheDocument();
    await expect(canvas.getByText(/Sem resposta, confirma sozinho/)).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument();
    // O desfazer fica num menu, fora do caminho principal (RG16)
    await expect(canvas.getByRole("button", { name: "Mais opções do resultado" })).toBeInTheDocument();
  },
};

export const UndoFlow: Story = {
  args: withMatch(RESULT_MATCHES.awaitingOtherSide),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Mais opções do resultado" }));
    const menu = within(await findDialog("Opções do resultado"));
    await userEvent.click(menu.getByRole("button", { name: "Desfazer lançamento" }));

    // Pede confirmação antes de valer
    const confirm = within(await findDialog("Desfazer o lançamento?"));
    await userEvent.click(confirm.getByRole("button", { name: "Desfazer lançamento" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(await canvas.findByRole("heading", { name: "Lançamento desfeito" })).toBeInTheDocument();
    // A partida volta a Confronto definido: a marcação volta a valer
    await expect(canvas.getByRole("heading", { name: "Jogo sem data" })).toBeInTheDocument();
    await userEvent.click(canvas.getByText("Histórico do resultado"));
    await expect(canvas.getByText("desfez o lançamento")).toBeInTheDocument();
  },
};

export const PartnerReported: Story = {
  args: withMatch(RESULT_MATCHES.awaitingPartner),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Aguardando Caio ou Diego" })).toBeInTheDocument();
    await expect(canvas.getByText(/^Thiago lançou /)).toBeInTheDocument();
    // O parceiro de quem lançou não responde nem desfaz (R13, RG16)
    await expect(canvas.queryByRole("button", { name: "Mais opções do resultado" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument();
  },
};

export const InArbitration: Story = {
  args: withMatch(RESULT_MATCHES.inArbitration),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Você contestou o resultado" })).toBeInTheDocument();
    await expect(canvas.getByText(/Placar lembrado por quem contestou: 7\/5 para Pedro e Thiago/)).toBeInTheDocument();
  },
};

export const ConfirmedByOpponent: Story = {
  args: withMatch(RESULT_MATCHES.confirmedByOpponent),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Resultado confirmado" })).toBeInTheDocument();
    await expect(canvas.getByText("Vitória de vocês")).toBeInTheDocument();
    await expect(canvas.getByText(/^Confirmado por Diego · /)).toBeInTheDocument();
  },
};

export const ConfirmedByDeadline: Story = {
  args: withMatch(RESULT_MATCHES.confirmedByDeadline),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/^Confirmado pelo prazo, sem resposta · /)).toBeInTheDocument();
  },
};

export const CorrectedByAdmin: Story = {
  args: withMatch(RESULT_MATCHES.confirmedByAdminCorrected),
  play: async ({ canvas, userEvent }) => {
    await expect(await canvas.findByText("Corrigido")).toBeInTheDocument();
    // Todo ato do admin aparece com o nome e o momento (RG11)
    await expect(canvas.getByText(/^Definido por Ana \(admin\) · /)).toBeInTheDocument();
    await expect(canvas.getByText(/^Placar corrigido por Ana \(admin\) · /)).toBeInTheDocument();
    await userEvent.click(canvas.getByText("Histórico do resultado"));
    const history = within(canvas.getByRole("list", { name: "Histórico do resultado" }));
    await expect(history.getAllByRole("listitem")).toHaveLength(3);
    await expect(history.getByText("corrigiu o placar")).toBeInTheDocument();
  },
};

export const Annulled: Story = {
  args: withMatch(RESULT_MATCHES.annulled),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Resultado anulado pelo admin" })).toBeInTheDocument();
    await expect(canvas.getByText(/^Ana \(admin\) · /)).toBeInTheDocument();
  },
};

export const Undone: Story = {
  args: withMatch(RESULT_MATCHES.undone),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Lançamento desfeito" })).toBeInTheDocument();
    await expect(canvas.getByText(/^Você desfez o lançamento /)).toBeInTheDocument();
  },
};

export const PublicViewer: Story = {
  args: withMatch(RESULT_MATCHES.awaitingYou, { viewerId: OUTSIDER_ID }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Resultado lançado" })).toBeInTheDocument();
    // Quem é de fora vê o placar, sem pontos previstos, ações nem histórico
    await expect(canvas.queryByText(/Se confirmado/)).not.toBeInTheDocument();
    await expect(canvas.queryByText("Histórico do resultado")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
