import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, within } from "storybook/test";
import type { RankingMatch } from "@/src/types/domain";
import { ReportResultFlow } from "./ReportResultFlow";
import { STORY_NOW, STORY_PLAYER, rankingStoryData, tournamentStoryData } from "./storyFixtures";
import type { SubmitReport } from "./submitReport";

// A tela ocupa a largura do mobile base de borda a borda, com a própria margem
const mobileFrame: Decorator = (Story) => (
  <div className="sb-width-393">
    <Story />
  </div>
);

// Relógio parado no "agora" das stories: o envio acontece na mesma quinta, 9h
const clock = () => STORY_NOW;

/** A revisão abre num portal, fora do canvas da story. */
async function findReview(): Promise<HTMLElement> {
  return screen.findByRole("dialog", { name: "Revisar resultado" });
}

/** Marca um set completo: quem venceu e os games de quem perdeu (RG12). */
async function pickSet(canvas: HTMLElement, winner: string, loserGames: string, setIndex = 0) {
  const winners = within(canvas).getAllByRole("group", { name: "Quem venceu o set?" });
  await userEvent.click(within(winners[setIndex]).getByRole("radio", { name: winner }));
  const games = within(canvas).getAllByRole("group", { name: /^Games de / });
  await userEvent.click(within(games[setIndex]).getByRole("radio", { name: loserGames }));
}

const networkFailure: SubmitReport = () => Promise.reject(new TypeError("Failed to fetch"));

// O servidor responde que o Thiago, parceiro do Pedro, lançou antes (R13)
const partnerReportedFirst: SubmitReport = async (current) => {
  const report = { result: { type: "wo" as const, winner: "a" as const }, reported_by: STORY_PLAYER.thiago, reported_at: STORY_NOW };
  const updated = { ...(current as RankingMatch), status: "awaiting_confirmation", report } as RankingMatch;
  return { status: "transition_rejected", code: "invalid_status", current: updated };
};

const meta = {
  title: "Agenda/ReportResultFlow",
  component: ReportResultFlow,
  decorators: [mobileFrame],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Lançar o resultado, modal em tela cheia sobre a partida: como terminou, o placar set a set com a prévia e a revisão numa folha (RESULTS.md §3). No torneio, quem lança é o admin (§5.3).",
      },
    },
  },
  args: { data: rankingStoryData(), now: STORY_NOW, clock },
  argTypes: {
    data: { control: false },
    clock: { table: { disable: true } },
    submit: { table: { disable: true } },
  },
} satisfies Meta<typeof ReportResultFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  name: "Ranking: jogo até o fim",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Revisar resultado" })).toBeDisabled();
    await pickSet(canvasElement, "Você e Thiago", "4");
    await expect(canvas.getByRole("region", { name: "Como o placar vai ficar" })).toHaveTextContent("Vitória de vocês");
    await userEvent.click(canvas.getByRole("button", { name: "Revisar resultado" }));
    const review = within(await findReview());
    await expect(review.getByText("Se confirmado: +104 para vocês, +46 para Caio e Diego.")).toBeVisible();
    await expect(review.getByText(/Caio ou Diego têm até sáb, 03\/10, 9h/)).toBeVisible();
    await userEvent.click(review.getByRole("button", { name: "Enviar resultado" }));
    await expect(await canvas.findByRole("heading", { name: "Resultado enviado a Caio e Diego" })).toHaveFocus();
  },
};

