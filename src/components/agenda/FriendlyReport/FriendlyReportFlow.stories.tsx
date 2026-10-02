import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { FriendlyReportFlow } from "./FriendlyReportFlow";
import { FRIENDLY_STORY_NOW, friendlyStoryData } from "./storyFixtures";
import type { SubmitFriendly } from "./submitFriendly";

// A tela ocupa a largura do mobile base de borda a borda, com a própria margem
const mobileFrame: Decorator = (Story) => (
  <div className="sb-width-393">
    <Story />
  </div>
);

// Relógio parado no "agora" das stories e id fixo: o envio acontece na mesma quinta, 9h
const clock = () => FRIENDLY_STORY_NOW;
const createId = () => "story-friendly-new";

/** A revisão e a busca de jogador abrem num portal, fora do canvas da story. */
function findDialog(name: string): Promise<HTMLElement> {
  return screen.findByRole("dialog", { name });
}

/** Escolhe um jogador numa vaga do SidePicker, pela busca. */
async function pickPlayer(canvas: HTMLElement, slot: string, name: string) {
  await userEvent.click(within(canvas).getByRole("button", { name: slot }));
  const search = within(await findDialog(slot));
  await userEvent.type(search.getByRole("searchbox", { name: "Buscar jogador" }), name.split(" ")[0]);
  await userEvent.click(search.getByRole("button", { name: new RegExp(name) }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
}

/** Marca um set completo: quem venceu e os games de quem perdeu (RG12). */
async function pickSet(canvas: HTMLElement, winner: string, loserGames: string) {
  const winners = within(canvas).getByRole("group", { name: "Quem venceu o set?" });
  await userEvent.click(within(winners).getByRole("radio", { name: winner }));
  const games = within(canvas).getByRole("group", { name: /^Games de / });
  await userEvent.click(within(games).getByRole("radio", { name: loserGames }));
}

const networkFailure: SubmitFriendly = () => Promise.reject(new TypeError("Failed to fetch"));

const meta = {
  title: "Agenda/FriendlyReportFlow",
  component: FriendlyReportFlow,
  decorators: [mobileFrame],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Registrar amistoso, modal em tela cheia sobre a aba Jogos: modalidade, lados pelo SidePicker, data e arena, formato, como terminou e o placar, com a revisão numa folha (RESULTS.md §6.1).",
      },
    },
  },
  args: { data: friendlyStoryData(), now: FRIENDLY_STORY_NOW, clock, createId },
  argTypes: {
    data: { control: false },
    clock: { table: { disable: true } },
    submit: { table: { disable: true } },
    createId: { table: { disable: true } },
  },
} satisfies Meta<typeof FriendlyReportFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: "Em branco",
  play: async ({ canvas }) => {
    // Duplas, hoje e o formato padrão de quem nunca lançou amistoso (§6.1)
    await expect(await canvas.findByRole("radio", { name: "Duplas" })).toBeChecked();
    await expect(canvas.getByLabelText("Data do jogo")).toHaveValue("2026-10-01");
    await expect(canvas.getByRole("radio", { name: "1 set de 6" })).toBeChecked();
    // Não há W.O. no amistoso (R44)
    await expect(canvas.queryByRole("radio", { name: "Adversário não veio" })).toBeNull();
    await expect(canvas.getByRole("button", { name: "Revisar resultado" })).toBeDisabled();
  },
};

export const LastFormat: Story = {
  name: "Formato do último amistoso",
  args: { data: friendlyStoryData({ lastFormat: "two_sets_of_6_stb" }) },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("radio", { name: "2 sets de 6 + super tiebreak" })).toBeChecked();
  },
};

export const SinglesSent: Story = {
  name: "Simples: lançar e enviar",
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(await canvas.findByRole("radio", { name: "Simples" }));
    await pickPlayer(canvasElement, "Escolher adversário", "Thiago Mendes");
    await userEvent.type(canvas.getByLabelText("Arena (opcional)"), "Arena Mangaba");
    await pickSet(canvasElement, "Você", "3");
    await expect(canvas.getByRole("region", { name: "Como o placar vai ficar" })).toHaveTextContent("Vitória de você");
    await userEvent.click(canvas.getByRole("button", { name: "Revisar resultado" }));
    const review = within(await findDialog("Revisar amistoso"));
    await expect(review.getByText("Você × Thiago")).toBeVisible();
    await expect(review.getByText("qui, 01/10 · Arena Mangaba · 1 set de 6")).toBeVisible();
    await expect(review.getByText("Fica pendente até Thiago confirmar. Não vale ponto de ranking.")).toBeVisible();
    await userEvent.click(review.getByRole("button", { name: "Enviar resultado" }));
    await expect(await canvas.findByRole("heading", { name: "Amistoso enviado a Thiago" })).toHaveFocus();
    await expect(canvas.getByRole("link", { name: "Voltar para Jogos" })).toHaveAttribute("href", "/jogos");
  },
};

export const DoublesRetired: Story = {
  name: "Duplas: adversário desistiu",
  play: async ({ canvas, canvasElement }) => {
    await expect(await canvas.findByRole("radio", { name: "Duplas" })).toBeChecked();
    await pickPlayer(canvasElement, "Escolher parceiro", "Pedro Henrique");
    await pickPlayer(canvasElement, "Escolher adversário 1", "Thiago Mendes");
    await pickPlayer(canvasElement, "Escolher adversário 2", "André Lima");
    await userEvent.click(canvas.getByRole("radio", { name: "Adversário desistiu" }));
    await userEvent.click(canvas.getByRole("button", { name: "Aumentar Games de vocês" }));
    await userEvent.click(canvas.getByRole("button", { name: "Revisar resultado" }));
    const review = within(await findDialog("Revisar amistoso"));
    await expect(review.getByText("Você e Pedro × Thiago e André")).toBeVisible();
    await expect(review.getByText("Adversário desistiu")).toBeVisible();
    await expect(review.getByText("Fica pendente até Thiago ou André confirmarem. Não vale ponto de ranking.")).toBeVisible();
  },
};

export const NetworkError: Story = {
  name: "Erro de rede no envio",
  args: { submit: networkFailure },
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(await canvas.findByRole("radio", { name: "Simples" }));
    await pickPlayer(canvasElement, "Escolher adversário", "Caio Ferreira");
    await pickSet(canvasElement, "Caio", "4");
    await userEvent.click(canvas.getByRole("button", { name: "Revisar resultado" }));
    const review = within(await findDialog("Revisar amistoso"));
    await userEvent.click(review.getByRole("button", { name: "Enviar resultado" }));
    // O placar não se perde: a revisão continua com ele e oferece tentar de novo (RG8)
    await expect(await review.findByRole("alert")).toHaveTextContent("Não conseguimos enviar");
    await expect(review.getByRole("button", { name: "Tentar de novo" })).toBeEnabled();
    await expect(review.getByText("Vitória de Caio")).toBeVisible();
  },
};
