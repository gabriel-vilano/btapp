// Contato da organização (docs/EXPLORE.md, EX22 e EX28). O campo é um só,
// texto ou link, como a organização informou (docs/DOMAIN.md). A decisão de
// virar botão fica aqui, fora do React: o `href` que sai daqui é sempre
// `https:`, então `javascript:` e `data:` nunca chegam a um link, mesmo que a
// versão do React em uso não os bloqueie.

/** O contato já lido: link vira botão; texto aparece como foi escrito. */
export type OrganizationContactView = { kind: 'link'; href: string } | { kind: 'text'; text: string };

// Só uma URL inteira, sem espaço, conta como link: 'Instagram https://…' é texto
// (try/catch em vez de `URL.canParse`, que só chegou no Safari 17)
function httpsUrl(value: string): URL | null {
  if (/\s/.test(value)) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

/**
 * Lê o contato da organização. Vazio ou só espaços conta como sem contato.
 * @example readOrganizationContact('https://wa.me/5531900000001') // { kind: 'link', href: 'https://wa.me/5531900000001' }
 * @example readOrganizationContact('javascript:alert(1)') // { kind: 'text', text: 'javascript:alert(1)' }
 */
export function readOrganizationContact(contact: string | null): OrganizationContactView | null {
  const value = contact?.trim() ?? '';
  if (value === '') return null;
  const url = httpsUrl(value);
  return url ? { kind: 'link', href: url.href } : { kind: 'text', text: value };
}
