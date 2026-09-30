import { SURNAME_PARTICLES, type PersonName } from "@/src/lib/names";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from "@/src/lib/validations";

// Nome que não rende 3 letras latinas (ex.: escrito só em outro alfabeto) ainda
// precisa de um @username válido: a sugestão cai neste prefixo, com número
export const USERNAME_FALLBACK_BASE = "jogador";

// Sugestão vai só até 9999 variações do mesmo nome; acima disso, a unicidade é
// garantida pela constraint do banco e o jogador escolhe outro
const MAX_SUFFIX = 9999;

function toAsciiLowercase(word: string): string {
  return word
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// A partícula sai de todo lugar menos da primeira palavra: "Da" pode ser o nome
function withoutParticles(words: string[]): string[] {
  return words.filter((word, index) => index === 0 || !SURNAME_PARTICLES.has(word.toLowerCase()));
}

/**
 * Base da sugestão de @username: nome e sobrenome juntos, sem acento, sem espaço e
 * sem partículas, cortado no limite da `validateUsername`.
 * Ex: `usernameBaseFromName({ firstName: "João", lastName: "da Silva" })` → `"joaosilva"`
 */
export function usernameBaseFromName({ firstName, lastName }: PersonName): string {
  const words = `${firstName} ${lastName}`.trim().split(/\s+/);
  const base = withoutParticles(words).map(toAsciiLowercase).join("").slice(0, USERNAME_MAX_LENGTH);
  return base.length >= USERNAME_MIN_LENGTH ? base : USERNAME_FALLBACK_BASE;
}

/**
 * Variação `n` da base: a 1 é a própria base, as seguintes ganham o número no fim,
 * cortando a base para caber no limite.
 * Ex: `usernameCandidate("gabrielvilano", 2)` → `"gabrielvilano2"`
 */
export function usernameCandidate(base: string, n: number): string {
  if (n <= 1) return base;
  const suffix = String(n);
  return `${base.slice(0, USERNAME_MAX_LENGTH - suffix.length)}${suffix}`;
}

/** Menor prefixo comum a todas as variações da base, para buscar as já usadas numa consulta só. */
export function usernameSearchPrefix(base: string): string {
  return base.slice(0, USERNAME_MAX_LENGTH - String(MAX_SUFFIX).length);
}

/**
 * Primeira variação livre da base, ou `null` se todas estiverem em uso.
 * Ex: `pickFreeUsername("ana", new Set(["ana", "ana2"]))` → `"ana3"`
 */
export function pickFreeUsername(base: string, taken: ReadonlySet<string>): string | null {
  for (let n = 1; n <= MAX_SUFFIX; n++) {
    const candidate = usernameCandidate(base, n);
    if (!taken.has(candidate)) return candidate;
  }
  return null;
}
