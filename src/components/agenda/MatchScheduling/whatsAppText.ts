import { brand } from "@/src/lib/brand";
import { formatScheduleShort } from "@/src/lib/scheduleOptionFormat";
import type { ScheduleOption } from "@/src/types/domain";

// Texto pronto do "Abrir no WhatsApp" (docs/SCHEDULING.md §6, "Quando o outro
// lado não usa o app"). O link abre o WhatsApp para o jogador escolher a
// conversa ou o grupo (M24). O atalho direto para a conversa de quem informou o
// telefone espera as partidas no banco: só com elas a regra de quem pode ler o
// número do outro (M23) vale numa política de acesso.

const WHATSAPP_SHARE_URL = "https://wa.me/";

/** O que a mensagem conta: a proposta pendente, a data acordada ou o convite para marcar. */
export type WhatsAppSubject =
  | { kind: "proposal"; options: readonly ScheduleOption[] }
  | { kind: "agreed"; option: ScheduleOption }
  | { kind: "invite"; roundNumber: number; deadlineLeft: string };

/**
 * Mensagem para colar na conversa.
 * @example scheduleWhatsAppText({ kind: "agreed", option }) // "Jogo marcado: sáb, 3 out, 14h, na Arena Tucum."
 */
export function scheduleWhatsAppText(subject: WhatsAppSubject): string {
  switch (subject.kind) {
    case "proposal":
      return `Proponho ${formatOptionList(subject.options)}. Responde no ${brand.name} ou aqui.`;
    case "agreed":
      return `Jogo marcado: ${formatOptionList([subject.option])}.`;
    case "invite":
      return `Vamos marcar nosso jogo da rodada ${subject.roundNumber}? A rodada fecha ${subject.deadlineLeft}. Quais horários servem para vocês?`;
  }
}

/**
 * Link que abre o WhatsApp com a mensagem pronta e sem destinatário (M24).
 * @example scheduleWhatsAppHref({ kind: "proposal", options }) // "https://wa.me/?text=Proponho%20..."
 */
export function scheduleWhatsAppHref(subject: WhatsAppSubject): string {
  return `${WHATSAPP_SHARE_URL}?text=${encodeURIComponent(scheduleWhatsAppText(subject))}`;
}

// Os horários levam vírgula por dentro ("sáb, 3 out, 14h"), então a lista usa
// ponto e vírgula entre eles. A arena comum vai uma vez no fim; se variar,
// cada horário leva a sua entre parênteses.
function formatOptionList(options: readonly ScheduleOption[]): string {
  const venues = new Set(options.map((option) => option.venue));
  const [sharedVenue] = venues;
  if (venues.size === 1) {
    const times = joinWithOr(options.map((option) => formatScheduleShort(option.starts_at)));
    return sharedVenue ? `${times}, na ${sharedVenue}` : times;
  }
  return joinWithOr(
    options.map((option) => formatScheduleShort(option.starts_at) + (option.venue ? ` (${option.venue})` : "")),
  );
}

function joinWithOr(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join("; ")} ou ${items[items.length - 1]}`;
}
