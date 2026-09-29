import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Badge, type BadgeTone } from "../Badge";
import { List, ListItem } from "../ListItem";
import { ScoreBlock } from "./ScoreBlock";

// Largura útil do card de resultado no mobile base (361px), onde a variante padrão mora.
// O decorator do feed não serve aqui: ui/ não importa de grupo de área.
// A variante compacta mora numa linha de lista, de ponta a ponta: essas stories pulam o frame.
const cardFrame: Decorator = (Story, { parameters }) =>
  parameters.inList ? (
    <Story />
  ) : (
    <div className="sb-feed-frame">
      <Story />
    </div>
  );

const meta = {
  title: "UI/ScoreBlock",
  component: ScoreBlock,
  decorators: [cardFrame],
  args: {
    score: { type: "normal", sets: [{ a: 6, b: 4 }] },
  },
} satisfies Meta<typeof ScoreBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneSet: Story = {};

export const TwoSets: Story = {
  args: {
    score: { type: "normal", sets: [{ a: 6, b: 4 }, { a: 6, b: 3 }] },
  },
};

export const ThreeSetsWithTiebreak: Story = {
  args: {
    score: {
      type: "normal",
      sets: [{ a: 6, b: 4 }, { a: 4, b: 6 }, { a: 10, b: 7 }],
    },
  },
};

// Sem jogo, sem placar: a área mostra só o rótulo (FEED_CARDS.md §4.3).
export const WalkOver: Story = {
  args: { score: { type: "wo" } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent("Vitória por W.O.");
    await expect(canvasElement.textContent).not.toMatch(/\d/);
  },
};

// Desistência: placar real, com o set interrompido rotulado (FEED_CARDS.md §4.4).
// Exemplo da R11: o desistente venceu o 1º set e desistiu perdendo o 2º por 2/3.
export const RetiredInSecondSet: Story = {
  args: {
    score: {
      type: "retired",
      completed_sets: [{ a: 4, b: 6 }],
      interrupted_set: { a: 3, b: 2 },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent("Interrompido");
    await expect(canvasElement.textContent).not.toMatch(/[-–—]/);
  },
};

export const RetiredInFirstSet: Story = {
  args: {
    score: { type: "retired", completed_sets: [], interrupted_set: { a: 3, b: 2 } },
  },
};

export const RetiredInSuperTiebreak: Story = {
  args: {
    score: {
      type: "retired",
      completed_sets: [{ a: 6, b: 4 }, { a: 3, b: 6 }],
      interrupted_set: { a: 5, b: 3 },
    },
  },
};

// O set seguinte não começou: nenhuma coluna para ele.
export const RetiredBetweenSets: Story = {
  args: {
    score: { type: "retired", completed_sets: [{ a: 6, b: 4 }], interrupted_set: { a: 0, b: 0 } },
  },
};

// Nenhum game jogado: mesma estrutura do W.O. (§4.4).
export const RetiredBeforeFirstGame: Story = {
  args: { score: { type: "retired", completed_sets: [], interrupted_set: { a: 0, b: 0 } } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent("Vitória por desistência");
    await expect(canvasElement.textContent).not.toMatch(/\d/);
  },
};

// --- Variante compacta: uma linha, para listas (partidas recentes, H2H, prévia do registro) ---

interface MatchRow {
  opponents: string;
  context: string;
  badge: { tone: BadgeTone; label: string };
}

type CompactStory = Story & { parameters: { inList: true; row: MatchRow } };

// Linha no formato das partidas recentes (PF18): Badge e placar lidos do mesmo lado
function renderRow(args: Story["args"], row: MatchRow) {
  return (
    <List aria-label="Partidas recentes">
      <ListItem
        title={row.opponents}
        supportingText={row.context}
        trailing={
          <>
            <Badge tone={row.badge.tone}>{row.badge.label}</Badge>
            <ScoreBlock {...args} score={args?.score ?? { type: "wo" }} />
          </>
        }
      />
    </List>
  );
}

const compactBase = {
  render: (args, { parameters }) => renderRow(args, parameters.row as MatchRow),
} satisfies Story;

const win = { tone: "success", label: "Vitória" } as const;
const loss = { tone: "attention", label: "Derrota" } as const;

async function expectScoreText(canvasElement: HTMLElement, text: string) {
  const row = within(canvasElement).getByRole("listitem");
  await expect(row.textContent).toContain(text);
}

// Lido do vencedor: os sets vencidos em destaque.
export const CompactWin: CompactStory = {
  ...compactBase,
  args: { variant: "compact", perspective: "winner", score: { type: "normal", sets: [{ a: 6, b: 4 }, { a: 6, b: 3 }] } },
  parameters: {
    layout: "fullscreen",
    inList: true,
    row: { opponents: "vs. Pedro Henrique e Bruno Lima", context: "Ranking Arena RM · Masculino B · há 2 dias", badge: win },
  },
  play: async ({ canvasElement }) => expectScoreText(canvasElement, "6/4 6/3"),
};

// O mesmo jogo, lido de quem perdeu: cada set se inverte e bate com o Badge.
export const CompactLoss: CompactStory = {
  ...compactBase,
  args: { ...CompactWin.args, perspective: "loser" },
  parameters: {
    ...CompactWin.parameters,
    row: { opponents: "vs. Lucas Silva e Rafael Costa", context: "Ranking Arena RM · Masculino B · há 2 dias", badge: loss },
  },
  play: async ({ canvasElement }) => expectScoreText(canvasElement, "4/6 3/6"),
};

export const CompactSuperTiebreak: CompactStory = {
  ...compactBase,
  args: {
    variant: "compact",
    perspective: "winner",
    score: { type: "normal", sets: [{ a: 6, b: 4 }, { a: 4, b: 6 }, { a: 10, b: 7 }] },
  },
  parameters: { ...CompactWin.parameters },
  play: async ({ canvasElement }) => expectScoreText(canvasElement, "6/4 4/6 10/7"),
};

// Sem jogo, sem número: o texto no lugar do placar.
export const CompactWalkOver: CompactStory = {
  ...compactBase,
  args: { variant: "compact", perspective: "winner", score: { type: "wo" } },
  parameters: { ...CompactWin.parameters },
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByRole("listitem");
    await expect(within(row).getByText("W.O.")).toBeInTheDocument();
    await expect(row.textContent).not.toMatch(/\d+\/\d+/);
  },
};

