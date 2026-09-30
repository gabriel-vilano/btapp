import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";
import { ScoreInput } from "./ScoreInput";
import { EMPTY_SCORE_DRAFT, type ScoreDraft } from "./scoreDraft";

const SIDE_NAMES = { a: "Você e Pedro", b: "Lucas e Rafael" };

function StatefulScoreInput(props: ComponentProps<typeof ScoreInput>) {
  const [value, setValue] = useState<ScoreDraft>(props.value);
  return (
    <ScoreInput
      {...props}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        props.onValueChange(next);
      }}
    />
  );
}

const meta = {
  title: "UI/ScoreInput",
  component: ScoreInput,
  parameters: {
    docs: {
      description: {
        component:
          "Entrada de placar set a set: quem venceu e os games de quem perdeu, com a prévia ao vivo. Super tiebreak em campos numéricos e set interrompido em Steppers.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="sb-screen-frame">
        <Story />
      </div>
    ),
  ],
  args: {
    format: "one_set_of_6",
    type: "normal",
    userSide: "a",
    sideNames: SIDE_NAMES,
    isSingles: false,
    value: EMPTY_SCORE_DRAFT,
    onValueChange: fn(),
  },
  argTypes: {
    format: { control: "select", options: ["one_set_of_6", "one_set_of_8", "two_sets_of_6_stb"] },
    type: { control: "inline-radio", options: ["normal", "retired", "wo"] },
    userSide: { control: "inline-radio", options: ["a", "b"] },
    isSingles: { control: "boolean" },
    neutral: { control: "boolean" },
    value: { control: false },
    sideNames: { control: false },
    onValueChange: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  render: (args) => <StatefulScoreInput {...args} />,
} satisfies Meta<typeof ScoreInput>;

export default meta;
type Story = StoryObj<typeof meta>;

type Canvas = ReturnType<typeof within>;

function chooseInGroup(canvas: Canvas, group: string, option: string) {
  const fieldset = canvas.getByRole("group", { name: group });
  return within(fieldset).getByRole("radio", { name: option });
}

export const Default: Story = {};

export const SetOf6: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Você e Pedro" }));
    await userEvent.click(chooseInGroup(canvas, "Games de Lucas e Rafael", "5"));
    await expect(canvas.getByText("7/5 para vocês")).toBeVisible();

    await userEvent.click(canvas.getByRole("radio", { name: "Lucas e Rafael" }));
    await expect(canvas.getByText("5/7 para Lucas e Rafael")).toBeVisible();
    await expect(canvas.getByRole("group", { name: "Games de vocês" })).toBeVisible();
  },
};

export const SetOf8: Story = {
  args: {
    format: "one_set_of_8",
    value: { ...EMPTY_SCORE_DRAFT, gamesSets: [{ winner: "a", loserGames: 7 }] },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Set 1 · até 8")).toBeVisible();
    await expect(canvas.getByText("9/7 para vocês")).toBeVisible();
    const games = canvas.getByRole("group", { name: "Games de Lucas e Rafael" });
    await expect(within(games).getAllByRole("radio")).toHaveLength(9);
  },
};

export const TwoSetsWithSuperTiebreak: Story = {
  args: { format: "two_sets_of_6_stb" },
  play: async ({ canvas, userEvent }) => {
    const [set1Winner] = canvas.getAllByRole("radio", { name: "Você e Pedro" });
    await userEvent.click(set1Winner);
    await userEvent.click(chooseInGroup(canvas, "Games de Lucas e Rafael", "4"));
    await expect(canvas.getByText("Set 2 · até 6")).toBeVisible();
    await expect(canvas.queryByText("Super tiebreak · a 10")).toBeNull();

    const [, set2Winner] = canvas.getAllByRole("radio", { name: "Lucas e Rafael" });
    await userEvent.click(set2Winner);
    await userEvent.click(chooseInGroup(canvas, "Games de vocês", "6"));
    await expect(canvas.getByText("6/7 para Lucas e Rafael")).toBeVisible();

    await userEvent.type(canvas.getByLabelText("Pontos de vocês"), "10");
    await userEvent.type(canvas.getByLabelText("Pontos de Lucas e Rafael"), "9");
    await userEvent.tab();
    await expect(canvas.getByRole("alert")).toHaveTextContent("10/9 não fecha o super tiebreak");

    await userEvent.clear(canvas.getByLabelText("Pontos de Lucas e Rafael"));
    await userEvent.type(canvas.getByLabelText("Pontos de Lucas e Rafael"), "8");
    await expect(canvas.getByText("10/8 para vocês")).toBeVisible();
    await expect(canvas.queryByRole("alert")).toBeNull();
  },
};

