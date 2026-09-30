import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, waitFor, within } from "storybook/test";
import type { RankingScreenContent } from "@/src/lib/domain/ranking-screen";
import { RankingScreen } from "./RankingScreen";
import {
  STORY_HEADER,
  STORY_LINKS,
  STORY_NOW,
  STORY_VIEWER_ID,
  storyModel,
  storyTable,
  storyUnranked,
} from "./storyFixtures";

// Tier 4: uma story por caso do mapa de estados (docs/RANKING.md 8.4), para ver
// a tela inteira; o detalhe de cada peça está na story dela (RankingRow,
// ZoneDivider, PinnedStandingRow)
const meta = {
  title: "Ranking/RankingScreen",
  component: RankingScreen,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Classificação de uma categoria: cabeçalho da temporada, tabela com a linha de corte, a própria linha fixada e os vazios. Critérios em `docs/RANKING.md` §9.3.",
      },
    },
  },
  args: { model: storyModel(storyTable()), viewerId: STORY_VIEWER_ID, now: STORY_NOW, links: STORY_LINKS },
  argTypes: { model: { control: false }, links: { control: false } },
} satisfies Meta<typeof RankingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

const ownPinned = (root: HTMLElement) => root.ownerDocument.querySelector<HTMLElement>("[class*='pinned--']");
const rowsWith = (items: HTMLElement[], text: string) => items.filter((item) => item.textContent?.includes(text));

// Resolve na primeira entrega de IntersectionObserver do documento. Todos os
// observers são calculados no mesmo passo de renderização e avisados na ordem
// em que nasceram: quando este é avisado, o do useOwnRow, criado antes, já foi
function firstIntersectionDelivered(target: Element): Promise<void> {
  return new Promise((resolve) => {
    const probe = new IntersectionObserver(() => {
      probe.disconnect();
      resolve();
    });
    probe.observe(target);
  });
}

// Própria dupla em 18º, fora da zona: distância da vaga, e a cópia fixa no rodapé
// enquanto a linha está abaixo da vista (RK9, RK11)
export const OwnOutsideZone: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("heading", { level: 2 })).toHaveTextContent("Ranking BH · Masculino B");
    await expect(canvas.getByText("2º semestre de 2026 · Rodada 3 de 4")).toBeVisible();
    await expect(canvas.getByText("Rodada fecha em 5 dias · Corte em 30/11")).toBeVisible();
    await expect(canvas.getByRole("separator")).toHaveAccessibleName("Classificam para a Saideira · 8 vagas");
    // O leitor de tela lê a própria linha uma vez só: a cópia fixa é aria-hidden
    await expect(rowsWith(canvas.getAllByRole("listitem"), "Você e")).toHaveLength(1);
    await expect(canvas.getAllByText(/^Faltam \d+ pts para o 8º$/)[0]).toBeInTheDocument();
    const pinned = await waitFor(() => {
      const element = ownPinned(canvasElement);
      if (element === null) throw new Error("cópia fixa ainda não apareceu");
      return element;
    });
    await expect(pinned).toHaveAttribute("aria-hidden", "true");
    await expect(pinned.className).toMatch(/pinned--bottom/);
    // Tocar na cópia rola até a linha, e a cópia some
    await userEvent.click(pinned);
    await waitFor(() => expect(ownPinned(canvasElement)).toBeNull(), { timeout: 3000 });
  },
};

// Própria dupla em 3º: rolando para baixo, a linha sai por cima e a cópia fica no topo,
// abaixo do cabeçalho. Dentro da zona, nada de distância da vaga (RK9, RK11)
export const OwnInsideZone: Story = {
  args: { model: storyModel(storyTable({ ownAt: 2 })) },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByText(/^Faltam/)).toBeNull();
    // Rolar antes do primeiro aviso do observer do useOwnRow perdia a rolagem
    // no Chromium sob carga: o primeiro cálculo saía com a posição de antes
    // (linha à vista), e o observer não recalculava mais (ENG-127)
    await firstIntersectionDelivered(rowsWith(canvas.getAllByRole("listitem"), "Você e")[0]);
    const view = canvasElement.ownerDocument.defaultView as Window;
    // Rola de novo a cada tentativa: um scroll só falhava na CI quando a
    // página era reposicionada depois dele (a rolagem suave da story anterior
    // ou o ajuste do Storybook ao montar) e a linha voltava à vista
    await waitFor(
      () => {
        view.scrollTo({ top: view.document.documentElement.scrollHeight, behavior: "instant" });
        expect(ownPinned(canvasElement)?.className).toMatch(/pinned--top/);
      },
      { timeout: 3000 },
    );
  },
};

// "Ir para a minha posição": só aparece no foco e leva o foco à própria linha
export const SkipToOwnRow: Story = {
  play: async ({ canvas, userEvent }) => {
    const skip = canvas.getByRole("button", { name: "Ir para a minha posição" });
    await userEvent.click(skip);
    const ownRow = rowsWith(canvas.getAllByRole("listitem"), "Você e")[0];
    await waitFor(() => expect(ownRow.contains(document.activeElement)).toBe(true));
  },
};

