import { useRef, useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, screen, waitFor } from "storybook/test";
import { Dialog } from "./Dialog";
import { Button } from "@/src/components/ui/Button";

type DialogDemoProps = ComponentProps<typeof Dialog> & {
  focusCancel?: boolean;
};

/** Gatilho + estado: o Dialog é controlado, então a story guarda o `open`. */
function DialogDemo({
  open: initialOpen,
  onClose,
  focusCancel = false,
  ...props
}: DialogDemoProps) {
  const [open, setOpen] = useState(initialOpen);
  const cancelRef = useRef<HTMLButtonElement>(null);
  function handleClose() {
    onClose();
    setOpen(false);
  }
  const confirmFooter = (
    <>
      <Button ref={cancelRef} variant="ghost" onClick={handleClose}>
        Cancelar
      </Button>
      <Button variant="primary">Contestar</Button>
    </>
  );
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Abrir
      </Button>
      <Dialog
        {...props}
        open={open}
        onClose={handleClose}
        footer={focusCancel ? confirmFooter : props.footer}
        initialFocusRef={focusCancel ? cancelRef : undefined}
      />
    </>
  );
}

const SCHEDULE_TEXT =
  "Escolha de 2 a 3 opções de data e horário. Sua dupla adversária aceita uma delas ou propõe outras.";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  render: (args) => <DialogDemo {...args} />,
  args: {
    open: false,
    onClose: fn(),
    title: "Propor horários",
    description: SCHEDULE_TEXT,
    children: <p>Conteúdo do modal.</p>,
  },
  argTypes: {
    children: { control: false },
    footer: { control: false },
    initialFocusRef: { control: false },
  },
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function getGrabber(dialog: HTMLElement): HTMLElement {
  const grabber = dialog.querySelector<HTMLElement>("[data-dialog-part='grabber']");
  if (!grabber) throw new Error("Alça do sheet não encontrada no painel");
  return grabber;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Arrasta a alça `deltaY` px para baixo, levando `durationMs` entre tocar e soltar. */
async function dragGrabber(grabber: HTMLElement, deltaY: number, durationMs: number) {
  const startY = grabber.getBoundingClientRect().top + 24;
  const pointer = { pointerId: 1, isPrimary: true };
  fireEvent.pointerDown(grabber, { ...pointer, clientY: startY });
  await wait(durationMs);
  fireEvent.pointerMove(grabber, { ...pointer, clientY: startY + deltaY });
  fireEvent.pointerUp(grabber, { ...pointer, clientY: startY + deltaY });
}

function dragOffsetOf(dialog: HTMLElement): string {
  return dialog.style.getPropertyValue("--dialog-drag-offset");
}

async function openDialog() {
  screen.getByRole("button", { name: "Abrir" }).click();
  return screen.findByRole("dialog");
}

export const Default: Story = {
  play: async () => {
    const dialog = await openDialog();
    await expect(getGrabber(dialog)).toBeVisible();
  },
};

const footerActions = (
  <>
    <Button variant="ghost">Cancelar</Button>
    <Button variant="primary">Enviar proposta</Button>
  </>
);

export const WithFooter: Story = {
  args: { footer: footerActions },
  play: async () => {
    await openDialog();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Ações no rodapé fixo. No celular empilham com a principal em cima; no desktop ficam à direita, em linha.",
      },
    },
  },
};

export const WithoutDescription: Story = {
  args: {
    title: "Contestar resultado",
    description: undefined,
    footer: footerActions,
  },
  play: async () => {
    const dialog = await openDialog();
    await expect(dialog).not.toHaveAttribute("aria-describedby");
  },
};

const longContent = (
  <div className="sb-stack">
    {Array.from({ length: 24 }, (_, index) => (
      <p key={index}>
        Opção {index + 1}: sábado, 10h, Arena Beach Club, quadra {index + 1}.
      </p>
    ))}
  </div>
);

export const LongContent: Story = {
  args: { children: longContent, footer: footerActions },
  play: async () => {
    await openDialog();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Conteúdo maior que a tela: o corpo rola, título e rodapé ficam fixos. O painel para 64px antes do topo.",
      },
    },
  },
};

