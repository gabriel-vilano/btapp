import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ResendTimer } from "./ResendTimer";

const meta = {
  title: "Auth/ResendTimer",
  component: ResendTimer,
  parameters: {
    docs: {
      description: {
        component:
          "Countdown de 60s antes de permitir reenvio. Inicia rodando (não tem prop pra controlar countdown externamente). Após zerar, vira botão clicável; em loading, fica desabilitado.",
      },
    },
    layout: "padded",
  },
  args: {
    onResend: fn(),
    loading: false,
  },
  argTypes: {
    loading: { control: "boolean" },
    initialCountdown: { control: { type: "number", min: 0, max: 60 } },
  },
} satisfies Meta<typeof ResendTimer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CountingDown: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Estado inicial — timer começa em 60s e decresce. Espere 60s pra ver virar botão de reenvio (ou recarregue a story pra resetar).",
      },
    },
  },
};

export const Available: Story = {
  args: {
    initialCountdown: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Contagem zerada: o texto vira o botão \"Reenviar código\". Clicar chama `onResend` e reinicia a contagem em 60s.",
      },
    },
  },
};

export const AvailableFocused: Story = {
  args: {
    initialCountdown: 0,
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "Reenviar código" }),
    ).toHaveFocus();
  },
  parameters: {
    docs: {
      description: {
        story: "Botão de reenvio focado pelo teclado, com o ring de foco do DS.",
      },
    },
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Quando `loading=true`, o botão de reenvio fica desabilitado mesmo após o countdown terminar — use durante a chamada async de reenvio.",
      },
    },
  },
};
