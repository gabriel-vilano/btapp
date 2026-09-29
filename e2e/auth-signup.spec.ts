import { expect, test } from "@playwright/test";

import { submitOtp } from "./support/auth";
import { readOtpFromMailpit } from "./support/mailpit";
import { TEST_PASSWORD, uniqueEmail } from "./support/users";

test("cadastro completo: dados, código do e-mail, perfil e feed", async ({ page }) => {
  const email = uniqueEmail("cadastro");
  // Username válido tem de 3 a 20 caracteres em [a-z0-9._]
  const username = `e2e.${Date.now().toString(36)}`;

  await page.goto("/cadastro");
  await page.getByLabel("Nome", { exact: true }).fill("Jogador");
  await page.getByLabel("Sobrenome", { exact: true }).fill("E2E");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();

  await expect(page).toHaveURL(/\/cadastro\/verificar/);
  await submitOtp(page, await readOtpFromMailpit(email));

  await expect(page).toHaveURL(/\/cadastro\/perfil$/);
  await page.getByLabel("Username", { exact: true }).fill(username);
  await expect(page.getByText("Usuário disponível")).toBeVisible();
  await page.getByRole("button", { name: "Concluir", exact: true }).click();

  await expect(page).toHaveURL(/\/feed$/);
  await expect(page.getByRole("heading", { name: "Feed", exact: true })).toBeVisible();
});
