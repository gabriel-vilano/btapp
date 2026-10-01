import { parseSideSegment } from '../h2h';

// Uma URL só por dupla (HH5, N10): a dupla fora da ordem alfabética é
// encontrada, e a tela redireciona para a URL única. A ordem dos lados não
// muda: ela é a perspectiva (HH6).

function isSorted(raw: string): boolean {
  const usernames = parseSideSegment(raw);
  if (usernames === null) return true; // segmento inválido: o "não encontrado" é de quem monta a página
  return usernames.every((username, i) => i === 0 || usernames[i - 1] <= username);
}

/**
 * A URL pedida já é a única do par? Compara os @usernames lidos, não o texto
 * da URL, que pode chegar codificado ou não.
 * Ex.: `isCanonicalH2HRequest('rafaelcosta+lucassilva', 'pedrohenrique')` → false.
 */
export function isCanonicalH2HRequest(sideA: string, sideB: string): boolean {
  return isSorted(sideA) && isSorted(sideB);
}
