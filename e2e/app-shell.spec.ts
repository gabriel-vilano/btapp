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
    await page.evaluate(() => document.fonts.ready);

    const tab = nav.getByRole("link", { name: /^Competições/ });
    await expect(tab).toHaveAttribute("aria-current", "page");
    const labelBox = await boxOf(tab.getByText("Competições", { exact: true }));
    const tabBox = await boxOf(tab);
    expect(labelBox.x).toBeGreaterThanOrEqual(tabBox.x);
    expect(labelBox.x + labelBox.width).toBeLessThanOrEqual(tabBox.x + tabBox.width);
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