export const Desktop: Story = {
  args: { footer: footerActions },
  globals: { viewport: { value: "desktop", isRotated: false } },
  play: async () => {
    const dialog = await openDialog();
    await expect(getGrabber(dialog)).not.toBeVisible();
  },
  parameters: {
    docs: {
      description: {
        story: "A partir de 800px o mesmo componente vira Dialog centralizado.",
      },
    },
  },
};

export const EscapeReturnsFocus: Story = {
  name: "Teclado · Esc devolve o foco",
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Abrir" });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog");
    await expect(dialog).toHaveFocus();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAccessibleName("Propor horários");

    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const FocusTrap: Story = {
  name: "Teclado · Tab preso no modal",
  args: { footer: footerActions },
  play: async ({ userEvent }) => {
    const dialog = await openDialog();
    const close = screen.getByRole("button", { name: "Fechar" });
    const submit = screen.getByRole("button", { name: "Enviar proposta" });

    await userEvent.tab();
    await expect(close).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(submit).toHaveFocus();
    await userEvent.tab();
    await expect(close).toHaveFocus();
    await expect(dialog).toContainElement(document.activeElement as HTMLElement);

    // Regra do DS: botão só de ícone tem área tocável de 48×48
    const { width, height } = close.getBoundingClientRect();
    await expect(width).toBeGreaterThanOrEqual(48);
    await expect(height).toBeGreaterThanOrEqual(48);
  },
};

export const InitialFocus: Story = {
  name: "Teclado · Foco inicial em Cancelar",
  args: {
    title: "Contestar resultado?",
    description:
      "O placar volta para análise do admin do ranking e sai da sua posição até ser resolvido.",
    children: undefined,
  },
  render: (args) => <DialogDemo {...args} focusCancel />,
  play: async () => {
    await openDialog();
    await expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Com `initialFocusRef`, o foco abre num elemento escolhido. Em ação destrutiva, o APG recomenda a opção menos destrutiva.",
      },
    },
  },
};

export const ScrimCloses: Story = {
  name: "Ponteiro · Toque no scrim fecha",
  play: async ({ args, userEvent }) => {
    await openDialog();
    // O scrim cobre a tela inteira; um toque no canto superior esquerdo cai nele
    await userEvent.pointer({
      keys: "[MouseLeft]",
      coords: { clientX: 4, clientY: 4 },
      target: document.elementFromPoint(4, 4) as Element,
    });
    await expect(args.onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

export const DragFlickCloses: Story = {
  name: "Arrasto · Rápido fecha",
  play: async ({ args }) => {
    const dialog = await openDialog();
    await dragGrabber(getGrabber(dialog), 40, 0);
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce());
  },
  parameters: {
    docs: {
      description: {
        story: "Arrasto curto e rápido pela alça (acima de 0,4 px/ms) fecha o sheet.",
      },
    },
  },
};

export const DragDistanceCloses: Story = {
  name: "Arrasto · Longo fecha",
  args: { footer: footerActions },
  play: async ({ args }) => {
    const dialog = await openDialog();
    const distance = dialog.offsetHeight * 0.3;
    await dragGrabber(getGrabber(dialog), distance, 1500);
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce());
  },
  parameters: {
    docs: {
      description: {
        story: "Arrasto lento que passa de 25% da altura do painel também fecha.",
      },
    },
  },
};

export const DragShortReturns: Story = {
  name: "Arrasto · Curto volta",
  play: async ({ args }) => {
    const dialog = await openDialog();
    const grabber = getGrabber(dialog);
    await dragGrabber(grabber, 40, 600);
    await expect(dragOffsetOf(dialog)).toBe("0px");

    // Para cima o sheet não sobe
    fireEvent.pointerDown(grabber, { pointerId: 1, isPrimary: true, clientY: 300 });
    fireEvent.pointerMove(grabber, { pointerId: 1, isPrimary: true, clientY: 200 });
    await expect(dragOffsetOf(dialog)).toBe("0px");
    fireEvent.pointerUp(grabber, { pointerId: 1, isPrimary: true, clientY: 200 });

    await expect(args.onClose).not.toHaveBeenCalled();
    await expect(screen.getByRole("dialog")).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Arrasto curto e lento volta o sheet à posição. Arrastar para cima não move o painel.",
      },
    },
  },
};
