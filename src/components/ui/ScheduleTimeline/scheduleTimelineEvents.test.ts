import { describe, expect, it } from "vitest";
import type { ScheduleHistory, WithdrawnScheduleProposal } from "@/src/types/domain";
import { formatOptions, scheduleTimelineEventsOf } from "./scheduleTimelineEvents";
import {
  BOTH_SIDES_HISTORY,
  EMPTY_HISTORY,
  ONE_SIDE_HISTORY,
  REPORTED_DATE_HISTORY,
  STORY_PLAYER_NAMES,
} from "./storyFixtures";

const summaryOf = (history: ScheduleHistory) =>
  scheduleTimelineEventsOf(history, STORY_PLAYER_NAMES).map(({ actor, action, at }) => ({ actor, action, at }));

describe("histórico da marcação em eventos da linha do tempo", () => {
  it("histórico vazio não gera evento", () => {
    expect(scheduleTimelineEventsOf(EMPTY_HISTORY, STORY_PLAYER_NAMES)).toEqual([]);
  });

  it("proposta expirada: a criação com o autor e a expiração sem autor, no horário da última opção", () => {
    expect(summaryOf(ONE_SIDE_HISTORY)).toEqual([
      { actor: "Thiago", action: "propôs 3 horários", at: "2026-09-07T13:10:00Z" },
      { actor: undefined, action: "A proposta de Thiago expirou sem aceite.", at: "2026-09-13T12:00:00Z" },
      { actor: "Pedro", action: "propôs 2 horários", at: "2026-09-14T11:30:00Z" },
      { actor: undefined, action: "A proposta de Pedro expirou sem aceite.", at: "2026-09-18T22:00:00Z" },
    ]);
  });

  it("substituída não ganha linha; retirada e aceite ficam com quem agiu, em ordem cronológica", () => {
    expect(summaryOf(BOTH_SIDES_HISTORY)).toEqual([
      { actor: "Pedro", action: "propôs 2 horários", at: "2026-09-07T13:10:00Z" },
      { actor: "Caio", action: "propôs 3 horários", at: "2026-09-08T00:20:00Z" },
      { actor: "Diego", action: "retirou a proposta", at: "2026-09-09T15:00:00Z" },
      { actor: "Diego", action: "propôs 2 horários", at: "2026-09-09T15:05:00Z" },
      { actor: "Thiago", action: "aceitou ter, 15/09, 19h", at: "2026-09-10T01:40:00Z" },
    ]);
  });

  it("data informada fica com quem informou (M14)", () => {
    const events = scheduleTimelineEventsOf(REPORTED_DATE_HISTORY, STORY_PLAYER_NAMES);
    expect(events[1]).toMatchObject({
      actor: "Diego",
      action: "informou a data combinada fora do app",
      detail: "seg, 14/09, 19h · Arena Mangaba – Beach · Nova Lima/MG",
    });
  });

  it("encerrada pelo sistema: frase sem autor com o motivo", () => {
    const { id, match_id, side, proposed_by, created_at, options } = ONE_SIDE_HISTORY.proposals[0];
    const withdrawn: WithdrawnScheduleProposal = {
      id,
      match_id,
      side,
      proposed_by,
      created_at,
      options,
      status: "withdrawn",
      withdrawal: { by: "system", reason: "result_reported" },
      closed_at: "2026-09-13T12:00:00Z",
    };
    const history: ScheduleHistory = { ...ONE_SIDE_HISTORY, proposals: [withdrawn] };
    expect(summaryOf(history)[1]).toEqual({
      actor: undefined,
      action: "A proposta de Thiago foi encerrada com o lançamento do resultado.",
      at: "2026-09-13T12:00:00Z",
    });
  });

  it("jogador sem nome no mapa aparece como 'Jogador'", () => {
    expect(scheduleTimelineEventsOf(ONE_SIDE_HISTORY, {})[0].actor).toBe("Jogador");
  });
});

describe("formatOptions", () => {
  it("arena comum a todas as opções vai uma vez no fim", () => {
    const options = [
      { starts_at: "2026-09-09T22:00:00Z", venue: "Arena Tucum" },
      { starts_at: "2026-09-10T22:00:00Z", venue: "Arena Tucum" },
    ];
    expect(formatOptions(options)).toBe("qua, 09/09, 19h ou qui, 10/09, 19h · Arena Tucum");
  });

  it("arenas diferentes ficam em cada opção; opção sem arena fica sem parênteses", () => {
    const options = [
      { starts_at: "2026-09-09T22:00:00Z", venue: "Arena Tucum" },
      { starts_at: "2026-09-10T22:00:00Z", venue: null },
    ];
    expect(formatOptions(options)).toBe("qua, 09/09, 19h (Arena Tucum) ou qui, 10/09, 19h");
  });

  it("sem arena em nenhuma opção, só os horários", () => {
    expect(formatOptions([{ starts_at: "2026-09-09T22:00:00Z", venue: null }])).toBe("qua, 09/09, 19h");
  });
});
