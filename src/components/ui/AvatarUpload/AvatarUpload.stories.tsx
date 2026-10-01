import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within, type Mock } from "storybook/test";
import { AVATAR_MAX_BYTES } from "@/src/lib/validations";
import { AvatarUpload } from "./AvatarUpload";

const meta = {
  title: "Auth/AvatarUpload",
  component: AvatarUpload,
  parameters: {
    docs: {
      description: {
        component:
          "Upload de avatar com preview inline. Estado (preview/erro) é interno via useState — interaja clicando pra abrir o file picker. Para forçar estados visuais específicos sem refactor, ver nota em 'Design rationale' no MDX.",
      },
    },
    layout: "centered",
  },
  args: {
    onFileSelect: fn(),
  },
} satisfies Meta<typeof AvatarUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Estado inicial — sem avatar. Mostra ícone `+` e label 'Adicionar foto'. Clique abre o file picker do browser.",
      },
    },
  },
};

// Ruído aleatório não comprime: um JPEG de 3000×2000 com qualidade máxima passa de 1MB,
// como uma foto de celular. Gerado no browser para não versionar um binário grande.
async function buildLargePhoto(): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = 3000;
  canvas.height = 2000;
  const context = canvas.getContext("2d")!;
  const pixels = context.createImageData(canvas.width, canvas.height);
  for (let i = 0; i < pixels.data.length; i++) {
    pixels.data[i] = i % 4 === 3 ? 255 : Math.floor(Math.random() * 256);
  }
  context.putImageData(pixels, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 1));
  return new File([blob!], "foto-celular.jpg", { type: "image/jpeg" });
}

// O input fica com pointer-events: none (quem abre o seletor é o openPicker do
// wrapper), então a checagem de ponteiro do userEvent é desligada só aqui.
async function uploadPhoto(canvasElement: HTMLElement, file: File): Promise<void> {
  const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
  await userEvent.setup({ pointerEventsCheck: 0 }).upload(input, file);
}

// Decodificar a foto de ~17MB, reduzir e recodificar leva ~300ms numa máquina de 4
// núcleos. O timeout padrão do waitFor (1s) estourava na CI mais lenta, e a story
// falhava às vezes com "onFileSelect not called" (ENG-115).
const RESIZE_TIMEOUT_MS = 5000;

export const LargePhoto: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Foto de celular acima de 1MB. É reduzida para 512px e recomprimida em JPEG antes do preview, e `onFileSelect` recebe o arquivo já reduzido.",
      },
    },
  },
  // Regressão: foto de 1–5MB passava na tela e falhava no envio, recusada pelo bucket
  // ou pelo limite de body da server action, sem mensagem clara.
  play: async ({ args, canvasElement }) => {
    const photo = await buildLargePhoto();
    await expect(photo.size).toBeGreaterThan(AVATAR_MAX_BYTES);

    await uploadPhoto(canvasElement, photo);

    await waitFor(() => expect(args.onFileSelect).toHaveBeenCalled(), {
      timeout: RESIZE_TIMEOUT_MS,
    });
    const selected = (args.onFileSelect as Mock).mock.lastCall?.[0] as File;
    await expect(selected).toBeInstanceOf(File);
    await expect(selected.size).toBeLessThanOrEqual(AVATAR_MAX_BYTES);
    await expect(selected.type).toBe("image/jpeg");
    await expect(within(canvasElement).getByText("Trocar foto")).toBeInTheDocument();
  },
};

export const UnreadableFile: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Arquivo que declara ser imagem mas o browser não consegue decodificar. Mostra o erro e chama `onFileSelect(null)`.",
      },
    },
  },
  play: async ({ args, canvasElement }) => {
    const broken = new File(["não é uma imagem"], "foto.png", { type: "image/png" });

    await uploadPhoto(canvasElement, broken);

    await expect(
      await within(canvasElement).findByText("Não foi possível ler a foto. Tente outra imagem.")
    ).toBeInTheDocument();
    await expect(args.onFileSelect).toHaveBeenLastCalledWith(null);
  },
};
