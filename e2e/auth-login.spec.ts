import { expect, test } from "@playwright/test";

import { submitLogin } from "./support/auth";
import { createConfirmedUser, TEST_PASSWORD, uniqueEmail } from "./support/users";

const EXPIRED_TITLE = "Sua sessão expirou";

test.describe("Login e rota protegida", () => {
  test("senha errada mostra erro e mantém na tela de login", async ({ page }) => {
    const email = uniqueEmail("login-erro");
    await createConfirmedUser(email);

    await submitLogin(page, email, "SenhaErrada99");

    await expect(page.getByRole("alert").filter({ hasText: "E-mail ou senha incorretos" })).toBeVisible();
    await expect(page).toHaveURL(/\/entrar$/);
  });

  test("senha certa leva ao feed e, logado, /entrar volta pro feed", async ({ page }) => {
    const email = uniqueEmail("login");
    await createConfirmedUser(email);

    await submitLogin(page, email, TEST_PASSWORD);

    await expect(page).toHaveURL(/\/feed$/);
    await expect(page.getByRole("heading", { name: "Feed", exact: true })).toBeVisible();

    await page.goto("/entrar");
    await expect(page).toHaveURL(/\/feed$/);
  });

  test("sem sessão, /feed leva ao login sem aviso de sessão expirada", async ({ page }) => {
    await page.goto("/feed");

    await expect(page).toHaveURL(/\/entrar$/);
    await expect(page.getByRole("heading", { name: "Bem-vindo de volta", exact: true })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: EXPIRED_TITLE })).toHaveCount(0);
  });

  // Regressão: o parâmetro `expired` se perdia no redirect da página raiz e o aviso nunca aparecia.
  test("cookie de sessão inválido leva ao login com aviso, que some ao digitar", async ({ page, baseURL }) => {
    await page.context().addCookies([{ name: "sb-127-auth-token", value: "sessao-invalida", url: baseURL }]);

    await page.goto("/feed");

    await expect(page).toHaveURL(/\/entrar\?expired=true$/);
    const expiredAlert = page.getByRole("alert").filter({ hasText: EXPIRED_TITLE });
    await expect(expiredAlert).toBeVisible();

    await page.getByLabel("E-mail", { exact: true }).fill("a");
    await expect(expiredAlert).toHaveCount(0);
  });

  // EX21 e PF20: o login que veio de um link volta para a tela do link, não para o feed
  test("sem sessão, /explorar leva ao login e, depois de entrar, volta ao Explorar", async ({ page }) => {
    const email = uniqueEmail("login-volta");
    await createConfirmedUser(email);

    await page.goto("/explorar");
    await expect(page).toHaveURL(/\/entrar\?next=%2Fexplorar$/);

    await page.getByLabel("E-mail", { exact: true }).fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    await expect(page).toHaveURL(/\/explorar$/);
    await expect(page.getByRole("heading", { name: "Explorar", exact: true })).toBeVisible();
  });
});
