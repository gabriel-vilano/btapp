import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { FriendlyScreen } from "./FriendlyScreen";
import { FRIENDLY_PLAYER, FRIENDLY_SCREEN_NOW, friendlyScreenStoryData, settledFriendly } from "./storyFixtures";

// A tela ocupa a largura do mobile base de borda a borda, com a própria margem
const mobileFrame: Decorator = (Story) => (
  <div className="sb-width-393">
    <Story />
  </div>
);

// Relógio parado no "agora" das stories: a ação acontece na mesma quinta, 9h
const clock = () => FRIENDLY_SCREEN_NOW;

/** As folhas abrem num portal, fora do canvas da story. */
function findDialog(name: string): Promise<HTMLElement> {
  return screen.findByRole("dialog", { name });
}

const meta = {
  title: "Agenda/FriendlyScreen",
  component: FriendlyScreen,
  decorators: [mobileFrame],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Tela do amistoso: a mesma tela de confronto, sem competição nem prazo. O outro lado confirma ou contesta, o que descarta o resultado; quem lançou cancela enquanto está pendente (RESULTS.md §6.2).",
      },
    },
  },
  args: { data: friendlyScreenStoryData(FRIENDLY_PLAYER.lucas), now: FRIENDLY_SCREEN_NOW, clock },
  argTypes: {
    data: { control: false },
    clock: { table: { disable: true } },
  },
} satisfies Meta<typeof FriendlyScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirm: Story = {
  name: "Outro lado: confirmar",
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Pedro lançou o amistoso" })).toBeVisible();
    // Sem prazo (R43): no lugar da contagem, há quanto tempo foi lançado
    await expect(canvas.getByText("Lançado há 3 dias.")).toBeVisible();
    await expect(canvas.getByText("dom, 27/09 · Arena Mangaba – Beach · Nova Lima/MG")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Confirmar" }));
    await expect(await canvas.findByRole("heading", { name: "Amistoso confirmado" })).toHaveFocus();
    await expect(canvas.getByText("Confirmado por você · qui, 01/10, 9h")).toBeVisible();
  },
};

export const Contest: Story = {
  name: "Outro lado: contestar descarta",
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Contestar" }));
    const dialog = within(await findDialog("Contestar o amistoso?"));
    // Avisa antes, sem pedir motivo: ninguém vai arbitrar (§6.2)
    await expect(dialog.getByText("O resultado é descartado. Para valer, um dos lados lança de novo.")).toBeVisible();
    await expect(dialog.queryByRole("group", { name: "Motivo" })).toBeNull();
    await userEvent.click(dialog.getByRole("button", { name: "Contestar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(await canvas.findByRole("heading", { name: "Resultado descartado" })).toHaveFocus();
    await expect(canvas.getByText("Você contestou · qui, 01/10, 9h. Para valer, um dos lados lança de novo.")).toBeVisible();
  },
};

export const Cancel: Story = {
  name: "Quem lançou: cancelar",
  args: { data: friendlyScreenStoryData(FRIENDLY_PLAYER.pedro) },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Aguardando Lucas ou Rafael" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Confirmar" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Mais opções do amistoso" }));
    const menu = within(await findDialog("Opções do amistoso"));
    await userEvent.click(menu.getByRole("button", { name: "Cancelar amistoso" }));
    const confirm = within(await findDialog("Cancelar o amistoso?"));
    await userEvent.click(confirm.getByRole("button", { name: "Cancelar amistoso" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(await canvas.findByRole("heading", { name: "Amistoso cancelado" })).toHaveFocus();
    await expect(canvas.getByText("Você cancelou · qui, 01/10, 9h.")).toBeVisible();
  },
};

export const Partner: Story = {
  name: "Parceiro de quem lançou",
  args: { data: friendlyScreenStoryData(FRIENDLY_PLAYER.thiago) },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Aguardando Lucas ou Rafael" })).toBeVisible();
    // Só quem lançou cancela (R43); o parceiro só acompanha
    await expect(canvas.queryByRole("button", { name: "Mais opções do amistoso" })).toBeNull();
    await expect(canvas.getByText("Pedro lançou há 3 dias.")).toBeVisible();
  },
};

export const Confirmed: Story = {
  name: "Confirmado",
  args: { data: friendlyScreenStoryData(FRIENDLY_PLAYER.pedro, settledFriendly("confirmed")) },
};

export const Discarded: Story = {
  name: "Descartado",
  args: { data: friendlyScreenStoryData(FRIENDLY_PLAYER.pedro, settledFriendly("discarded")) },
};

export const Cancelled: Story = {
  name: "Cancelado",
  args: { data: friendlyScreenStoryData(FRIENDLY_PLAYER.pedro, settledFriendly("cancelled")) },
};
