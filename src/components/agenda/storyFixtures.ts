import type { AgendaItemModel } from "@/src/lib/agenda/agendaItemModel";

// Itens prontos para as stories da agenda, com os textos que a agenda monta
// (src/lib/agenda/). Um de cada seção e o histórico de dois meses.

const lucas = { id: "p-lucas", name: "Lucas Silva", avatarUrl: null };
const rafael = { id: "p-rafael", name: "Rafael Costa", avatarUrl: null };
const pedro = { id: "p-pedro", name: "Pedro Henrique", avatarUrl: null };
const thiago = { id: "p-thiago", name: "Thiago Mendes", avatarUrl: null };
const caio = { id: "p-caio", name: "Caio Ferreira", avatarUrl: null };
const diego = { id: "p-diego", name: "Diego Martins", avatarUrl: null };
const andre = { id: "p-andre", name: "André Lima", avatarUrl: null };
const bruno = { id: "p-bruno", name: "Bruno Araújo", avatarUrl: null };

const RANKING = "Ranking Arena RM 2026 · Masculino B";

function item(slug: string, overrides: Partial<AgendaItemModel>): AgendaItemModel {
  return {
    matchId: `match-${slug}`,
    ownSide: [lucas, rafael],
    opponentSide: [pedro, thiago],
    context: `${RANKING} · Rodada 3`,
    situation: "",
    badge: null,
    href: `/jogos/match-${slug}`,
    action: null,
    ...overrides,
  };
}

export const yourTurnItems: AgendaItemModel[] = [
  item("r3-4", {
    situation: "Confirmar resultado · confirma sozinho em 31h",
    action: { label: "Confirmar", href: "/jogos/match-r3-4" },
  }),
  item("r3-1", {
    opponentSide: [caio, diego],
    situation: "Marcar jogo · rodada fecha em 3 dias",
    action: { label: "Propor horários", href: "/jogos/match-r3-1" },
  }),
];

export const upcomingItems: AgendaItemModel[] = [
  item("final", {
    opponentSide: [andre, bruno],
    context: "Copa Sunset de Beach Tennis · Masculino B · Final",
    situation: "Sáb, 9h · Quadra 3",
    badge: "Hoje",
  }),
];

export const waitingItems: AgendaItemModel[] = [
  item("r3-2", { opponentSide: [caio, diego], situation: "Proposta enviada · aguardando Caio e Diego" }),
];

export const historyGroups = [
  {
    label: "Setembro de 2026",
    items: [
      item("friendly-1", { ownSide: [lucas], opponentSide: [thiago], context: "Amistoso", situation: "Vitória 6/3" }),
      item("r2-1", { opponentSide: [andre, bruno], context: `${RANKING} · Rodada 2`, situation: "Derrota 6/7 · 48 pts" }),
    ],
  },
  {
    label: "Agosto de 2026",
    items: [
      item("r1-1", { context: `${RANKING} · Rodada 1`, situation: "Vitória 6/4 · 104 pts" }),
    ],
  },
];