export const InvalidSuperTiebreak: Story = {
  name: "Super tiebreak inválido",
  args: {
    format: "two_sets_of_6_stb",
    value: {
      ...EMPTY_SCORE_DRAFT,
      gamesSets: [{ winner: "a", loserGames: 3 }, { winner: "b", loserGames: 4 }],
      superTiebreak: { a: "10", b: "9" },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByLabelText("Pontos de vocês"));
    await userEvent.tab();
    await expect(canvas.getByRole("alert")).toHaveTextContent("Vence quem chega a 10 com 2 de vantagem");
  },
};

export const Retired: Story = {
  name: "Desistência",
  args: { format: "two_sets_of_6_stb", type: "retired" },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(chooseInGroup(canvas, "Em que set foi a desistência?", "2º set"));
    await userEvent.click(canvas.getByRole("radio", { name: "Lucas e Rafael" }));
    await userEvent.click(chooseInGroup(canvas, "Games de vocês", "3"));
    await expect(canvas.getByText("Set 2 · interrompido")).toBeVisible();

    const mine = canvas.getByRole("spinbutton", { name: "Games de vocês" });
    await userEvent.click(canvas.getByRole("button", { name: "Aumentar Games de vocês" }));
    await userEvent.click(canvas.getByRole("button", { name: "Aumentar Games de vocês" }));
    await expect(mine).toHaveAttribute("aria-valuenow", "2");
    await expect(canvas.getByText("2/0 quando o jogo parou")).toBeVisible();
  },
};

export const RetiredInSuperTiebreak: Story = {
  name: "Desistência no super tiebreak",
  args: {
    format: "two_sets_of_6_stb",
    type: "retired",
    value: { ...EMPTY_SCORE_DRAFT, interruptedIndex: 2, gamesSets: [{ winner: "a", loserGames: 4 }] },
  },
  play: async ({ canvas }) => {
    // O set 2 vai para o outro lado: 2 a 0 teria fechado a partida antes do STB
    const [, set2Mine] = canvas.getAllByRole("radio", { name: "Você e Pedro" });
    await expect(set2Mine).toBeDisabled();
  },
};

export const RetiredStepperBounds: Story = {
  name: "Desistência: limites do set interrompido",
  args: { type: "retired", value: { ...EMPTY_SCORE_DRAFT, interrupted: { a: 5, b: 4 } } },
  play: async ({ canvas }) => {
    // 6/4 fecharia o set: o lado de quem lança para em 5 enquanto o outro tem 4
    const mine = canvas.getByRole("spinbutton", { name: "Games de vocês" });
    await expect(mine).toHaveAttribute("aria-valuemax", "5");
    await expect(canvas.getByRole("button", { name: "Aumentar Games de vocês" })).toBeDisabled();
  },
};

export const Walkover: Story = {
  name: "W.O.",
  args: { type: "wo" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("W.O. não tem placar. A vitória fica com vocês.")).toBeVisible();
    await expect(canvas.queryByRole("radio")).toBeNull();
  },
};

export const Singles: Story = {
  name: "Simples",
  args: {
    isSingles: true,
    sideNames: { a: "Você", b: "Lucas" },
    value: { ...EMPTY_SCORE_DRAFT, gamesSets: [{ winner: "a", loserGames: 2 }] },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("6/2 para você")).toBeVisible();
  },
};

export const Neutral: Story = {
  name: "Neutro (admin do torneio)",
  args: {
    neutral: true,
    sideNames: { a: "Lucas e Rafael", b: "André e Bruno" },
    value: { ...EMPTY_SCORE_DRAFT, gamesSets: [{ winner: "b", loserGames: 4 }] },
  },
  play: async ({ canvas }) => {
    // Quem lança não joga: a prévia nomeia os dois lados, sem "vocês"
    await expect(canvas.getByText("4/6 para André e Bruno")).toBeVisible();
    await expect(canvas.getByRole("group", { name: "Games de Lucas e Rafael" })).toBeVisible();
  },
};
