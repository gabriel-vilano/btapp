import type { Page, TestInfo } from "@playwright/test";

// O screenshot e o trace de uma falha ficam no artefato da CI, que os agentes
// não conseguem baixar (o host do blob fica fora da rede deles). Por isso a
// falha também se descreve no log do job: URL, erros do navegador e a árvore
// de acessibilidade da página no momento da falha.

/** Guarda os erros do navegador da página, para o relatório de falha. */
export function collectBrowserErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console.error: ${message.text()}`);
  });
  return errors;
}

/**
 * Na falha, escreve no log o estado da página. Usar num `afterEach`.
 * @example test.afterEach(({ page }, testInfo) => reportPageOnFailure(page, testInfo, errors))
 */
export async function reportPageOnFailure(page: Page, testInfo: TestInfo, errors: string[]): Promise<void> {
  if (testInfo.status === testInfo.expectedStatus) return;
  const snapshot = await page
    .locator("body")
    .ariaSnapshot({ timeout: 2_000 })
    .catch((error: Error) => `(sem snapshot: ${error.message})`);
  console.log(
    [
      `--- Página na falha de "${testInfo.title}" ---`,
      `URL: ${page.url()}`,
      `Erros do navegador (${errors.length}):`,
      ...errors,
      "Árvore de acessibilidade:",
      snapshot,
      "--- fim ---",
    ].join("\n"),
  );
}
