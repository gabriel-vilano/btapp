import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { ToastProvider } from "@/src/components/ui/Toast";
import { InterestToggle } from "./InterestToggle";

// Os 4 estados da EX33: desligado, ligado, enviando e erro. "Enviando" e
// "erro" só aparecem depois de um toque, então as stories tocam no `play`
const meta = {
  title: "Competitions/InterestToggle",
  component: InterestToggle,
  decorators: [
    (Story) => (
      <ToastProvider>
        <div className="sb-pad">
          <Story />
        </div>
      </ToastProvider>
    ),
  ],
  args: { initialInterested: false, registerInterest: fn(async () => ({ ok: true })) },
  argTypes: { registerInterest: { control: false } },
} satisfies Meta<typeof InterestToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Tenho interesse" }));
    await expect(await canvas.findByRole("button", { name: "Interesse registrado" })).toBeEnabled();
    await expect(args.registerInterest).toHaveBeenCalledWith(true);
    await expect(canvas.getByText("Interesse registrado", { selector: "[aria-live]" })).toBeInTheDocument();
  },
};

export const On: Story = {
  args: { initialInterested: true },
  play: async ({ args, canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Interesse registrado" }));
    await expect(await canvas.findByRole("button", { name: "Tenho interesse" })).toBeEnabled();
    await expect(args.registerInterest).toHaveBeenCalledWith(false);
    await expect(canvas.getByText("Interesse removido", { selector: "[aria-live]" })).toBeInTheDocument();
  },
};

// O registro não volta: o botão fica ocupado, com o spinner, e não aceita outro toque
export const Sending: Story = {
  args: { registerInterest: fn(() => new Promise(() => {})) },
  play: async ({ canvas }) => {
    const button = await canvas.findByRole("button", { name: "Tenho interesse" });
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toBeDisabled();
  },
};

// O registro falha: o botão fica como estava e o Toast avisa
export const Failed: Story = {
  args: { registerInterest: fn(async () => ({ ok: false })) },
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Tenho interesse" }));
    // O Toast entra com fade: confere o alerta, não a opacidade da animação
    const toast = await canvas.findByText("Não foi possível registrar. Tente de novo.");
    await expect(toast.closest('[role="alert"]')).not.toBeNull();
    await expect(canvas.getByRole("button", { name: "Tenho interesse" })).toBeEnabled();
  },
};

// Queda de rede (a promessa rejeita): o mesmo aviso
export const NetworkError: Story = {
  args: { registerInterest: fn(async () => Promise.reject(new TypeError("Failed to fetch"))) },
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Tenho interesse" }));
    // O Toast entra com fade: confere o alerta, não a opacidade da animação
    const toast = await canvas.findByText("Não foi possível registrar. Tente de novo.");
    await expect(toast.closest('[role="alert"]')).not.toBeNull();
    await expect(canvas.getByRole("button", { name: "Tenho interesse" })).toBeEnabled();
  },
};
