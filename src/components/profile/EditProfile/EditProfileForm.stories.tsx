import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { STORY_AVATAR_URL } from "@/src/components/ui/Avatar/storyFixtures";
import type { EditableProfile } from "@/src/lib/profileEdit";
import { EditProfileForm, type SaveProfile } from "./EditProfileForm";
import { EditProfileLoadError } from "./EditProfileLoadError";
import type { CheckUsername } from "./useUsernameAvailability";

// Tier 4: uma story por situação do "Editar perfil" (PROFILE.md PF9). O servidor é
// fake: `saveProfile` e `checkUsername` vêm por prop, como a página passa as actions.
const mobileFrame: Decorator = (Story) => (
  <div className="sb-width-393">
    <Story />
  </div>
);

const LUCAS: EditableProfile = {
  firstName: "Lucas",
  lastName: "Silva",
  username: "lucas.bt",
  avatarUrl: STORY_AVATAR_URL,
  birthDate: "1990-05-12",
};

// A consulta espera o jogador parar de digitar (500ms): folga para a CI ocupada
const CHECK_TIMEOUT = { timeout: 3000 };

// "pedro" já é de outro jogador; qualquer outro @username está livre
const checkUsername: CheckUsername = async (username) => ({ available: username !== "pedro" });

const savesWithoutLeaving: SaveProfile = async () => null;

const meta = {
  title: "Profile/EditProfileForm",
  component: EditProfileForm,
  decorators: [mobileFrame],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
    docs: {
      description: {
        component:
          "Editar perfil em tela cheia (PF9): foto, nome, sobrenome, @username com unicidade em tempo real e data de nascimento opcional.",
      },
    },
  },
  args: {
    profile: LUCAS,
    today: "2026-10-01",
    saveProfile: fn(savesWithoutLeaving),
    checkUsername,
  },
  argTypes: {
    profile: { control: false },
    saveProfile: { control: false },
    checkUsername: { control: false },
  },
} satisfies Meta<typeof EditProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Filled: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByLabelText("Nome de usuário")).toHaveValue("lucas.bt");
    await expect(canvas.getByLabelText("Data de nascimento")).toHaveAccessibleDescription(
      "Não aparece no perfil. Serve para as categorias com idade."
    );
  },
};

export const WithoutPhotoAndBirthDate: Story = {
  args: { profile: { ...LUCAS, avatarUrl: null, birthDate: "" } },
};

export const UsernameTaken: Story = {
  play: async ({ canvas }) => {
    const field = await canvas.findByLabelText("Nome de usuário");
    await userEvent.clear(field);
    await userEvent.type(field, "pedro");
    await expect(await canvas.findByText("Nome de usuário já está em uso", {}, CHECK_TIMEOUT)).toBeInTheDocument();
  },
};

export const UsernameAvailable: Story = {
  play: async ({ canvas }) => {
    const field = await canvas.findByLabelText("Nome de usuário");
    await userEvent.type(field, "2");
    await expect(await canvas.findByText("Nome de usuário disponível", {}, CHECK_TIMEOUT)).toBeInTheDocument();
  },
};

// O jogador volta ao próprio @username: é dele, então não consulta nem marca erro
export const OwnUsernameIsNotChecked: Story = {
  args: { checkUsername: fn(checkUsername) },
  play: async ({ args, canvas }) => {
    const field = await canvas.findByLabelText("Nome de usuário");
    await userEvent.type(field, "x");
    await userEvent.type(field, "{Backspace}");
    await expect(field).toHaveValue("lucas.bt");
    await expect(canvas.queryByText("Verificando disponibilidade...")).not.toBeInTheDocument();
    await expect(args.checkUsername).not.toHaveBeenCalledWith("lucas.bt");
  },
};

export const ValidationErrors: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.clear(await canvas.findByLabelText("Nome"));
    await userEvent.click(canvas.getByRole("button", { name: "Salvar" }));
    await expect(await canvas.findByText("Nome é obrigatório")).toBeInTheDocument();
    await expect(args.saveProfile).not.toHaveBeenCalled();
  },
};

export const ServerError: Story = {
  args: { saveProfile: fn<SaveProfile>(async () => ({ error: "Não foi possível salvar. Tente novamente." })) },
  play: async ({ args, canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(args.saveProfile).toHaveBeenCalled());
    await expect(await canvas.findByText("Não foi possível salvar. Tente novamente.")).toBeInTheDocument();
  },
};

export const LoadError: Story = {
  render: () => <EditProfileLoadError />,
};
