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
 * Ex.: "16 duplas inscritas", "24 jogadores inscritos".
 */
export function formatEnrollmentCount(count: number, modality: Category['modality']): string {
  if (modality === 'doubles') return count === 1 ? '1 dupla inscrita' : `${count} duplas inscritas`;
  return count === 1 ? '1 jogador inscrito' : `${count} jogadores inscritos`;
}
