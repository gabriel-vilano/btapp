import { expect, test } from "@playwright/test";

import { submitLogin } from "./support/auth";
import { createConfirmedUser, TEST_PASSWORD, uniqueEmail } from "./support/users";

test.describe("Sair da conta", () => {
  test("sair leva ao login e o /feed volta a exigir login", async ({ page }) => {
    const email = uniqueEmail("logout");
    await createConfirmedUser(email);
    await submitLogin(page, email, TEST_PASSWORD);
    await expect(page).toHaveURL(/\/feed$/);

    await page.getByRole("button", { name: "Sair", exact: true }).click();

    await expect(page).toHaveURL(/\/entrar$/);
    await expect(page.getByRole("heading", { name: "Bem-vindo de volta", exact: true })).toBeVisible();

    // Sem cookie de sessão sobrando: o proxy não mostra o aviso de sessão expirada
    await page.goto("/feed");
    await expect(page).toHaveURL(/\/entrar$/);
    await expect(page.getByRole("alert").filter({ hasText: "Sua sessão expirou" })).toHaveCount(0);
  });
});
