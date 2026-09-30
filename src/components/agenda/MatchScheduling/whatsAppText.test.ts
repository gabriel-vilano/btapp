import { describe, expect, it } from "vitest";
import { scheduleWhatsAppHref, scheduleWhatsAppText } from "./whatsAppText";

const SAT_14H = { starts_at: "2026-10-03T17:00:00.000Z", venue: "Arena Sunset" };
const SUN_10H = { starts_at: "2026-10-04T13:00:00.000Z", venue: "Arena Sunset" };
const WED_19H30 = { starts_at: "2026-10-07T22:30:00.000Z", venue: "Arena Sunset" };

describe("texto do Abrir no WhatsApp", () => {
  it("proposta com a mesma arena: horários separados e a arena uma vez no fim", () => {
    expect(scheduleWhatsAppText({ kind: "proposal", options: [SAT_14H, SUN_10H, WED_19H30] })).toBe(
      "Proponho sáb, 3 out, 14h; dom, 4 out, 10h ou qua, 7 out, 19h30, na Arena Sunset. Responde no LetzPlay ou aqui.",
    );
  });

  it("proposta com arenas diferentes ou sem arena: cada horário com a sua", () => {
    const text = scheduleWhatsAppText({ kind: "proposal", options: [SAT_14H, { ...SUN_10H, venue: null }] });
    expect(text).toBe("Proponho sáb, 3 out, 14h (Arena Sunset) ou dom, 4 out, 10h. Responde no LetzPlay ou aqui.");
  });

  it("data acordada sem arena não menciona arena", () => {
    expect(scheduleWhatsAppText({ kind: "agreed", option: { ...SAT_14H, venue: null } })).toBe(
      "Jogo marcado: sáb, 3 out, 14h.",
    );
  });

  it("convite para marcar cita a rodada e o prazo", () => {
    expect(scheduleWhatsAppText({ kind: "invite", roundNumber: 3, deadlineLeft: "em 5 dias" })).toBe(
      "Vamos marcar nosso jogo da rodada 3? A rodada fecha em 5 dias. Quais horários servem para vocês?",
    );
  });

  it("o link não leva telefone: o jogador escolhe a conversa (M24)", () => {
    const href = scheduleWhatsAppHref({ kind: "agreed", option: SAT_14H });
    expect(href).toBe(`https://wa.me/?text=${encodeURIComponent("Jogo marcado: sáb, 3 out, 14h, na Arena Sunset.")}`);
  });
});
