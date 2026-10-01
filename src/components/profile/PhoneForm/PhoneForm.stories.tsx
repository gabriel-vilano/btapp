import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { PhoneForm, type PhoneAction } from "./PhoneForm";
import { PhoneLoadError } from "./PhoneLoadError";

// Tier 4: uma story por situação da tela do telefone (SCHEDULING.md M20–M25). O
// servidor é fake: as actions vêm por prop, como a página passa as de verdade.
const mobileFrame: Decorator = (Story) => (
  <div className="sb-width-393">
    <Story />
  </div>
);

const staysOnScreen: PhoneAction = async () => null;

const meta = {
  title: "Profile/PhoneForm",
  component: PhoneForm,
  decorators: [mobileFrame],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
    docs: {
      description: {
        component:
          "Telefone para o WhatsApp: número do Brasil com DDD, consentimento com a caixa desmarcada (M21) e, com número salvo, apagar (M25).",
      },
    },
  },
  args: {
    currentPhone: null,
    savePhone: fn(staysOnScreen),
    deletePhone: fn(staysOnScreen),
  },
  argTypes: {
    savePhone: { control: false },
    deletePhone: { control: false },
  },
} satisfies Meta<typeof PhoneForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByLabelText("Telefone")).toHaveValue("");
    // Consentimento nunca vem marcado (M21), e sem número não há o que apagar
    await expect(canvas.getByRole("checkbox")).not.toBeChecked();
    await expect(canvas.queryByRole("button", { name: "Apagar telefone" })).not.toBeInTheDocument();
  },
};

export const WithSavedPhone: Story = {
  args: { currentPhone: "+5531999990001" },
  play: async ({ canvas }) => {
    await expect(await canvas.findByLabelText("Telefone")).toHaveValue("(31) 99999-0001");
    // Salvar de novo é consentir de novo: a caixa começa desmarcada mesmo com número
    await expect(canvas.getByRole("checkbox")).not.toBeChecked();
    await expect(canvas.getByRole("button", { name: "Apagar telefone" })).toBeInTheDocument();
  },
};

export const ConsentRequired: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.type(await canvas.findByLabelText("Telefone"), "31999990001");
    await userEvent.click(canvas.getByRole("button", { name: "Salvar telefone" }));
    await expect(await canvas.findByText("Marque a caixa para salvar o telefone")).toBeInTheDocument();
    await expect(args.savePhone).not.toHaveBeenCalled();
  },
};

export const InvalidPhone: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.type(await canvas.findByLabelText("Telefone"), "+1 415 555 0101");
    await userEvent.click(canvas.getByRole("checkbox"));
    await userEvent.click(canvas.getByRole("button", { name: "Salvar telefone" }));
    await expect(await canvas.findByText(/^Telefone inválido/)).toBeInTheDocument();
    await expect(args.savePhone).not.toHaveBeenCalled();
  },
};

export const ServerError: Story = {
  args: { savePhone: fn<PhoneAction>(async () => ({ error: "Não foi possível salvar. Tente novamente." })) },
  play: async ({ args, canvas }) => {
    await userEvent.type(await canvas.findByLabelText("Telefone"), "31999990001");
    await userEvent.click(canvas.getByRole("checkbox"));
    await userEvent.click(canvas.getByRole("button", { name: "Salvar telefone" }));
    await waitFor(() => expect(args.savePhone).toHaveBeenCalled());
    await expect(await canvas.findByText("Não foi possível salvar. Tente novamente.")).toBeInTheDocument();
  },
};

export const LoadError: Story = {
  render: () => <PhoneLoadError />,
};
