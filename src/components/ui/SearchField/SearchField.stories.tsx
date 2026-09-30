import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SearchField } from "./SearchField";

type StatefulSearchFieldProps = Omit<ComponentProps<typeof SearchField>, "onValueChange"> & {
  onValueChange?: (value: string) => void;
};

function StatefulSearchField({ value, onValueChange, ...props }: StatefulSearchFieldProps) {
  const [term, setTerm] = useState(value);
  function handleValueChange(next: string) {
    setTerm(next);
    onValueChange?.(next);
  }
  return <SearchField {...props} value={term} onValueChange={handleValueChange} />;
}

const meta = {
  title: "UI/SearchField",
  component: SearchField,
  parameters: {
    docs: {
      description: {
        component:
          "Campo de busca com lupa, rótulo acessível oculto (\"Buscar\") e botão de limpar. Expõe foco e blur para a tela decidir quando mostrar os escopos.",
      },
    },
  },
  args: {
    value: "",
    placeholder: "Nome ou @username",
    onValueChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  argTypes: {
    onValueChange: { table: { disable: true } },
    onFocus: { table: { disable: true } },
    onBlur: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="sb-screen-frame">
        <Story />
      </div>
    ),
  ],
  render: (args) => <StatefulSearchField {...args} />,
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("searchbox", { name: "Buscar" });
    await expect(input).toHaveAttribute("placeholder", "Nome ou @username");
    // O rótulo existe para o leitor de tela, mas não ocupa espaço na tela
    await expect(canvas.getByText("Buscar").getBoundingClientRect().width).toBeLessThanOrEqual(1);
    // Sem texto, não há o que limpar
    await expect(canvas.queryByRole("button", { name: "Limpar busca" })).not.toBeInTheDocument();
  },
};

export const WithText: Story = {
  args: { value: "Vila" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("searchbox", { name: "Buscar" })).toHaveValue("Vila");
    await expect(canvas.getByRole("button", { name: "Limpar busca" })).toBeVisible();
  },
  parameters: {
    docs: {
      description: {
        story: "Com texto, o botão de limpar aparece à direita.",
      },
    },
  },
};

export const ClearReturnsFocus: Story = {
  args: { value: "Vila" },
  play: async ({ canvas, args, userEvent }) => {
    const input = canvas.getByRole("searchbox", { name: "Buscar" });
    const clear = canvas.getByRole("button", { name: "Limpar busca" });
    // Área tocável de 48px no botão de limpar
    const box = clear.getBoundingClientRect();
    await expect(box.width).toBe(48);
    await expect(box.height).toBe(48);

    // Limpar volta o campo a vazio e devolve o foco a ele
    await userEvent.click(clear);
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith("");
    await expect(canvas.queryByRole("button", { name: "Limpar busca" })).not.toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: "Limpar esvazia o campo e devolve o foco a ele.",
      },
    },
  },
};

export const Focused: Story = {
  play: async ({ canvas, args, userEvent }) => {
    const input = canvas.getByRole("searchbox", { name: "Buscar" });
    // Foco e blur chegam a quem usa, que mostra os escopos da busca (EX1)
    await userEvent.click(input);
    await expect(input).toHaveFocus();
    await expect(args.onFocus).toHaveBeenCalledTimes(1);

    await userEvent.type(input, "Ana");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("Ana");
    await expect(canvas.getByRole("button", { name: "Limpar busca" })).toBeVisible();

    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Limpar busca" })).toHaveFocus();
    await expect(args.onBlur).toHaveBeenCalledTimes(1);

    // Termina com o campo focado, para a story mostrar o estado de foco
    await userEvent.click(input);
  },
  parameters: {
    docs: {
      description: {
        story: "Com foco, a borda escurece e o ring de teclado aparece. `onFocus` e `onBlur` avisam a tela.",
      },
    },
  },
};

export const OtherScope: Story = {
  args: { placeholder: "Competição ou organizador" },
  parameters: {
    docs: {
      description: {
        story: "O placeholder vem de quem usa e muda com o escopo (EX3). O rótulo acessível continua \"Buscar\".",
      },
    },
  },
};
