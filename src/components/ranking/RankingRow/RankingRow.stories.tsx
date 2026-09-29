import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ZoneDivider } from "../ZoneDivider";
import { RankingList, RankingRow } from "./RankingRow";
import { STORY_PLAYERS as P, VIEWER } from "./storyFixtures";

const meta = {
  title: "Ranking/RankingRow",
  component: RankingRow,
  // Linha de ponta a ponta, como no app: a margem lateral é da própria linha
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Linha da classificação: posição, jogador ou dupla, pontos, delta e \"N jogos · N vitórias\". Critérios em `docs/RANKING.md` §9.1.",
      },
    },
  },
  // Cada story vira uma linha dentro da classificação; a galeria monta a própria lista
  decorators: [
    (Story, { parameters }) =>
      parameters.ownList ? (
        <Story />
      ) : (
        <RankingList aria-label="Classificação">
          <Story />
        </RankingList>
      ),
  ],
  args: {
    position: 1,
    players: [P.lucas, P.rafael],
    points: 610,
    matches: 6,
    wins: 5,
  },
  argTypes: {
    players: { control: false },
    status: { control: "inline-radio", options: ["active", "closed"] },
  },
} satisfies Meta<typeof RankingRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Doubles: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("listitem")).toHaveTextContent("1º, Lucas Silva e Rafael Costa, 610 pontos, 6 jogos, 5 vitórias");
    // Sem toque, a linha é estática
    await expect(canvas.queryByRole("button")).toBeNull();
    await expect(canvas.queryByRole("link")).toBeNull();
  },
};

export const Singles: Story = {
  args: { players: [P.ana], points: 480, matches: 4, wins: 3 },
};

// Fundo sutil e "Você" na frente do nome (RK10)
export const Own: Story = {
  args: { position: 9, players: [P.pedro, VIEWER], points: 390, matches: 5, wins: 3, delta: 2, isOwn: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Você e Pedro Alves")).toBeVisible();
  },
};

export const MovedUp: Story = {
  args: { delta: 1 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("listitem")).toHaveTextContent(/610 pontos, subiu 1 posição, 6 jogos/);
  },
};

export const MovedDown: Story = {
  args: { position: 2, players: [P.ana, P.bia], points: 598, delta: -3 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("listitem")).toHaveTextContent(/caiu 3 posições/);
  },
};

// Posição igual: a tabela não mostra traço (RK12)
export const NoDelta: Story = {
  args: { delta: 0 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("svg")).toBeNull();
  },
};

// Troca de parceiro (R45): continua na posição, apagada, e os pontos ficam
export const Closed: Story = {
  args: { position: 5, players: [VIEWER, P.caio], points: 450, matches: 3, wins: 2, status: "closed" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Encerrada")).toBeVisible();
    await expect(canvas.getByText("450")).toBeVisible();
  },
};

export const AwaitingAdmin: Story = {
  args: { position: 4, players: [P.caio, P.davi], points: 402, matches: 4, wins: 2, awaitingAdmin: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Empate")).toBeVisible();
  },
};

export const WithCutoffDistance: Story = {
  args: {
    ...Own.args,
    cutoffDistance: "Faltam 12 pts para o 8º",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Faltam 12 pts para o 8º")).toBeVisible();
  },
};

// Nome longo trunca numa linha; o nome inteiro fica no nome acessível
export const LongName: Story = {
  args: { position: 12, players: [P.long, P.rafael], awaitingAdmin: true },
  play: async ({ canvas, canvasElement }) => {
    const name = canvasElement.querySelector("[aria-hidden] [class*=ranking-row__name]") as HTMLElement;
    await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
    await expect(canvas.getByRole("listitem")).toHaveTextContent(
      /Maria Eduarda de Vasconcelos Albuquerque e Rafael Costa/,
    );
  },
};

export const TwoDigitPosition: Story = {
  args: { position: 38, players: [P.caio, P.pedro], points: 98, matches: 2, wins: 0, delta: -12 },
};

// Simples: a linha leva ao perfil (RK14)
export const Navigable: Story = {
  args: { ...Singles.args, href: "/perfil/ana" },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "1º, Ana Souza, 480 pontos, 4 jogos, 3 vitórias" });
    await expect(link).toHaveAttribute("href", "/perfil/ana");
    await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  },
};

// Duplas: a linha abre a folha com os dois jogadores, que é da tela (RK14)
export const Pressable: Story = {
  args: { onClick: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /^1º, Lucas Silva e Rafael Costa/ }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

// Menor celular suportado: tudo cabe sem rolagem horizontal
export const Narrow320: Story = {
  args: { ...LongName.args, position: 38, points: 1210, delta: -12, status: "closed", cutoffDistance: "Faltam 120 pts para o 8º" },
  parameters: { ownList: true },
  decorators: [
    (Story) => (
      <div className="sb-width-320">
        <RankingList>
          <Story />
        </RankingList>
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector(".sb-width-320") as HTMLElement;
    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
  },
};

type GalleryRow = Parameters<typeof RankingRow>[0];

const TABLE: GalleryRow[] = [
  { position: 1, players: [P.lucas, P.rafael], points: 610, matches: 6, wins: 5, delta: 1 },
  { position: 2, players: [P.ana, P.bia], points: 598, matches: 6, wins: 5, delta: -1 },
  { position: 3, players: [P.caio, P.davi], points: 560, matches: 6, wins: 4 },
  { position: 4, players: [P.pedro, P.long], points: 512, matches: 5, wins: 4, delta: 2 },
  { position: 5, players: [P.rafael, P.ana], points: 470, matches: 5, wins: 3, status: "closed" },
  { position: 6, players: [P.bia, P.caio], points: 455, matches: 5, wins: 3, delta: -1 },
  { position: 7, players: [P.davi, P.lucas], points: 431, matches: 4, wins: 3, awaitingAdmin: true },
  { position: 8, players: [P.long, P.bia], points: 431, matches: 4, wins: 3, awaitingAdmin: true },
  { position: 9, players: [P.ana, P.davi], points: 408, matches: 4, wins: 2, delta: -2 },
  {
    position: 10,
    players: [P.pedro, VIEWER],
    points: 390,
    matches: 5,
    wins: 3,
    delta: 2,
    isOwn: true,
    cutoffDistance: "Faltam 18 pts para o 9º",
  },
];

// 8 vagas com uma encerrada em 5º: a vaga passa para a próxima ativa, e o corte fica depois
// do 9º (RANKING.md 4.5). A própria dupla, em 10º, vê quanto falta para o 9º
export const Gallery: Story = {
  parameters: { ownList: true },
  render: () => (
    <>
      <RankingList aria-label="Vagas da Saideira">
        {TABLE.slice(0, 9).map(galleryRow)}
      </RankingList>
      <ZoneDivider label="Classificam para a Saideira · 8 vagas" />
      <RankingList aria-label="Fora das vagas" start={10}>
        {TABLE.slice(9).map(galleryRow)}
      </RankingList>
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(10);
    await expect(canvas.getAllByRole("button")).toHaveLength(10);
    await expect(canvas.getByRole("separator")).toHaveAccessibleName(
      "Classificam para a Saideira · 8 vagas",
    );
  },
};

function galleryRow(row: GalleryRow) {
  return <RankingRow key={row.position} {...row} onClick={fn()} />;
}
