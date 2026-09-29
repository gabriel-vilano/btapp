import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ToastVisual, ToastProvider, useToast } from "./Toast";
import { Button } from "@/src/components/ui/Button";

const meta = {
  title: "UI/Toast",
  component: ToastVisual,
  parameters: {
    docs: {
      description: {
        component:
          "ToastVisual é o componente apresentacional do toast — um único toast com tipo, mensagem e dismiss. ToastProvider + useToast (no fim deste arquivo) orquestram a fila e o ciclo de vida.",
      },
    },
  },
  args: {
    type: "info",
    message: "Mensagem do toast",
    exiting: false,
    onDismiss: fn(),
  },
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["info", "success", "error"],
    },
    exiting: { control: "boolean" },
    message: { control: "text" },
  },
} satisfies Meta<typeof ToastVisual>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    type: "info",
    message: "Novo torneio na sua região",
  },
};

export const Success: Story = {
  args: {
    type: "success",
    message: "Inscrição confirmada com sucesso",
  },
};

export const Error: Story = {
  args: {
    type: "error",
    message: "Sem conexão com o servidor",
  },
};

export const Exiting: Story = {
  args: {
    type: "info",
    message: "Saindo da tela...",
    exiting: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Estado de saída — quando exiting=true, o toast aplica animação de exit. Em produção, dura ~170ms antes de ser removido do DOM.",
      },
    },
  },
};

export const DismissFocused: Story = {
  args: {
    type: "error",
    message: "Sem conexão com o servidor",
  },
  play: async ({ args, canvas, userEvent }) => {
    const dismiss = canvas.getByRole("button", { name: "Fechar" });
    await userEvent.tab();
    await expect(dismiss).toHaveFocus();
    await expect(dismiss).toHaveAttribute("type", "button");

    // Regra do DS: botão só de ícone tem área tocável de 48×48
    const { width, height } = dismiss.getBoundingClientRect();
    await expect(width).toBeGreaterThanOrEqual(48);
    await expect(height).toBeGreaterThanOrEqual(48);

    await userEvent.keyboard("{Enter}");
    await expect(args.onDismiss).toHaveBeenCalledOnce();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fechar focado pelo teclado. A área tocável é de 48×48, maior que o ícone, sem aumentar o toast.",
      },
    },
  },
};

export const AllTypes: Story = {
  render: (args) => (
    <div className="sb-stack">
      <ToastVisual {...args} type="info" message="Informação" />
      <ToastVisual {...args} type="success" message="Sucesso" />
      <ToastVisual {...args} type="error" message="Erro" />
    </div>
  ),
};

function Triggers() {
  const { showToast } = useToast();
  return (
    <div className="sb-row">
      <Button
        variant="primary"
        onClick={() => showToast("Inscrição confirmada com sucesso", "success")}
      >
        Disparar success
      </Button>
      <Button
        variant="secondary"
        onClick={() => showToast("Sem conexão com o servidor", "error")}
      >
        Disparar error
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          showToast("Novo torneio disponível na sua região", "info")
        }
      >
        Disparar info
      </Button>
    </div>
  );
}

function PersistentTrigger() {
  const { showToast } = useToast();
  return (
    <Button
      variant="primary"
      onClick={() =>
        showToast("Não some sozinho — clique no X pra fechar", "info", {
          persistent: true,
        })
      }
    >
      Disparar persistente
    </Button>
  );
}

export const ProviderTriggers: Story = {
  name: "Provider · Triggers",
  render: () => (
    <ToastProvider>
      <Triggers />
    </ToastProvider>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Demonstração interativa do ciclo de vida completo: ToastProvider envolvendo botões que disparam showToast() via useToast(). Auto-dismiss em 4s.",
      },
    },
  },
};

export const ProviderPersistent: Story = {
  name: "Provider · Persistent",
  render: () => (
    <ToastProvider>
      <PersistentTrigger />
    </ToastProvider>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Toast persistente — passa options.persistent=true em showToast(). Não some sozinho; usuário precisa clicar no X.",
      },
    },
  },
};
