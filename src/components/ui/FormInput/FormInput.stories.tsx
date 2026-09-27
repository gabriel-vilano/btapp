import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { FormInput } from "./FormInput";

const meta = {
  title: "UI/FormInput",
  component: FormInput,
  parameters: {
    docs: {
      description: {
        component:
          "Input controlado com label, validação inline e suporte a password (toggle eye). Estados de validação só aparecem quando há valor digitado.",
      },
    },
  },
  args: {
    label: "Email",
    name: "email",
    type: "email",
    value: "",
    placeholder: "voce@exemplo.com",
    onChange: fn(),
    onBlur: fn(),
  },
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["text", "email", "password"],
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    error: { control: "text" },
    valid: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof FormInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    value: "gabriel@letzplay.com",
  },
};

export const Valid: Story = {
  args: {
    value: "gabriel@letzplay.com",
    valid: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Ícone de check aparece à direita quando valid=true e há valor digitado.",
      },
    },
  },
};

export const Invalid: Story = {
  args: {
    value: "gabriel@",
    error: "Email inválido — use o formato voce@exemplo.com",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Ícone de X aparece à direita; mensagem de erro abaixo do input com role=alert e aria-describedby.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    value: "gabriel@letzplay.com",
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    label: "Senha",
    name: "password",
    type: "password",
    value: "minhasenha123",
    placeholder: "Digite sua senha",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Type=password mostra um toggle (olho/olho riscado) à direita pra mostrar ou ocultar a senha. Aria-label do botão muda conforme o estado.",
      },
    },
  },
};

export const Focused: Story = {
  args: {
    value: "gabriel@letzplay.com",
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByLabelText("Email")).toHaveFocus();
  },
  parameters: {
    docs: {
      description: {
        story: "Foco pelo teclado: borda `border-strong` e ring de foco do DS.",
      },
    },
  },
};

export const PasswordToggleFocused: Story = {
  args: {
    label: "Senha",
    name: "password",
    type: "password",
    value: "minhasenha123",
  },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole("button", { name: "Mostrar senha" });
    await userEvent.tab();
    await userEvent.tab();
    await expect(toggle).toHaveFocus();

    // Regra do DS: botão só de ícone tem área tocável de 48×48
    const { width, height } = toggle.getBoundingClientRect();
    await expect(width).toBeGreaterThanOrEqual(48);
    await expect(height).toBeGreaterThanOrEqual(48);

    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Senha")).toHaveAttribute("type", "text");
    await expect(toggle).toHaveAccessibleName("Ocultar senha");
  },
  parameters: {
    docs: {
      description: {
        story:
          "Toggle de senha focado pelo teclado. A área tocável é de 48×48, maior que o ícone, sem aumentar o campo.",
      },
    },
  },
};

export const WithLabelTrailing: Story = {
  args: {
    label: "Senha",
    name: "password",
    type: "password",
    value: "",
    labelTrailing: (
      <span className="sb-color-accent">Esqueci a senha</span>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "labelTrailing aceita qualquer ReactNode posicionado à direita do label — usado pra ações relacionadas como 'Esqueci a senha'.",
      },
    },
  },
};

export const AllStates: Story = {
  render: (args) => (
    <div className="sb-stack">
      <FormInput {...args} value="" />
      <FormInput {...args} value="gabriel@letzplay.com" valid />
      <FormInput
        {...args}
        value="gabriel@"
        error="Email inválido — use o formato voce@exemplo.com"
      />
      <FormInput {...args} value="gabriel@letzplay.com" disabled />
    </div>
  ),
};
