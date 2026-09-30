import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, within } from "storybook/test";
import { ScheduleForm } from "./ScheduleForm";

// "Agora" fixo: quinta, 1º/10, 9h em Brasília. A rodada fecha na terça, 6/10, 23h59.
const NOW = "2026-10-01T12:00:00.000Z";
const ROUND_DEADLINE = "2026-10-07T02:59:00.000Z";

/** O Dialog abre num portal, fora do canvas da story. */
async function findForm(name: string) {
  return within(await screen.findByRole("dialog", { name }));
}

const meta = {
  title: "Agenda/ScheduleForm",
  component: ScheduleForm,
  parameters: {
    docs: {
      description: {
        component:
          "Formulário num BottomSheet para propor 2 ou 3 horários (M5, M6) ou informar a data combinada fora do app (M14). Valida campo a campo e só entrega opções válidas.",
      },
    },
  },
  args: {
    open: true,
    mode: "propose",
    now: NOW,
    roundDeadline: ROUND_DEADLINE,
    onClose: fn(),
    onSubmit: fn(),
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["propose", "report"] },
    initialOptions: { control: false },
    onClose: { table: { disable: true } },
    onSubmit: { table: { disable: true } },
  },
} satisfies Meta<typeof ScheduleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Propose: Story = {
  play: async ({ args }) => {
    const form = await findForm("Propor horários");
    await expect(form.getByLabelText("1º horário")).toHaveAttribute("min", "2026-10-01T09:00");
    await expect(form.getByLabelText("2º horário")).toHaveAttribute("max", "2026-10-06T23:59");
    await expect(form.queryByLabelText("3º horário")).not.toBeInTheDocument();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const ProposeWithErrors: Story = {
  play: async ({ args, userEvent }) => {
    const form = await findForm("Propor horários");
    await userEvent.type(form.getByLabelText("1º horário"), "2026-09-30T19:00");
    await userEvent.click(form.getByRole("button", { name: "Enviar proposta" }));
    await expect(form.getByText("Escolha um horário que ainda não passou.")).toBeInTheDocument();
    await expect(form.getByText("Escolha a data e a hora.")).toBeInTheDocument();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const ThreeOptions: Story = {
  play: async ({ args, userEvent }) => {
    const form = await findForm("Propor horários");
    await userEvent.click(form.getByRole("button", { name: "Adicionar 3º horário" }));
    await userEvent.type(form.getByLabelText("1º horário"), "2026-10-03T14:00");
    await userEvent.type(form.getByLabelText("2º horário"), "2026-10-04T10:00");
    await userEvent.type(form.getByLabelText("3º horário"), "2026-10-06T19:30");
    await userEvent.type(form.getByLabelText("Arena (opcional)"), "  Arena Sunset ");
    await userEvent.click(form.getByRole("button", { name: "Enviar proposta" }));
    // O horário digitado é o de Brasília, e a arena vai sem os espaços das pontas
    await expect(args.onSubmit).toHaveBeenCalledWith([
      { starts_at: "2026-10-03T17:00:00.000Z", venue: "Arena Sunset" },
      { starts_at: "2026-10-04T13:00:00.000Z", venue: "Arena Sunset" },
      { starts_at: "2026-10-06T22:30:00.000Z", venue: "Arena Sunset" },
    ]);
  },
};

export const ChangeProposal: Story = {
  args: {
    initialOptions: [
      { starts_at: "2026-10-03T17:00:00.000Z", venue: "Arena Sunset" },
      { starts_at: "2026-10-04T13:00:00.000Z", venue: "Arena Sunset" },
      { starts_at: "2026-10-06T22:30:00.000Z", venue: "Arena Sunset" },
    ],
  },
  play: async () => {
    // "Trocar horários" parte da proposta atual
    const form = await findForm("Propor horários");
    await expect(form.getByLabelText("3º horário")).toHaveValue("2026-10-06T19:30");
    await expect(form.getByLabelText("Arena (opcional)")).toHaveValue("Arena Sunset");
    await expect(form.getByRole("button", { name: "Remover 3º horário" })).toBeInTheDocument();
  },
};

export const Report: Story = {
  args: { mode: "report" },
  play: async ({ args, userEvent }) => {
    const form = await findForm("Informar data combinada");
    // A data informada não tem limite de horário (M14): o combinado vale como veio
    await expect(form.getByLabelText("Data e hora")).not.toHaveAttribute("min");
    await userEvent.type(form.getByLabelText("Data e hora"), "2026-10-02T19:00");
    await userEvent.click(form.getByRole("button", { name: "Informar data" }));
    await expect(args.onSubmit).toHaveBeenCalledWith([{ starts_at: "2026-10-02T22:00:00.000Z", venue: null }]);
  },
};
