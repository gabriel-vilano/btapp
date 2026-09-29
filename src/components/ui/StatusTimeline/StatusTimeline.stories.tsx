import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CalendarCheckIcon,
  CalendarPlusIcon,
  ArrowsClockwiseIcon,
  ClockCountdownIcon,
  GavelIcon,
  PencilSimpleIcon,
  PaperPlaneTiltIcon,
  WarningCircleIcon,
  LockSimpleIcon,
  ArrowUUpLeftIcon,
} from "@phosphor-icons/react";
import { expect, within } from "storybook/test";
import { StatusTimeline, type StatusTimelineEvent } from "./StatusTimeline";

// Dados de exemplo: rodada do Ranking Praia Norte, Pedro e Maria contra Lucas e Rafael, admin Ana.
// Os horários são UTC; a tela mostra no fuso de São Paulo (UTC-3).
const schedulingHistory: StatusTimelineEvent[] = [
  {
    id: "s1",
    actor: "Pedro",
    action: "propôs 3 horários",
    detail: "sáb 14h, dom 10h ou qua 19h · Arena Sunset",
    at: "2026-09-21T23:00:00Z",
    icon: CalendarPlusIcon,
  },
  {
    id: "s2",
    actor: "Lucas",
    action: "propôs outros 2 horários",
    detail: "dom 16h ou ter 19h · Arena Sunset",
    at: "2026-09-22T12:15:00Z",
    icon: ArrowsClockwiseIcon,
  },
  {
    id: "s3",
    actor: "Maria",
    action: "aceitou dom, 27/09, 16h",
    detail: "Arena Sunset",
    at: "2026-09-22T22:40:00Z",
    icon: CalendarCheckIcon,
  },
];

const resultHistory: StatusTimelineEvent[] = [
  {
    id: "r1",
    actor: "Pedro",
    action: "lançou o resultado",
    detail: "6/4 · 7/5 para Pedro e Maria",
    at: "2026-09-28T21:30:00Z",
    icon: PaperPlaneTiltIcon,
  },
  {
    id: "r2",
    actor: "Lucas",
    action: "contestou o resultado",
    detail: "Motivo: placar diferente. Placar que Lucas lembra: 6/4 · 6/7 · 10/8",
    at: "2026-09-29T12:05:00Z",
    icon: WarningCircleIcon,
  },
  {
    id: "r3",
    actor: "Ana",
    actorRole: "admin",
    action: "arbitrou e manteve o resultado lançado",
    at: "2026-09-30T13:00:00Z",
    icon: GavelIcon,
  },
  {
    id: "r4",
    actor: "Ana",
    actorRole: "admin",
    action: "corrigiu o placar",
    detail: "6/4 · 7/6",
    at: "2026-10-02T13:20:00Z",
    icon: PencilSimpleIcon,
  },
];

const longHistory: StatusTimelineEvent[] = [
  schedulingHistory[0],
  {
    id: "l2",
    actor: "Pedro",
    action: "retirou a proposta",
    at: "2026-09-22T11:00:00Z",
    icon: ArrowUUpLeftIcon,
  },
  {
    id: "l3",
    actor: "Maria",
    action: "propôs 2 horários",
    detail: "qui 19h ou sex 20h · Arena Sunset",
    at: "2026-09-22T15:30:00Z",
    icon: CalendarPlusIcon,
  },
  {
    id: "l4",
    action: "A proposta expirou: todos os horários passaram sem aceite.",
    at: "2026-09-25T23:00:00Z",
    icon: ClockCountdownIcon,
  },
  {
    id: "l5",
    actor: "Rafael",
    action: "propôs 3 horários",
    detail: "sáb 9h, sáb 17h ou dom 8h · Clube Orla, quadra 3",
    at: "2026-09-27T12:10:00Z",
    icon: CalendarPlusIcon,
  },
  {
    id: "l6",
    actor: "Pedro",
    action: "propôs outros 2 horários",
    detail: "ter 20h ou qua 20h · Arena Sunset",
    at: "2026-09-27T20:45:00Z",
    icon: ArrowsClockwiseIcon,
  },
  {
    id: "l7",
    actor: "Rafael",
    action: "aceitou qua, 30/09, 20h",
    detail: "Arena Sunset",
    at: "2026-09-28T00:05:00Z",
    icon: CalendarCheckIcon,
  },
  {
    id: "l8",
    actor: "Lucas",
    action: "propôs remarcar para 2 horários",
    detail: "qui 20h ou sex 20h · Arena Sunset. A data acordada continua valendo até o aceite",
    at: "2026-09-30T18:00:00Z",
    icon: ArrowsClockwiseIcon,
  },
  {
    id: "l9",
    actor: "Maria",
    action: "informou a data combinada fora do app",
    detail: "sex, 02/10, 20h · Arena Sunset. A proposta pendente foi substituída",
    at: "2026-10-01T11:30:00Z",
    icon: CalendarCheckIcon,
  },
  {
    id: "l10",
    action: "A rodada fechou sem resultado. A partida foi para o admin como não realizada.",
    at: "2026-10-06T03:00:00Z",
    icon: LockSimpleIcon,
  },
];

const meta = {
  title: "UI/StatusTimeline",
  component: StatusTimeline,
  parameters: {
    docs: {
      description: {
        component: "Linha do tempo de fatos: quem fez o quê e quando, do mais antigo para o mais recente.",
      },
    },
  },
  args: {
    label: "Histórico da marcação",
    events: schedulingHistory,
  },
  argTypes: {
    events: { control: false },
  },
} satisfies Meta<typeof StatusTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SchedulingHistory: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list", { name: "Histórico da marcação" });
    await expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    await expect(canvas.getByText("ter, 22/09, 19h40")).toHaveAttribute("datetime", "2026-09-22T22:40:00Z");
    for (const icon of canvasElement.querySelectorAll("svg")) {
      await expect(icon).toHaveAttribute("aria-hidden", "true");
    }
  },
};

export const ResultHistory: Story = {
  args: {
    label: "Histórico do resultado",
    events: resultHistory,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("(admin)")).toHaveLength(2);
    await expect(canvas.getByText(/Motivo: placar diferente/)).toBeVisible();
  },
};

export const SingleEvent: Story = {
  args: {
    label: "Histórico do resultado",
    events: [resultHistory[0]],
  },
};

export const LongHistory: Story = {
  args: {
    events: longHistory,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("listitem")).toHaveLength(10);
    await expect(canvas.getByText("A proposta expirou: todos os horários passaram sem aceite.")).toBeVisible();
  },
};

export const WithoutIcons: Story = {
  args: {
    events: schedulingHistory.map((event) => ({ ...event, icon: undefined })),
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("svg")).toBeNull();
  },
};

export const Empty: Story = {
  args: {
    events: [],
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("list")).toBeNull();
  },
};