export const Retired: Story = {
  name: "Ranking: adversário desistiu",
  args: { data: rankingStoryData({ format: "two_sets_of_6_stb" }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Adversário desistiu" }));
    await userEvent.click(canvas.getByRole("radio", { name: "2º set" }));
    await pickSet(canvasElement, "Caio e Diego", "4");
    await userEvent.click(canvas.getByRole("button", { name: "Aumentar Games de vocês" }));
    await userEvent.click(canvas.getByRole("button", { name: "Revisar resultado" }));
    const review = within(await findReview());
    // O placar real vai no card; o completado, que pontua, só aqui (RG6)
    await expect(review.getByText("Para os pontos, o placar vale como 4/6 6/0 10/0 (STB), completado pelo formato.")).toBeVisible();
  },
};

export const Walkover: Story = {
  name: "Ranking: W.O.",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Adversário não veio" }));
    await expect(canvas.getByText(/W\.O\. vale 100 para quem compareceu e 0 para quem faltou/)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Revisar resultado" }));
    const review = within(await findReview());
    await expect(review.getByText("Se confirmado: +100 para vocês, 0 para Caio e Diego.")).toBeVisible();
  },
};

export const Tournament: Story = {
  name: "Torneio: o admin lança",
  args: { data: tournamentStoryData() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "2 sets de 6 + super tiebreak" }));
    await userEvent.click(canvas.getByRole("radio", { name: "W.O." }));
    // O admin escolhe o vencedor em todos os tipos, sem a RG4
    const winner = within(canvas.getByRole("group", { name: "Quem compareceu?" }));
    await userEvent.click(winner.getByRole("radio", { name: "Caio e Diego" }));
    await userEvent.click(canvas.getByRole("button", { name: "Revisar resultado" }));
    const review = within(await findReview());
    await expect(review.getByText("Vitória de Caio e Diego")).toBeVisible();
    await expect(review.getByText("O resultado vale na hora e aparece no feed.")).toBeVisible();
    await userEvent.click(review.getByRole("button", { name: "Enviar resultado" }));
    await expect(await canvas.findByRole("heading", { name: "Resultado lançado" })).toBeVisible();
  },
};

export const NetworkError: Story = {
  name: "Erro de rede no envio",
  args: { submit: networkFailure },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await pickSet(canvasElement, "Caio e Diego", "5");
    await userEvent.click(canvas.getByRole("button", { name: "Revisar resultado" }));
    const review = within(await findReview());
    await userEvent.click(review.getByRole("button", { name: "Enviar resultado" }));
    // O placar não se perde: a revisão continua com ele e oferece tentar de novo (RG8)
    await expect(await review.findByRole("alert")).toHaveTextContent("Não conseguimos enviar");
    await expect(review.getByRole("button", { name: "Tentar de novo" })).toBeEnabled();
    await expect(review.getByText("Vitória de Caio e Diego")).toBeVisible();
  },
};

export const PartnerReportedFirst: Story = {
  name: "O parceiro lançou antes",
  args: { submit: partnerReportedFirst },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await pickSet(canvasElement, "Você e Thiago", "2");
    await userEvent.click(canvas.getByRole("button", { name: "Revisar resultado" }));
    const review = within(await findReview());
    await userEvent.click(review.getByRole("button", { name: "Enviar resultado" }));
    await expect(await review.findByRole("alert")).toHaveTextContent("Thiago já lançou este resultado.");
    await expect(review.getByRole("link", { name: "Ver a partida" })).toHaveAttribute("href", "/jogos/story-match-r3");
  },
};

export const AlreadyReported: Story = {
  name: "Aberto depois do lançamento do adversário",
  args: {
    data: rankingStoryData({
      status: "awaiting_confirmation",
      report: { result: { type: "wo", winner: "b" }, reported_by: STORY_PLAYER.caio, reported_at: STORY_NOW },
    } as Partial<RankingMatch>),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("Caio já lançou o resultado. Confira e confirme ou conteste.");
    await expect(canvas.queryByRole("button", { name: "Revisar resultado" })).toBeNull();
  },
};

export const NotAdmin: Story = {
  name: "Torneio visto por quem não é admin",
  args: { data: tournamentStoryData(STORY_PLAYER.pedro) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("Só o admin do torneio lança este resultado.");
    await expect(canvas.getByRole("link", { name: "Fechar" })).toHaveAttribute("href", "/jogos/story-match-final");
  },
};
