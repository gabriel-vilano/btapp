import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, waitFor, within } from "storybook/test";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { MatchScreen } from "./MatchScreen";
import { NOT_PLAYED_MATCH, OUTSIDER_ID, STORY_H2H, STORY_HISTORIES, STORY_NOW, storyData } from "./storyFixtures";

// O cabeçalho é da página (DetailHeader). A story não tem a casca: mostra o
// AppHeader com o "Voltar" fixo, para a tela aparecer inteira
const screenFrame: Decorator = (Story) => (
  <div className="sb-screen-frame">
    <AppHeader title="Confronto" backHref="/jogos" />
    <Story />
  </div>
);

// Relógio parado no "agora" das stories: as ações acontecem na mesma quinta, 9h
const clock = () => STORY_NOW;

let idCount = 0;
const createId = () => `story-new-${++idCount}`;

async function expectNoHorizontalOverflow(canvasElement: HTMLElement): Promise<void> {
  const frame = canvasElement.querySelector<HTMLElement>(".sb-screen-frame");
  if (frame === null) throw new Error("Story sem .sb-screen-frame: use o decorator screenFrame");
  await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
}

/** O Dialog abre num portal, fora do canvas da story. */
async function findDialog(name: string): Promise<HTMLElement> {
  return screen.findByRole("dialog", { name });
}

const meta = {
  title: "Agenda/MatchScreen",
  component: MatchScreen,
  decorators: [screenFrame],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Tela do confronto do ranking com a marcação do jogo: um estado por vez, com as ações dele, e o histórico recolhido abaixo (SCHEDULING.md §6). Vista pelo Pedro, do lado A.",
      },
    },
  },
  args: {
    data: storyData(STORY_HISTORIES.empty),
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

export const NoDate: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("heading", { name: "Jogo sem data" })).toBeInTheDocument();
    await expect(canvas.getByText(/A rodada fecha em 5 dias/)).toBeInTheDocument();
    // Selo em caixa normal, como os outros do app: o DS não tem escala para caixa alta
    await expect(canvas.getByText("Você")).toBeInTheDocument();
    // Regra do DS: cada ação tem pelo menos 48px de área tocável
    for (const name of ["Propor horários", "Informar data combinada"]) {
      const button = canvas.getByRole("button", { name });
      await expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    }
    const whatsApp = canvas.getByRole("link", { name: "Abrir no WhatsApp" });
    await expect(whatsApp.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/\?text=/);
    // Sem nada no histórico, nem o "Histórico da marcação" aparece
    await expect(canvas.queryByText("Histórico da marcação")).not.toBeInTheDocument();
    await expectNoHorizontalOverflow(canvasElement);
  },
};

const H2H_LINK = { name: "Já jogaram 2 vezes, veja o H2H" };

// Porta do H2H no confronto definido, para quem joga a partida (HH16)
export const WithHeadToHead: Story = {
  args: { data: storyData(STORY_HISTORIES.empty, { h2h: STORY_H2H }) },
  play: async ({ canvas, canvasElement }) => {
    const link = await canvas.findByRole("link", H2H_LINK);
    await expect(link).toHaveAttribute("href", STORY_H2H.href);
    await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    // Abaixo dos lados, antes da marcação
    const sides = canvas.getByRole("list", { name: "Lados do confronto" });
    await expect(sides.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await expectNoHorizontalOverflow(canvasElement);
  },
};

export const ProposalAwaitingYou: Story = {
  args: { data: storyData(STORY_HISTORIES.awaitingYou) },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Caio propôs 3 horários" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Marcar jogo" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Nenhum serve, propor outros horários" })).toBeEnabled();
  },
};

