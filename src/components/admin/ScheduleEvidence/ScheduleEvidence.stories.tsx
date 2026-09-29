import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ScheduleEvidence } from "./ScheduleEvidence";
import {
  BOTH_SIDES_HISTORY,
  EMPTY_HISTORY,
  ONE_SIDE_HISTORY,
  REPORTED_DATE_HISTORY,
  STORY_LONG_SIDE_NAMES,
  STORY_PLAYER_NAMES,
  STORY_SIDE_NAMES,
  STORY_SIDES,
} from "./storyFixtures";

const screenFrame: Decorator = (Story) => (
  <div className="sb-screen-frame">
    <Story />
  </div>
);

/** Valor da célula na linha `rowLabel`, para o lado `side` (0 = A, 1 = B). */
function cellOf(canvasElement: HTMLElement, rowLabel: string, side: 0 | 1): HTMLElement {
  const table = within(canvasElement).getByRole("table", { name: "Resumo por lado" });
  const row = within(table).getByRole("rowheader", { name: rowLabel }).closest("tr");
  if (row === null) throw new Error(`Linha '${rowLabel}' sem <tr>: esperado rowheader dentro de uma linha`);
  return within(row).getAllByRole("cell")[side];
}

async function expectNoHorizontalOverflow(canvasElement: HTMLElement): Promise<void> {
  const frame = canvasElement.querySelector<HTMLElement>(".sb-screen-frame");
  if (frame === null) throw new Error("Story sem .sb-screen-frame: use o decorator screenFrame");
  await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
}

const meta = {
  title: "Admin/ScheduleEvidence",
  component: ScheduleEvidence,
  decorators: [screenFrame],
  parameters: {
    docs: {
      description: {
        component:
          "Evidência da marcação na partida não realizada: resumo por lado, data acordada ou informada e histórico. Fatos lado a lado, sem sugerir W.O. (M17).",
      },
    },
  },
  args: {
    history: ONE_SIDE_HISTORY,
    sides: STORY_SIDES,
    sideNames: STORY_SIDE_NAMES,
    playerNames: STORY_PLAYER_NAMES,
  },
  argTypes: {
    history: { control: false },
    sides: { control: false },
    playerNames: { control: false },
  },
} satisfies Meta<typeof ScheduleEvidence>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Só a dupla A propôs; as duas propostas expiraram sem aceite. */
export const OneSideProposed: Story = {
  play: async ({ canvasElement }) => {
    await expect(cellOf(canvasElement, "Horários oferecidos", 0)).toHaveTextContent("5 horários em 5 dias");
    await expect(cellOf(canvasElement, "Horários oferecidos", 1)).toHaveTextContent("Nenhum");
    await expect(cellOf(canvasElement, "Propostas expiradas sem aceite", 0)).toHaveTextContent("2");
    await expect(cellOf(canvasElement, "Primeira proposta", 1)).toHaveTextContent("Nenhuma");
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Nenhuma data foi acordada nem informada no app.")).toBeVisible();
    const history = canvas.getByRole("list", { name: "Histórico da marcação" });
    await expect(within(history).getAllByRole("listitem")).toHaveLength(4);
    await expectNoHorizontalOverflow(canvasElement);
  },
};

/** Contraproposta, retirada e uma data aceita que não saiu. */
export const BothSidesProposed: Story = {
  args: { history: BOTH_SIDES_HISTORY },
  play: async ({ canvasElement }) => {
    await expect(cellOf(canvasElement, "Horários oferecidos", 0)).toHaveTextContent("2 horários em 2 dias");
    await expect(cellOf(canvasElement, "Horários oferecidos", 1)).toHaveTextContent("5 horários em 4 dias");
    await expect(cellOf(canvasElement, "Propostas do outro lado aceitas", 0)).toHaveTextContent("1");
    await expect(within(canvasElement).getByText(/^Data acordada:/)).toHaveTextContent("Thiago aceitou");
    await expectNoHorizontalOverflow(canvasElement);
  },
};

/** A data veio do WhatsApp, informada por um lado só (M14). */
export const ReportedDate: Story = {
  args: { history: REPORTED_DATE_HISTORY },
  play: async ({ canvasElement }) => {
    await expect(cellOf(canvasElement, "Datas informadas fora do app", 1)).toHaveTextContent("1");
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Data informada por Diego, sem aceite do outro lado/)).toBeVisible();
    await expectNoHorizontalOverflow(canvasElement);
  },
};

/** Ninguém usou a marcação no app. */
export const NoHistory: Story = {
  args: { history: EMPTY_HISTORY },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("list")).toBeNull();
    await expect(canvas.getByText(/Nenhum dos lados propôs horário/)).toBeVisible();
  },
};

/** Nome de dupla longo quebra dentro da coluna, sem rolar a tela. */
export const LongSideNames: Story = {
  args: { history: BOTH_SIDES_HISTORY, sideNames: STORY_LONG_SIDE_NAMES },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement);
  },
};
