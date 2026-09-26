import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  daysAgo,
  daysFromNow,
  hoursAgo,
  minutesAgo,
  onTheHour,
  weeksAgo,
} from "./relativeTime";

describe("relativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-25T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Funções, não valores: o relógio só é congelado no beforeEach.
  it.each([
    ["minutesAgo(15)", () => minutesAgo(15), "2026-09-25T11:45:00.000Z"],
    ["hoursAgo(3)", () => hoursAgo(3), "2026-09-25T09:00:00.000Z"],
    ["daysAgo(2)", () => daysAgo(2), "2026-09-23T12:00:00.000Z"],
    ["weeksAgo(2)", () => weeksAgo(2), "2026-09-11T12:00:00.000Z"],
    ["daysFromNow(0.5)", () => daysFromNow(0.5), "2026-09-26T00:00:00.000Z"],
    ["onTheHour(minutesAgo(15))", () => onTheHour(minutesAgo(15)), "2026-09-25T11:00:00.000Z"],
  ])("%s", (_label, compute, expected) => {
    expect(compute()).toBe(expected);
  });
});