// Placar real e o marcador depois do set interrompido (R11, lido de quem desistiu).
export const CompactRetired: CompactStory = {
  ...compactBase,
  args: {
    variant: "compact",
    perspective: "loser",
    score: { type: "retired", completed_sets: [{ a: 4, b: 6 }], interrupted_set: { a: 3, b: 2 } },
  },
  parameters: {
    ...CompactWin.parameters,
    row: { opponents: "vs. Lucas Silva e Rafael Costa", context: "Amistoso · há 1 semana", badge: { tone: "attention", label: "Desistência" } },
  },
  play: async ({ canvasElement }) => expectScoreText(canvasElement, "6/4 2/3 desist."),
};

// 320px, o menor celular suportado: o nome quebra, o placar fica numa linha e nada vaza.
export const CompactLongNames: CompactStory = {
  ...compactBase,
  args: CompactSuperTiebreak.args,
  globals: { viewport: { value: "mobile320", isRotated: false } },
  parameters: {
    ...CompactWin.parameters,
    row: {
      opponents: "vs. Maria Eduarda Albuquerque de Vasconcelos e Ana Beatriz Figueiredo",
      context: "Circuito Mineiro de Beach Tennis Open Internacional 2026 · Feminino A · há 3 dias",
      badge: win,
    },
  },
  play: async ({ canvasElement }) => {
    const score = within(canvasElement).getByText("10/7").parentElement as HTMLElement;
    const lineHeight = parseFloat(getComputedStyle(score).lineHeight);
    await expect(score.getBoundingClientRect().height).toBeLessThanOrEqual(lineHeight);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  },
};
