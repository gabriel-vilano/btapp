import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, waitFor, within } from "storybook/test";
import { SidePicker } from "./SidePicker";
import { EMPTY_SIDE_SLOTS, type PickablePlayer, type SideSlots } from "./sidePickerModel";

function player(id: string, name: string, username: string, isFriend = false): PickablePlayer {
  return { id, name, username, avatarUrl: null, isFriend };
}

const SELF = player("lucas", "Lucas Silva", "lucassilva");

const PLAYERS: PickablePlayer[] = [
  player("pedro", "Pedro Henrique", "pedrohenrique", true),
  player("rafael", "Rafael Costa", "rafaelcosta", true),
  player("thiago", "Thiago Mendes", "thiagomendes"),
  player("andre", "André Lima", "andrelima"),
  player("caio", "Caio Ferreira", "caioferreira"),
  player("paulo", "Paulo César Duarte de Albuquerque Figueiredo", "paulocesarduartedealbuquerque"),
];

function StatefulSidePicker(props: ComponentProps<typeof SidePicker>) {
  const [value, setValue] = useState<SideSlots>(props.value);
  return (
    <SidePicker
      {...props}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        props.onValueChange(next);
      }}
    />
  );
}

const meta = {
  title: "UI/SidePicker",
  component: SidePicker,
  parameters: {
    docs: {
      description: {
        component:
          "Os dois lados de uma partida: quem escolhe já está no lado dele e escolhe o parceiro e os adversários, por busca, com os amigos primeiro.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="sb-screen-frame">
        <Story />
      </div>
    ),
  ],
  args: {
    modality: "doubles",
    self: SELF,
    players: PLAYERS,
    value: EMPTY_SIDE_SLOTS,
    onValueChange: fn(),
  },
  argTypes: {
    modality: { control: "inline-radio", options: ["singles", "doubles"] },
    self: { control: false },
    players: { control: false },
    value: { control: false },
    onValueChange: { table: { disable: true } },
  },
  render: (args) => <StatefulSidePicker {...args} />,
} satisfies Meta<typeof SidePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A busca abre num portal, fora do canvas da story. */
function findSearch(title: string): Promise<HTMLElement> {
  return screen.findByRole("dialog", { name: title });
}

export const Doubles: Story = {};

export const Singles: Story = {
  args: { modality: "singles" },
};

export const Filled: Story = {
  args: { value: { partner: "pedro", opponent1: "thiago", opponent2: "paulo" } },
};

export const SinglesFilled: Story = {
  args: { modality: "singles", value: { ...EMPTY_SIDE_SLOTS, opponent1: "thiago" } },
};

/** Sem termo, a busca sugere os amigos; quem já está numa vaga sai da lista (RG17). */
export const FriendsFirst: Story = {
  args: { value: { ...EMPTY_SIDE_SLOTS, partner: "rafael" } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Escolher adversário 1" }));
    const search = await findSearch("Escolher adversário 1");
    const friends = within(search).getByRole("list", { name: "Amigos" });
    await expect(within(friends).getAllByRole("button").map((row) => row.textContent)).toEqual([
      expect.stringContaining("Pedro Henrique"),
    ]);
  },
};

export const PickBySearch: Story = {
  args: { modality: "singles" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Escolher adversário" }));
    const search = await findSearch("Escolher adversário");
    await userEvent.type(within(search).getByRole("searchbox", { name: "Buscar jogador" }), "@thiago");
    await userEvent.click(within(search).getByRole("button", { name: /Thiago Mendes/ }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onValueChange).toHaveBeenLastCalledWith({ ...EMPTY_SIDE_SLOTS, opponent1: "thiago" });
    await expect(canvas.getByRole("button", { name: "Remover Thiago Mendes" })).toBeVisible();
    // O botão da vaga sumiu: o foco vai para quem entrou nela
    await waitFor(() => expect(canvas.getByText("Thiago Mendes").parentElement).toHaveFocus());
  },
};

export const NoResults: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Escolher parceiro" }));
    const search = await findSearch("Escolher parceiro");
    await userEvent.type(within(search).getByRole("searchbox", { name: "Buscar jogador" }), "zé ninguém");
    await expect(within(search).getByRole("status")).toHaveTextContent('Nenhum jogador encontrado para "zé ninguém".');
  },
};

export const RemovePlayer: Story = {
  args: { value: { partner: "pedro", opponent1: "thiago", opponent2: "caio" } },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Remover Thiago Mendes" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith({ partner: "pedro", opponent1: null, opponent2: "caio" });
    await expect(canvas.getByRole("button", { name: "Escolher adversário 1" })).toBeVisible();
  },
};
