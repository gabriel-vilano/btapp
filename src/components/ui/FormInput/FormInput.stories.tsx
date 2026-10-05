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
          "Input controlado com label, validação inline, toggle de senha e tipos de telefone, busca, data e data e hora. Estados de validação só aparecem quando há valor digitado.",
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
      options: ["text", "email", "password", "tel", "search", "date", "datetime-local"],
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    error: { control: "text" },
    hint: { control: "text" },
    valid: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof FormInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    value: "gabriel@example.com",
  },
};

export const Valid: Story = {
  args: {
    value: "gabriel@example.com",
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
    value: "gabriel@example.com",
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
    value: "gabriel@example.com",
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
      <FormInput {...args} value="gabriel@example.com" valid />
      <FormInput
        {...args}
        value="gabriel@"
        error="Email inválido — use o formato voce@exemplo.com"
      />
      <FormInput {...args} value="gabriel@example.com" disabled />
    </div>
  ),
};

const telArgs = {
  label: "Telefone (WhatsApp)",
  name: "phone",
  type: "tel",
  placeholder: "(11) 91234-5678",
} as const;

export const Tel: Story = {
  args: { ...telArgs, value: "(11) 91234-5678" },
  play: async ({ canvas }) => {
    const field = canvas.getByLabelText("Telefone (WhatsApp)");
    await expect(field).toHaveAttribute("type", "tel");
    await expect(field).toHaveAttribute("autocomplete", "tel");
  },
  parameters: {
    docs: {
      description: {
        story:
          "Teclado de telefone no celular e `autocomplete=\"tel\"` por padrão, para o sistema sugerir o número do próprio aparelho.",
      },
    },
  },
};

const searchArgs = {
  label: "Buscar jogador",
  name: "search",
  type: "search",
  placeholder: "Nome ou @username",
} as const;

export const Search: Story = {
  args: { ...searchArgs, value: "" },
  play: async ({ canvas }) => {
    const field = canvas.getByRole("searchbox", { name: "Buscar jogador" });
    await expect(field).toHaveAttribute("enterkeyhint", "search");
    await expect(field).toHaveAttribute("autocomplete", "off");
  },
  parameters: {
    docs: {
      description: {
        story:
          "Lupa à esquerda e tecla \"Buscar\" no teclado (`enterKeyHint`). O X nativo fica escondido.",
      },
    },
  },
};

const dateTimeArgs = {
  label: "Opção 1",
  name: "option-1",
  type: "datetime-local",
  min: "2026-09-28T06:00",
  max: "2026-10-04T23:59",
} as const;

export const DateTime: Story = {
  args: { ...dateTimeArgs, value: "2026-10-02T19:30" },
  play: async ({ canvas }) => {
    const field = canvas.getByLabelText("Opção 1");
    await expect(field).toHaveAttribute("type", "datetime-local");
    await expect(field).toHaveAttribute("min", "2026-09-28T06:00");
    await expect(field).toHaveAttribute("max", "2026-10-04T23:59");
  },
  parameters: {
    docs: {
      description: {
        story:
          "Data e hora num campo só. O valor é `AAAA-MM-DDTHH:mm`, e o formato exibido segue o idioma do aparelho.",
      },
    },
  },
};

export const DateTimeInvalid: Story = {
  args: {
    ...dateTimeArgs,
    value: "2026-10-06T19:30",
    error: "Escolha um horário antes do prazo da rodada, 04/10 às 23:59",
  },
  parameters: {
    docs: {
      description: {
        story:
          "O picker do iOS deixa escolher fora de `min` e `max`, então o prazo é validado no código e o erro vem pela prop `error`.",
      },
    },
  },
};

const birthDateArgs = {
  label: "Data de nascimento",
  name: "birthDate",
  type: "date",
  placeholder: undefined,
  autoComplete: "bday",
  min: "1900-01-01",
  max: "2026-10-01",
  hint: "Não aparece no perfil. Serve para as categorias com idade.",
} as const;

export const BirthDate: Story = {
  args: { ...birthDateArgs, value: "1990-05-12" },
  play: async ({ canvas }) => {
    const field = canvas.getByLabelText("Data de nascimento");
    await expect(field).toHaveAttribute("type", "date");
    await expect(field).toHaveAccessibleDescription("Não aparece no perfil. Serve para as categorias com idade.");
  },
  parameters: {
    docs: {
      description: {
        story: "Só a data, no formato `AAAA-MM-DD`, com o texto de apoio (`hint`) abaixo do campo.",
      },
    },
  },
};

export const HintReplacedByError: Story = {
  args: { ...birthDateArgs, value: "2027-01-01", error: "A data de nascimento não pode ser no futuro" },
  play: async ({ canvas }) => {
    const field = canvas.getByLabelText("Data de nascimento");
    await expect(field).toHaveAccessibleDescription("A data de nascimento não pode ser no futuro");
    await expect(canvas.queryByText(birthDateArgs.hint)).not.toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: "Com erro, a mensagem toma o lugar do texto de apoio: o campo nunca tem duas linhas abaixo.",
      },
    },
  },
};

export const NewTypesFocused: Story = {
  render: (args) => (
    <div className="sb-stack">
      <FormInput {...args} {...telArgs} value="" />
      <FormInput {...args} {...searchArgs} value="" />
      <FormInput {...args} {...dateTimeArgs} value="" />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByLabelText("Telefone (WhatsApp)")).toHaveFocus();
  },
  parameters: {
    docs: {
      description: {
        story: "Os três tipos vazios, com o telefone focado pelo teclado.",
      },
    },
  },
};

export const AllTypes: Story = {
  render: (args) => (
    <div className="sb-stack">
      <FormInput {...args} {...telArgs} value="" />
      <FormInput {...args} {...telArgs} value="(11) 91234-5678" valid />
      <FormInput
        {...args}
        {...telArgs}
        value="1234"
        error="Telefone incompleto — use DDD + número, ex.: (11) 91234-5678"
      />
      <FormInput {...args} {...searchArgs} value="" />
      <FormInput {...args} {...searchArgs} value="Ana Souza" />
      <FormInput {...args} {...birthDateArgs} value="" />
      <FormInput {...args} {...birthDateArgs} value="1990-05-12" />
      <FormInput {...args} {...dateTimeArgs} value="" />
      <FormInput {...args} {...dateTimeArgs} value="2026-10-02T19:30" />
      <FormInput
        {...args}
        {...dateTimeArgs}
        value="2026-10-06T19:30"
        error="Escolha um horário antes do prazo da rodada, 04/10 às 23:59"
      />
    </div>
  ),
};
