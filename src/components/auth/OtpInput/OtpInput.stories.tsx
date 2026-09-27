import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import { OtpInput } from "./OtpInput";

const meta = {
  title: "Auth/OtpInput",
  component: OtpInput,
  parameters: {
    docs: {
      description: {
        component:
          "Input de código OTP — N dígitos numéricos, autocomplete one-time-code, focus automático no mount. Filtra não-dígitos durante typing. Tamanho default = 8 (constante OTP_LENGTH).",
      },
    },
    layout: "padded",
  },
  args: {
    value: "",
    onChange: fn(),
    length: 8,
  },
  argTypes: {
    value: { control: "text" },
    length: { control: { type: "number", min: 4, max: 10 } },
    error: { control: "text" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof OtpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByPlaceholderText("00000000")).toHaveFocus();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Estado vazio — placeholder mostra '00000000'. O campo já nasce focado (useEffect no mount), com borda `border-strong` e ring de foco do DS.",
      },
    },
  },
};

export const Partial: Story = {
  args: {
    value: "1234",
  },
  parameters: {
    docs: {
      description: {
        story: "4 dígitos digitados de 8 totais.",
      },
    },
  },
};

export const Complete: Story = {
  args: {
    value: "12345678",
  },
  parameters: {
    docs: {
      description: {
        story: "Todos os 8 dígitos preenchidos. Pronto pra submeter.",
      },
    },
  },
};

export const Invalid: Story = {
  args: {
    value: "12345678",
    error: "Código inválido — verifique e tente novamente",
  },
};

export const Disabled: Story = {
  args: {
    value: "12345678",
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Use durante submit em andamento ou após sucesso.",
      },
    },
  },
};

export const Interactive: Story = {
  render: function Render(args) {
    const [{ value }, updateArgs] = useArgs();
    return (
      <OtpInput
        {...args}
        value={value}
        onChange={(v) => updateArgs({ value: v })}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Story interativa — digite no input pra ver o filtro de não-dígitos em ação. Letras são silenciosamente removidas durante typing.",
      },
    },
  },
};
