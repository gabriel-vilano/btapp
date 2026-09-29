import { expect, test, type Locator, type Page } from "@playwright/test";

import { submitLogin } from "./support/auth";
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

  test("N25: a 393px, \"Competições\" em negrito cabe na aba sem cortar", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await loginToFeed(page, "casca-393");
    const nav = mainNavigation(page);

    // Aba atual: o rótulo fica em negrito, a versão mais larga dele
    await nav.getByRole("link", { name: /^Competições/ }).click();
    await expect(page).toHaveURL(/\/competicoes$/);

    const tab = nav.getByRole("link", { name: /^Competições/ });
    await expect(tab).toHaveAttribute("aria-current", "page");

    // `document.fonts.ready` não espera a face em negrito que ainda nem foi pedida:
    // sem o load explícito, a medida sai com a fonte de reserva do sistema, mais larga
    const arimoLoaded = await page.evaluate(async () => {
      await document.fonts.load("700 12px Arimo", "Competições");
      return document.fonts.check("700 12px Arimo", "Competições");
    });
    expect(arimoLoaded, "a Arimo em negrito precisa estar carregada para a medida valer").toBe(true);

    const label = tab.getByText("Competições", { exact: true });
    const labelBox = await boxOf(label);
    const tabBox = await boxOf(tab);
    // Diagnóstico na mensagem: sem ele, uma falha na CI não diz se foi a fonte ou o tamanho
    const rendering = await label.evaluate((element) => {
      const style = getComputedStyle(element);
      const context = document.createElement("canvas").getContext("2d");
      if (context) context.font = "700 12px Arimo";
      const arimoWidth = context?.measureText("Competições").width.toFixed(1);
      return `${style.fontWeight} ${style.fontSize} ${style.fontFamily}; Arimo 700 12px mede ${arimoWidth}px; ${navigator.userAgent}`;
    });
    const widths = `rótulo ${labelBox.width}px, aba ${tabBox.width}px (${rendering})`;
    expect(labelBox.x, widths).toBeGreaterThanOrEqual(tabBox.x);
    expect(labelBox.x + labelBox.width, widths).toBeLessThanOrEqual(tabBox.x + tabBox.width);
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
