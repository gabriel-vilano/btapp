import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { List } from "../ListItem";
import { StandingSummaryItem } from "./StandingSummaryItem";

const meta = {
  title: "UI/StandingSummaryItem",
  component: StandingSummaryItem,
  // Linha de ponta a ponta, como no app: a margem lateral é do próprio item
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
    position: 5,
    competitionName: "Ranking Bacuri",
    categoryName: "Masculino B",
    partnerName: "Rafael",
    delta: { direction: "up", value: 2 },
    href: "/ranking/masculino-b",
  },
  argTypes: {
    delta: { control: "object" },
  },
} satisfies Meta<typeof StandingSummaryItem>;

export default meta;
type Story = StoryObj<typeof meta>;

// A posição fica fora da árvore de acessibilidade no leading e entra pelo título:
// o nome do link começa por ela.
export const Up: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", {
      name: "5º, Ranking Bacuri · Masculino B com Rafael Subiu 2 posições",
    });
    await expect(link).toHaveAttribute("href", "/ranking/masculino-b");
  },
};

export const Down: Story = {
  args: { position: 12, delta: { direction: "down", value: 1 } },
};

// Mesma posição da última foto de rodada: aqui o traço aparece (RANKING.md, RK12).
// Só o traço à vista, para o título caber em 1 linha; a frase fica no leitor de tela.
export const Kept: Story = {
  args: { delta: { direction: "none" } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", {
        name: "5º, Ranking Bacuri · Masculino B com Rafael Manteve a posição",
      }),
    ).toBeVisible();
    // Só o traço (16px) ocupa o trailing, sem a frase à vista
    const delta = canvas.getByText("Manteve a posição").parentElement as HTMLElement;
    await expect(delta.getBoundingClientRect().width).toBeLessThanOrEqual(16);
  },
};

// 1ª rodada: ainda não há foto para comparar, então não há delta.
export const NoDelta: Story = {
  args: { delta: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/posiç/)).toBeNull();
  },
};

// Categoria sem partida confirmada (RANKING.md, RK20): a tabela ainda não tem posição.
export const NoPosition: Story = {
  args: { position: null, delta: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("–")).toBeVisible();
    await expect(canvas.getByText(/Sem posição ainda/)).toBeInTheDocument();
  },
};

// Simples: não há parceiro, e a linha de apoio some.
export const Singles: Story = {
  args: { partnerName: undefined, categoryName: "Simples Masculino A" },
};

// Complemento do perfil (PROFILE.md, PF14) na mesma linha de apoio, sem outra variante.
export const WithComplement: Story = {
  args: { complement: "Melhor: 3º" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("com Rafael · Melhor: 3º")).toBeVisible();
  },
};

// Simples no perfil: o complemento ocupa a linha de apoio sozinho.
export const SinglesWithComplement: Story = {
  args: { partnerName: undefined, complement: "Melhor: 3º", categoryName: "Simples Masculino A" },
};

// Nome longo quebra linha em vez de cortar; posição e delta não encolhem.
export const LongName: Story = {
  args: {
    position: 18,
    competitionName: "Circuito Metropolitano de Beach Tennis da Grande Belo Horizonte",
    categoryName: "Mista C 40+",
    partnerName: "Maria Eduarda Albuquerque",
    complement: "Melhor: 11º",
    delta: { direction: "down", value: 3 },
  },
};

// Na folha do seletor de categoria (RK6) a linha age em vez de navegar.
export const Pressable: Story = {
  args: { href: undefined, onClick: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /^5º, Ranking Bacuri/ }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

// Galeria: a seção Rankings do próprio perfil, com os estados lado a lado.
export const Uses: Story = {
  parameters: { ownLists: true },
  render: () => (
    <List aria-label="Rankings" divided>
      <StandingSummaryItem
        position={5}
        competitionName="Ranking Bacuri"
        categoryName="Masculino B"
        partnerName="Rafael"
        delta={{ direction: "up", value: 2 }}
        complement="Melhor: 3º"
        href="/ranking/masculino-b"
      />
      <StandingSummaryItem
        position={12}
        competitionName="Liga Pitanga"
        categoryName="Mista C"
        partnerName="Ana"
        delta={{ direction: "down", value: 1 }}
        href="/ranking/mista-c"
      />
      <StandingSummaryItem
        position={1}
        competitionName="Ranking Umbu"
        categoryName="Masculino A"
        partnerName="Bruno"
        delta={{ direction: "none" }}
        href="/ranking/masculino-a"
      />
      <StandingSummaryItem
        position={7}
        competitionName="Desafio Savassi"
        categoryName="Simples Masculino A"
        href="/ranking/simples-a"
      />
    </List>
  ),
};