export const ProposalAwaitingOtherSide: Story = {
  args: { data: storyData(STORY_HISTORIES.awaitingOtherSide) },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Proposta enviada · aguardando Caio e Diego" })).toBeInTheDocument();
    await expect(canvas.getByText(/Você propôs 3 horários/)).toBeInTheDocument();
    const options = within(canvas.getByRole("list", { name: "Horários propostos" })).getAllByRole("listitem");
    await expect(options).toHaveLength(3);
    await expect(canvas.getByRole("button", { name: "Trocar horários" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "Retirar proposta" })).toBeEnabled();
  },
};

export const Agreed: Story = {
  args: { data: storyData(STORY_HISTORIES.agreed) },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Jogo marcado" })).toBeInTheDocument();
    await expect(canvas.getByText("Sábado, 3 de outubro")).toBeInTheDocument();
    await expect(canvas.getByText(/aceita por Diego/)).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Remarcar" })).toBeEnabled();
  },
};

export const ReportedOutsideTheApp: Story = {
  args: { data: storyData(STORY_HISTORIES.reported) },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Jogo marcado" })).toBeInTheDocument();
    await expect(canvas.getByText(/Informado por Thiago .*combinado fora do app/)).toBeInTheDocument();
  },
};

export const RescheduleReceived: Story = {
  args: { data: storyData(STORY_HISTORIES.rescheduleReceived) },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Diego propôs 2 horários" })).toBeInTheDocument();
    // A data acordada vale até alguém aceitar a remarcação (M13)
    await expect(canvas.getByText(/continua valendo até alguém aceitar/)).toBeInTheDocument();
  },
};

export const DatePassed: Story = {
  args: { data: storyData(STORY_HISTORIES.datePassed) },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "O jogo já passou" })).toBeInTheDocument();
    const launch = canvas.getByRole("link", { name: "Lançar resultado" });
    await expect(launch).toHaveAttribute("href", "/jogos/story-match-r3/resultado");
  },
};

export const FrozenAfterRoundDeadline: Story = {
  args: {
    data: storyData(STORY_HISTORIES.awaitingYou, { match: NOT_PLAYED_MATCH, h2h: STORY_H2H }),
    now: "2026-10-08T12:00:00.000Z",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Marcação encerrada" })).toBeInTheDocument();
    await expect(canvas.getByText(/O admin decide a partida com este histórico/)).toBeInTheDocument();
    // Congelada é só leitura: nenhuma ação da marcação, e o histórico aberto (M1)
    await expect(canvas.queryByRole("button", { name: /Propor|Marcar jogo|Remarcar/ })).not.toBeInTheDocument();
    await expect(canvas.getByRole("list", { name: "Histórico da marcação" })).toBeVisible();
    // A proposta sem aceite cujas opções passaram aparece expirada (M12)
    await expect(canvas.getByText("A proposta de Caio expirou sem aceite.")).toBeInTheDocument();
    // O H2H é porta do confronto definido, não da partida que saiu dele (HH16)
    await expect(canvas.queryByRole("link", H2H_LINK)).not.toBeInTheDocument();
  },
};

export const PublicViewer: Story = {
  args: { data: storyData(STORY_HISTORIES.agreed, { viewerId: OUTSIDER_ID, h2h: STORY_H2H }) },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Sábado, 3 de outubro")).toBeInTheDocument();
    // Quem é de fora vê a data e a arena, nunca as propostas nem o histórico (M18)
    await expect(canvas.queryByText("Histórico da marcação")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    // O botão H2H é dos jogadores da partida (HH16)
    await expect(canvas.queryByRole("link", H2H_LINK)).not.toBeInTheDocument();
  },
};

export const AcceptFlow: Story = {
  args: { data: storyData(STORY_HISTORIES.awaitingYou) },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: /Domingo, 4 de outubro/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Marcar jogo · dom, 4 out, 10h" }));
    await expect(await canvas.findByRole("heading", { name: "Jogo marcado" })).toBeInTheDocument();
    await expect(canvas.getByText("Domingo, 4 de outubro")).toBeInTheDocument();
    await expect(canvas.getByText("10h · Arena Tucum")).toBeInTheDocument();
    await expect(canvas.getByText(/aceita por Pedro/)).toBeInTheDocument();
  },
};

