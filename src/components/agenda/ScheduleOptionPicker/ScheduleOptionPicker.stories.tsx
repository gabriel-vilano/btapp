import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import type { ScheduleOption } from "@/src/types/domain";
import { ScheduleOptionPicker } from "./ScheduleOptionPicker";

// "Agora" fixo: quinta, 1º de outubro, 9h em Brasília. Sem isso, as opções
// passariam com o tempo e as stories mudariam sozinhas.
const NOW = "2026-10-01T12:00:00.000Z";

const SAT_14H: ScheduleOption = { starts_at: "2026-10-03T17:00:00.000Z", venue: "Arena Sunset" };
const SUN_10H: ScheduleOption = { starts_at: "2026-10-04T13:00:00.000Z", venue: "Arena Sunset" };
const WED_19H30: ScheduleOption = { starts_at: "2026-10-07T22:30:00.000Z", venue: null };
const THU_8H_PAST: ScheduleOption = { starts_at: "2026-10-01T11:00:00.000Z", venue: "Arena Praia Norte" };

const meta = {
  title: "Agenda/ScheduleOptionPicker",
  component: ScheduleOptionPicker,
  parameters: {
    docs: {
      description: {
        component:
          "As 2 ou 3 opções de horário de uma proposta como cartões de escolha única, com o botão que confirma a opção escolhida e a saída \"Nenhum serve\".",
      },
    },
  },
  args: {
    options: [SAT_14H, SUN_10H, WED_19H30],
    now: NOW,
    confirming: false,
    onConfirm: fn(),
    onNoneWorks: fn(),
  },
  argTypes: {
    options: { control: false },
    now: { control: "text" },
    confirming: { control: "boolean" },
    label: { control: "text" },
    onConfirm: { table: { disable: true } },
    onNoneWorks: { table: { disable: true } },
  },
} satisfies Meta<typeof ScheduleOptionPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    // Nada vem escolhido: o botão só diz o que faz depois da escolha
    const confirm = canvas.getByRole("button", { name: "Marcar jogo" });
    await expect(confirm).toBeDisabled();
    for (const radio of canvas.getAllByRole("radio")) {
      await expect(radio).not.toBeChecked();
    }
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

export const Selected: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const option = canvas.getByRole("radio", { name: /Sábado, 3 de outubro/ });
    await userEvent.click(option);
    await expect(option).toBeChecked();

    const confirm = canvas.getByRole("button", { name: "Marcar jogo · sáb, 3 out, 14h" });
    await expect(confirm).toBeEnabled();

    // Regra do DS: cada cartão tem pelo menos 48px de área tocável
    await expect(option.closest("label")?.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);

    await userEvent.click(confirm);
    await expect(args.onConfirm).toHaveBeenCalledWith(0);
  },
};

export const KeyboardFocus: Story = {
  play: async ({ canvas, userEvent }) => {
    // Tab entra no grupo; as setas trocam a opção, como em todo grupo de rádios
    await userEvent.tab();
    const [first, second] = canvas.getAllByRole("radio");
    await expect(first).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(second).toHaveFocus();
    await expect(second).toBeChecked();
    await expect(canvas.getByRole("button", { name: "Marcar jogo · dom, 4 out, 10h" })).toBeEnabled();
  },
};

export const TwoOptions: Story = {
  args: { options: [SAT_14H, WED_19H30] },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("radio")).toHaveLength(2);
  },
};

export const WithoutVenue: Story = {
  args: {
    options: [
      { ...SAT_14H, venue: null },
      { ...SUN_10H, venue: null },
    ],
  },
  play: async ({ canvas }) => {
    // Arena é opcional (M5): sem ela, o cartão diz que ainda vai ser combinada
    await expect(canvas.getAllByText("Arena a combinar")).toHaveLength(2);
  },
};

export const UnavailableOption: Story = {
  args: { options: [THU_8H_PAST, SAT_14H, SUN_10H] },
  play: async ({ canvas, userEvent, args }) => {
    // Horário que já passou não pode mais ser aceito (M12)
    const past = canvas.getByRole("radio", { name: /Horário já passou/ });
    await expect(past).toBeDisabled();
    await userEvent.click(past.closest("label") as HTMLElement);
    await expect(past).not.toBeChecked();
    await expect(canvas.getByRole("button", { name: "Marcar jogo" })).toBeDisabled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

export const AllOptionsPast: Story = {
  args: { now: "2026-10-10T12:00:00.000Z" },
  play: async ({ canvas }) => {
    // Todas passaram: a proposta expira (M12), e só resta propor outros horários
    for (const radio of canvas.getAllByRole("radio")) {
      await expect(radio).toBeDisabled();
    }
    await expect(canvas.getByRole("button", { name: "Nenhum serve, propor outros horários" })).toBeEnabled();
  },
};

export const NoneWorks: Story = {
  play: async ({ canvas, userEvent, args }) => {
    // Não existe "Recusar" vazio: quem não pode propõe outros horários (M9)
    await userEvent.click(canvas.getByRole("button", { name: "Nenhum serve, propor outros horários" }));
    await expect(args.onNoneWorks).toHaveBeenCalledTimes(1);
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

// O consumidor liga o `confirming` enquanto grava o aceite
function ConfirmingPicker(props: ComponentProps<typeof ScheduleOptionPicker>) {
  const [confirming, setConfirming] = useState(false);
  return (
    <ScheduleOptionPicker
      {...props}
      confirming={confirming}
      onConfirm={(index) => {
        setConfirming(true);
        props.onConfirm(index);
      }}
    />
  );
}

export const Confirming: Story = {
  render: (args) => <ConfirmingPicker {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: /Sábado, 3 de outubro/ }));
    const confirm = canvas.getByRole("button", { name: "Marcar jogo · sáb, 3 out, 14h" });
    await userEvent.click(confirm);

    // Enquanto grava, nada muda de escolha e não dá para confirmar duas vezes
    await expect(confirm).toHaveAttribute("aria-busy", "true");
    for (const radio of canvas.getAllByRole("radio")) {
      await expect(radio).toBeDisabled();
    }
    await expect(canvas.getByRole("button", { name: "Nenhum serve, propor outros horários" })).toBeDisabled();
  },
};
