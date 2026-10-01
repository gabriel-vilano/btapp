/**
 * Página da organização (docs/EXPLORE.md, EX22 e EX23): o @username é o slug.
 * @example organizationHref('arenamangaba') // '/organizacoes/arenamangaba'
 */
export function organizationHref(username: string): string {
  return `/organizacoes/${username}`;
}