export const ProposeFlow: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Propor horários" }));
    const dialog = within(await findDialog("Propor horários"));

    // Enviar vazio mostra o erro em cada campo, sem fechar o formulário
    await userEvent.click(dialog.getByRole("button", { name: "Enviar proposta" }));
    await expect(dialog.getAllByText("Escolha a data e a hora.")).toHaveLength(2);

    await userEvent.type(dialog.getByLabelText("1º horário"), "2026-10-03T14:00");
    await userEvent.type(dialog.getByLabelText("2º horário"), "2026-10-09T10:00");
    await userEvent.click(dialog.getByRole("button", { name: "Enviar proposta" }));
    // Depois do prazo da rodada não vale (M6)
    await expect(dialog.getByText(/A rodada fecha ter, 06\/10, 23h59/)).toBeInTheDocument();

    await userEvent.clear(dialog.getByLabelText("2º horário"));
    await userEvent.type(dialog.getByLabelText("2º horário"), "2026-10-04T10:00");
    await userEvent.type(dialog.getByLabelText("Arena (opcional)"), "Arena Tucum");
    await userEvent.click(dialog.getByRole("button", { name: "Enviar proposta" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(canvas.getByRole("heading", { name: "Proposta enviada · aguardando Caio e Diego" })).toBeInTheDocument();
    await expect(canvas.getByText("Sábado, 3 de outubro")).toBeInTheDocument();
  },
};

export const WithdrawFlow: Story = {
  args: { data: storyData(STORY_HISTORIES.awaitingOtherSide) },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Retirar proposta" }));
    await expect(await canvas.findByRole("heading", { name: "Jogo sem data" })).toBeInTheDocument();
    // Retirar não apaga: a proposta continua no histórico (M10, M16)
    await userEvent.click(canvas.getByText("Histórico da marcação"));
    await expect(canvas.getByText("retirou a proposta")).toBeInTheDocument();
  },
};

export const ReportFlow: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Informar data combinada" }));
    const dialog = within(await findDialog("Informar data combinada"));
    await userEvent.type(dialog.getByLabelText("Data e hora"), "2026-10-02T19:00");
    await userEvent.click(dialog.getByRole("button", { name: "Informar data" }));
    await expect(await canvas.findByText("Sexta-feira, 2 de outubro")).toBeInTheDocument();
    await expect(canvas.getByText(/Informado por Pedro/)).toBeInTheDocument();
  },
};

const PHONE_ASKED_KEY = "letzplay:whatsapp-phone-asked";

// Sem telefone salvo, o primeiro toque em "Abrir no WhatsApp" pergunta se o
// jogador quer informar (M20). A story limpa a marca antes e depois, para o
// pedido aparecer em toda rodada e não vazar para as outras stories
export const AsksForPhoneOnFirstTap: Story = {
  args: { askForPhone: true },
  beforeEach: () => {
    window.localStorage.removeItem(PHONE_ASKED_KEY);
    return () => window.localStorage.removeItem(PHONE_ASKED_KEY);
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("link", { name: "Abrir no WhatsApp" }));
    const dialog = within(await findDialog("Informar seu telefone?"));
    await expect(dialog.getByRole("link", { name: "Informar telefone" })).toHaveAttribute(
      "href",
      "/perfil/configuracoes/telefone?volta=%2Fjogos%2Fstory-match-r3",
    );
    // A recusa ainda abre o WhatsApp, com a mesma mensagem (M24)
    const skip = dialog.getByRole("link", { name: "Agora não, abrir o WhatsApp" });
    await expect(skip.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/\?text=/);
    await expect(skip).toHaveAttribute("target", "_blank");
    // Uma vez por aparelho: o próximo toque vai direto ao WhatsApp
    await expect(window.localStorage.getItem(PHONE_ASKED_KEY)).not.toBeNull();
    await userEvent.click(dialog.getByRole("button", { name: "Fechar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  },
};
