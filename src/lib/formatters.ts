import type { Category } from '@/src/types/feed';

// Como as arenas escrevem nas inscrições: "Masculino B", "Mista C" (FEED_CARDS.md §11.5)
const genderLabel: Record<Category['gender'], string> = {
  M: 'Masculino',
  F: 'Feminino',
  mixed: 'Mista',
};

const TIMEZONE = "America/Sao_Paulo";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TIMEZONE,
});

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  timeZone: TIMEZONE,
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIMEZONE,
});

export function formatMatchDateTime(iso: string): string {
  const d = new Date(iso);
  const date = dateFormatter.format(d);
  const weekdayRaw = weekdayFormatter.format(d).split("-")[0];
  const weekday = weekdayRaw.charAt(0).toUpperCase() + weekdayRaw.slice(1);
  const time = timeFormatter.format(d);
  return `${date}, ${weekday} às ${time}`;
}

/**
 * Nome da categoria: gênero + nível + idade. A modalidade só aparece em simples,
 * porque duplas é o padrão do Beach Tennis.
 * Ex.: "Masculino B", "Mista C 40+", "Feminino A · Simples".
 */
export function formatCategoryLabel(category: Category): string {
  const name = [genderLabel[category.gender], formatLevel(category), category.age_group]
    .filter(Boolean)
    .join(' ');
  return category.modality === 'singles' ? `${name} · Simples` : name;
}

function formatLevel({ level_min, level_max }: Category): string | null {
  if (level_min && level_max && level_min !== level_max) return `${level_min}/${level_max}`;
  return level_min ?? level_max;
}

/**
 * Inscritos contados pela unidade competidora (FEED_CARDS.md §11.4).
 * Em simples, o rótulo concorda com o gênero da categoria.
 * Ex.: "16 duplas inscritas", "24 jogadores inscritos", "12 jogadoras inscritas".
 */
export function formatEnrollmentCount(count: number, category: Category): string {
  if (category.modality === 'doubles') return count === 1 ? '1 dupla inscrita' : `${count} duplas inscritas`;
  if (category.gender === 'F') return count === 1 ? '1 jogadora inscrita' : `${count} jogadoras inscritas`;
  return count === 1 ? '1 jogador inscrito' : `${count} jogadores inscritos`;
}

/**
 * Iniciais para o avatar sem foto: primeira letra do primeiro e do último nome.
 * Ex.: "Maria Eduarda de Vasconcelos" → "MV", "Lucas" → "L", "" → "".
 */
export function formatInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .map((word) => word.match(/[\p{L}\p{N}]/u)?.[0])
    .filter((initial): initial is string => initial !== undefined);
  if (initials.length === 0) return '';
  const firstAndLast = initials.length === 1 ? initials : [initials[0], initials[initials.length - 1]];
  return firstAndLast.join('').toLocaleUpperCase('pt-BR');
}

const eventMomentFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: TIMEZONE,
});

/**
 * Momento de um evento de histórico, no jeito falado do app: dia da semana, data e hora.
 * A data entra porque um histórico atravessa semanas, e "seg" sozinho seria ambíguo.
 * Ex.: "2026-09-22T23:00:00Z" → "ter, 22/09, 20h"; "2026-09-25T12:05:00Z" → "sex, 25/09, 9h05".
 */
export function formatEventMoment(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Momento inválido: recebi '${iso}', esperado data ISO 8601`);
  }
  const parts = eventMomentFormatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = part("weekday").replace(".", "");
  const hour = Number(part("hour"));
  const minute = part("minute");
  const time = minute === "00" ? `${hour}h` : `${hour}h${minute}`;
  return `${weekday}, ${part("day")}/${part("month")}, ${time}`;
}
