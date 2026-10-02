import { expect, test, type Page } from "@playwright/test";

import { submitLogin } from "./support/auth";
import { collectBrowserErrors, reportPageOnFailure } from "./support/diagnostics";
import { createConfirmedUser, TEST_PASSWORD, uniqueEmail } from "./support/users";

// Classificação (docs/RANKING.md) sobre os mocks, vista pelo Lucas: inscrito no
// Masculino B do Ranking Arena Mangaba, que também tem a Mista C 40+

let browserErrors: string[] = [];
test.beforeEach(({ page }) => {
  browserErrors = collectBrowserErrors(page);
});
test.afterEach(({ page }, testInfo) => reportPageOnFailure(page, testInfo, browserErrors));

async function login(page: Page, flow: string): Promise<void> {
  const email = uniqueEmail(flow);
  await createConfirmedUser(email);
  await submitLogin(page, email, TEST_PASSWORD);
  await expect(page).toHaveURL(/\/feed$/);
}

function categoryHeading(page: Page) {
  return page.getByRole("main").getByRole("heading", { level: 2 });
}

test.describe("Seletor de categoria (RK6)", () => {
  test("a folha troca para uma categoria em que o jogador não está inscrito, e fecha", async ({ page }) => {
    await login(page, "ranking-categoria");
    await page.goto("/ranking/masculino-b");
    await expect(categoryHeading(page)).toContainText("Ranking Arena Mangaba 2026 · Masculino B");

    await page.getByRole("button", { name: /trocar categoria$/ }).click();
    const sheet = page.getByRole("dialog", { name: "Trocar categoria", exact: true });
    await expect(sheet.getByRole("heading", { name: "Suas categorias", exact: true })).toBeVisible();
    await sheet.getByRole("link", { name: /^Mista C 40\+/ }).click();

    await expect(page).toHaveURL(/\/ranking\/mista-c-40$/);
    await expect(categoryHeading(page)).toContainText("Ranking Arena Mangaba 2026 · Mista C 40+");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
