// Correspondência da busca (docs/EXPLORE.md, EX15): sem diferença de
// maiúscula nem de acento, pelo início de qualquer palavra, com ou sem @.
// O jogador digita no celular, na quadra, e nomes brasileiros têm acento.

/**
 * Forma comparável de um texto: minúsculo, sem acento e sem espaço sobrando.
 * @example normalizeSearchText('  João ') // "joao"
 */
export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// O @ é opcional no termo: "@lu" e "lu" buscam a mesma coisa
function normalizeTerm(term: string): string {
  return normalizeSearchText(term).replace(/^@/, '');
}

/**
 * O texto tem uma palavra que começa pelo termo. Termo vazio não acha nada.
 * @example matchesSearchTerm('Ana Silva', 'sil') // true
 */
export function matchesSearchTerm(text: string, term: string): boolean {
  const needle = normalizeTerm(term);
  if (needle === '') return false;
  const haystack = normalizeSearchText(text);
  return haystack.startsWith(needle) || haystack.includes(` ${needle}`);
}

/** O termo é exatamente o @username (EX16): "@lucas.m" e "Lucas.M" valem para "lucas.m". */
export function isExactUsername(username: string, term: string): boolean {
  const needle = normalizeTerm(term);
  return needle !== '' && normalizeSearchText(username) === needle;
}
