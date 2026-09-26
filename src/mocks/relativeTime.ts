// Datas dos mocks relativas ao momento em que o módulo carrega. Com datas
// fixas, o card envelhece com o calendário e passa a mostrar "há 149 dias".

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function shiftFromNow(ms: number): string {
  return new Date(Date.now() + ms).toISOString();
}

/** ISO de `n` minutos atrás. Ex.: `minutesAgo(15)` → "há 15min" no card. */
export function minutesAgo(n: number): string {
  return shiftFromNow(-n * MINUTE_MS);
}

export function hoursAgo(n: number): string {
  return shiftFromNow(-n * HOUR_MS);
}

export function daysAgo(n: number): string {
  return shiftFromNow(-n * DAY_MS);
}

export function weeksAgo(n: number): string {
  return daysAgo(7 * n);
}

/** ISO de `n` dias à frente, para jogos agendados. Aceita fração (0.5 = 12h). */
export function daysFromNow(n: number): string {
  return shiftFromNow(n * DAY_MS);
}

/** Zera minutos e segundos. Jogo marcado não começa às 14:37. */
export function onTheHour(iso: string): string {
  const date = new Date(iso);
  date.setUTCMinutes(0, 0, 0);
  return date.toISOString();
}
