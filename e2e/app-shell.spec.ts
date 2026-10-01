import { expect, test, type Locator, type Page } from "@playwright/test";

import { submitLogin } from "./support/auth";
import { collectBrowserErrors, reportPageOnFailure } from "./support/diagnostics";
import { createConfirmedUser, TEST_PASSWORD, uniqueEmail } from "./support/users";

async function loginToFeed(page: Page, flow: string): Promise<void> {
  const email = uniqueEmail(flow);
  await createConfirmedUser(email);
  await submitLogin(page, email, TEST_PASSWORD);
  await expect(page).toHaveURL(/\/feed$/);
}

async function boxOf(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`boxOf: elemento sem caixa na tela (${locator}), esperado visível`);
  return box;
}

let browserErrors: string[] = [];
test.beforeEach(({ page }) => {
  browserErrors = collectBrowserErrors(page);
});
test.afterEach(({ page }, testInfo) => reportPageOnFailure(page, testInfo, browserErrors));

function mainNavigation(page: Page) {
  return page.getByRole("navigation", { name: "Principal", exact: true });
}

test.describe("Casca do app", () => {
  test("as 5 abas marcam a aba atual e continuam marcadas ao recarregar", async ({ page }) => {
    await loginToFeed(page, "casca-abas");
    const nav = mainNavigation(page);

    // Uma navegação só: a outra (trilho ou barra) está escondida por CSS
    await expect(nav).toHaveCount(1);
    await expect(nav.getByRole("link")).toHaveCount(5);
    await expect(nav.getByRole("link", { name: "Feed", exact: true })).toHaveAttribute("aria-current", "page");

    await nav.getByRole("link", { name: "Explorar", exact: true }).click();
    await expect(page).toHaveURL(/\/explorar$/);
    await expect(nav.getByRole("link", { name: "Explorar", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Feed", exact: true })).not.toHaveAttribute("aria-current");

    await page.reload();
    await expect(nav.getByRole("link", { name: "Explorar", exact: true })).toHaveAttribute("aria-current", "page");
  });

  /*
   * N25 pede o rótulo "sem truncar e sem quebrar linha". O critério é o da TabBar
   * (story At320 da ENG-72): o rótulo pode passar um pouco da coluna, desde que
   * inteiro, numa linha e sem encostar nos rótulos vizinhos. A largura varia com o
   * Chrome: 75px no 141 e 82px no 147 da CI, para uma aba de 78,6px.
   */
  test("N25: a 393px, \"Competições\" em negrito aparece inteiro, numa linha, sem encostar nos vizinhos", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await loginToFeed(page, "casca-393");
    const nav = mainNavigation(page);

    // Aba atual: o rótulo fica em negrito, a versão mais larga dele
    await nav.getByRole("link", { name: /^Competições/ }).click();
    await expect(page).toHaveURL(/\/competicoes$/);
    await expect(nav.getByRole("link", { name: /^Competições/ })).toHaveAttribute("aria-current", "page");

    // `document.fonts.ready` não espera a face em negrito que ainda nem foi pedida
    await page.evaluate(() => document.fonts.load("700 12px Arimo", "Competições"));

    const labels = await Promise.all(
      ["Jogos", "Competições", "Explorar"].map((text) => boxOf(nav.getByText(text, { exact: true }))),
    );
    const [previous, competitions, next] = labels;
    const report = labels.map((box) => `${box.x.toFixed(1)}+${box.width.toFixed(1)}`).join(" | ");

    // Uma linha só: a de label-md tem 16px
    expect(competitions.height, report).toBeLessThanOrEqual(16);
    expect(previous.x + previous.width, report).toBeLessThan(competitions.x);
    expect(competitions.x + competitions.width, report).toBeLessThan(next.x);

    // Inteiro: nada entre o rótulo e a barra corta o que passa da coluna
    const clipped = await nav.evaluate((navElement) =>
      [...navElement.querySelectorAll("ul, li, a, a > span")].some(
        (element) => getComputedStyle(element).overflowX !== "visible",
      ),
    );
    expect(clipped, "algum elemento da barra corta o rótulo (overflow diferente de visible)").toBe(false);
  });

  test("N27: a partir de 600px, o trilho lateral substitui a barra do rodapé", async ({ page }) => {
    await loginToFeed(page, "casca-trilho");
    const nav = mainNavigation(page);
    // No mobile, a barra fica no rodapé
    const tabBarBox = await boxOf(nav);
    expect(tabBarBox.y).toBeGreaterThan(0);

    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(nav).toHaveCount(1);
    const railBox = await boxOf(nav);
    expect(railBox.x).toBe(0);
    expect(railBox.y).toBe(0);
    expect(railBox.width).toBeLessThan(200);
  });
});

function backLink(page: Page) {
  return page.getByRole("banner").getByRole("link", { name: "Voltar", exact: true });
}

test.describe("Voltar das telas de detalhe (N10 e N28)", () => {
  // TEMPORÁRIO (ENG-139): repetir para capturar a falha instável na CI
  for (const round of Array.from({ length: 15 }, (_, index) => index + 1)) test(`N10: a partida aberta pelo Perfil mantém o Perfil marcado, e o Voltar leva a ele #${round}`, async ({ page }) => {
    await loginToFeed(page, "voltar-perfil");
    const nav = mainNavigation(page);

    await nav.getByRole("link", { name: "Perfil", exact: true }).click();
    await expect(page).toHaveURL(/\/perfil$/);
    // Uma partida de ranking do Lucas em "Partidas recentes": o nome do link é o dos adversários
    await page.getByRole("main").locator('a[href="/jogos/match-arena-mangaba-mb-r2-1"]').first().click();

    await expect(page).toHaveURL(/\/jogos\/match-arena-mangaba-mb-r2-1$/);
    await expect(nav.getByRole("link", { name: "Perfil", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(backLink(page)).toHaveAttribute("href", "/perfil");

    await backLink(page).click();
    await expect(page).toHaveURL(/\/perfil$/);
  });

  test("N10: o Voltar leva à raiz da aba como ela estava, com a query", async ({ page }) => {
    await loginToFeed(page, "voltar-query");
    await page.goto("/competicoes?origem=teste");
    await page.getByRole("main").locator('a[href="/ranking/masculino-b"]').first().click();

    await expect(page).toHaveURL(/\/ranking\/masculino-b$/);
    await expect(backLink(page)).toHaveAttribute("href", "/competicoes?origem=teste");
  });

  test("N28: a competição aberta por link marca Competições para o inscrito e Explorar para quem não está", async ({
    page,
  }) => {
    await loginToFeed(page, "voltar-competicao");
    const nav = mainNavigation(page);

    await page.goto("/competicoes/ranking-arena-mangaba");
    await expect(nav.getByRole("link", { name: /^Competições/ })).toHaveAttribute("aria-current", "page");
    await expect(backLink(page)).toHaveAttribute("href", "/competicoes");

    await page.goto("/competicoes/circuito-praia-norte");
    await expect(nav.getByRole("link", { name: "Explorar", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(backLink(page)).toHaveAttribute("href", "/explorar");
  });
});
