export type PersonName = {
  firstName: string;
  lastName: string;
};

// Partículas não carregam o sobrenome: "de Vasconcelos Albuquerque" abrevia pelo "A."
export const SURNAME_PARTICLES: ReadonlySet<string> = new Set(["de", "da", "do", "dos", "das", "e"]);

function words(value: string): string[] {
  return value.trim().split(/\s+/).filter(Boolean);
}

/**
 * Nome completo como um texto só, na forma gravada em `profiles.full_name`.
 * Ex: `joinFullName({ firstName: " João Pedro", lastName: "Silva " })` → `"João Pedro Silva"`
 */
export function joinFullName({ firstName, lastName }: PersonName): string {
  return [...words(firstName), ...words(lastName)].join(" ");
}

/**
 * Separa um nome completo antigo: a primeira palavra vira o nome e o resto, o sobrenome.
 * Só para dados de antes do cadastro com dois campos. Mesma regra da migration
 * `profiles_first_and_last_name`.
 * Ex: `splitFullName("João Pedro Silva")` → `{ firstName: "João", lastName: "Pedro Silva" }`
 */
export function splitFullName(fullName: string): PersonName {
  const [firstName = "", ...rest] = words(fullName);
  return { firstName, lastName: rest.join(" ") };
}

function surnameInitial(lastName: string): string {
  const surnameWords = words(lastName);
  const meaningful = surnameWords.filter((word) => !SURNAME_PARTICLES.has(word.toLowerCase()));
  const lastWord = (meaningful.length > 0 ? meaningful : surnameWords).at(-1);
  return lastWord ? `${lastWord.charAt(0).toLocaleUpperCase("pt-BR")}.` : "";
}

/**
 * Nome inteiro mais a inicial da última palavra do sobrenome, ignorando partículas.
 * Sem sobrenome, devolve só o nome.
 * Ex: `abbreviateName({ firstName: "João Pedro", lastName: "da Silva" })` → `"João Pedro S."`
 */
export function abbreviateName(name: PersonName): string {
  return [words(name.firstName).join(" "), surnameInitial(name.lastName)]
    .filter(Boolean)
    .join(" ");
}
