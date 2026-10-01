import { expect, test, type Page } from "@playwright/test";

import { submitLogin } from "./support/auth";
import { collectBrowserErrors, reportPageOnFailure } from "./support/diagnostics";
import { createConfirmedUser, TEST_PASSWORD, uniqueEmail } from "./support/users";

// A agenda e o amistoso leem dos mocks, vistos pelo Lucas, não do usuário criado

async function loginToAgenda(page: Page, flow: string): Promise<void> {
  const email = uniqueEmail(flow);
  await createConfirmedUser(email);
  await submitLogin(page, email, TEST_PASSWORD);
  await expect(page).toHaveURL(/\/feed$/);
  await page.goto("/jogos");
}

let browserErrors: string[] = [];
test.beforeEach(({ page }) => {
  browserErrors = collectBrowserErrors(page);
});
test.afterEach(({ page }, testInfo) => reportPageOnFailure(page, testInfo, browserErrors));

test.describe("Amistoso (RESULTS.md §6)", () => {
  test("N19: Registrar amistoso abre o fluxo em tela cheia, sem a navegação, e Fechar volta à agenda", async ({ page }) => {
    await loginToAgenda(page, "amistoso-registrar");
    // O botão do topo; o estado vazio repete o mesmo link (N19)
    await page.getByRole("link", { name: "Registrar amistoso", exact: true }).first().click();

    await expect(page).toHaveURL(/\/jogos\/amistoso$/);
    await expect(page.getByRole("heading", { name: "Registrar amistoso", exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Principal", exact: true })).toBeHidden();
    await expect(page.getByRole("button", { name: "Escolher parceiro", exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Fechar", exact: true }).click();
    await expect(page).toHaveURL(/\/jogos$/);
  });

  test("§6.2: o amistoso de \"Sua vez\" abre a tela dele, e Confirmar confirma", async ({ page }) => {
    await loginToAgenda(page, "amistoso-confirmar");
    await page.getByRole("main").locator('a[href="/jogos/match-friendly-pedro-lucas"]').first().click();

    await expect(page).toHaveURL(/\/jogos\/match-friendly-pedro-lucas$/);
    await expect(page.getByRole("heading", { name: "Pedro lançou o amistoso", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Confirmar", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Amistoso confirmado", exact: true })).toBeVisible();
  });
});