// Duplas: o toque abre a folha com os dois jogadores, cada um levando ao perfil (RK14)
export const PairSheetOpen: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /^1º, / }));
    const dialog = await screen.findByRole("dialog");
    const links = within(dialog).getAllByRole("link");
    await expect(links).toHaveLength(2);
    await expect(links[0].getAttribute("href")).toMatch(/^\/jogadores\//);
  },
};

// Não inscrito na categoria: nenhuma linha destacada nem fixada (4.1)
export const NotEnrolled: Story = {
  args: { model: storyModel(storyTable({ ownAt: null })) },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole("button", { name: "Ir para a minha posição" })).toBeNull();
    await expect(ownPinned(canvasElement)).toBeNull();
  },
};

// 1ª rodada: nenhuma linha com delta (RK12)
export const FirstRound: Story = {
  args: {
    model: storyModel({
      ...storyTable({ withDelta: false }),
      header: { ...STORY_HEADER, current_round: { number: 1, total: 4, deadline: "2026-10-06T15:00:00Z" } },
    }),
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/subiu|caiu/)).toBeNull();
  },
};

// Depois da data de corte: "Classificados para…", sem distância da vaga
export const AfterCutoff: Story = {
  args: { model: storyModel(storyTable({ afterCutoff: true })) },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Classificação final da Saideira definida")).toBeVisible();
    await expect(canvas.getByRole("separator")).toHaveAccessibleName("Classificados para a Saideira");
    await expect(canvas.queryByText(/^Faltam/)).toBeNull();
  },
};

function withTieAcrossLine(): RankingScreenContent {
  const table = storyTable();
  const tie = (line: (typeof table.qualified)[number]) => ({ ...line, awaiting_admin: true, points: 452 });
  return {
    ...table,
    qualified: [...table.qualified.slice(0, 7), tie(table.qualified[7])],
    outside: [tie(table.outside[0]), ...table.outside.slice(1)],
    divider: table.divider && { ...table.divider, awaiting_admin: true },
    has_tie: true,
  };
}

// Empate em todos os critérios atravessando a linha: Badge "Empate", segunda linha no
// divisor e a nota de ordem provisória (4.4, 4.5)
export const TieAcrossLine: Story = {
  args: { model: storyModel(withTieAcrossLine()) },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText("Empate")).toHaveLength(2);
    await expect(canvas.getByRole("separator")).toHaveAccessibleName(
      "Classificam para a Saideira · 8 vagas. Empate na última vaga: decisão do admin",
    );
    await expect(canvas.getByText(/^Ordem provisória até a decisão do admin/)).toBeVisible();
  },
};

function withClosedInsideZone(): RankingScreenContent {
  const table = storyTable();
  const lines = [...table.qualified, ...table.outside];
  lines[4] = { ...lines[4], status: "closed" };
  return { ...table, qualified: lines.slice(0, 9), outside: lines.slice(9) };
}

// Encerrada em 5º não ocupa vaga: o divisor fica depois do 9º (4.5)
export const ClosedInsideZone: Story = {
  args: { model: storyModel(withClosedInsideZone()) },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Encerrada")).toBeVisible();
    const [inside] = canvas.getAllByRole("list", { name: "Dentro das vagas" });
    await expect(within(inside).getAllByRole("listitem")).toHaveLength(9);
  },
};

// Menos duplas que vagas: sem divisor, e o cabeçalho diz que todas se classificam
export const AllQualify: Story = {
  args: {
    model: storyModel({
      ...storyTable({ count: 6, ownAt: 3, qualifiers: null }),
      header: { ...STORY_HEADER, all_qualify: true },
    }),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Todas as duplas se classificam para a Saideira")).toBeVisible();
    await expect(canvas.queryByRole("separator")).toBeNull();
  },
};

// Temporada encerrada: a tabela final, com a própria linha fixada (RK15)
export const Ended: Story = {
  args: {
    model: storyModel({
      ...storyTable({ afterCutoff: true }),
      header: { ...STORY_HEADER, phase: "ended", current_round: null, previous_season_id: null },
    }),
    links: { ...STORY_LINKS, previousSeason: null },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Temporada encerrada em 15/12")).toBeVisible();
    await expect(canvas.queryByRole("link", { name: "Temporada anterior" })).toBeNull();
  },
};

// Sem jogo confirmado: inscrições sem posição e sem pontos, sem divisor (RK20)
export const Unranked: Story = {
  args: { model: storyModel(storyUnranked()) },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("A classificação começa com o primeiro resultado confirmado.")).toBeVisible();
    await expect(canvas.getByRole("list", { name: "Inscritos" }).tagName).toBe("UL");
    await expect(canvas.queryByRole("separator")).toBeNull();
  },
};

// Competição sem temporada começada: vazio com próximo passo (RK19)
export const NoSeason: Story = {
  args: { model: storyModel({ kind: "no_season" }) },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Nenhuma temporada em andamento" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Ver regras do ranking" })).toHaveAttribute(
      "href",
      "/competicoes/ranking-bh#pontuacao",
    );
  },
};

// Menor celular suportado: sem rolagem horizontal
export const Narrow320: Story = {
  decorators: [
    (Story) => (
      <div className="sb-width-320">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector(".sb-width-320") as HTMLElement;
    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
  },
};
