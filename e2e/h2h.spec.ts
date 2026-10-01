import { expect, test, type Page } from "@playwright/test";

import { createConfirmedUser, TEST_PASSWORD, uniqueEmail } from "./support/users";

// Página de H2H (docs/HEAD_TO_HEAD.md) sobre os mocks, vistos pelo Lucas

const DOUBLES_PATH = "/h2h/lucassilva+rafaelcosta/pedrohenrique+thiagomendes";

function sectionTitles(page: Page) {
  return page.locator("main section > h2");
}

test.describe("H2H", () => {
  // HH7: sem login, a rota leva ao login e volta à página
  test("sem sessão, leva ao login e volta à página de duplas, com as seções na ordem da HH8", async ({ page }) => {
    const email = uniqueEmail("h2h-duplas");
    await createConfirmedUser(email);

    await page.goto(DOUBLES_PATH);
    await expect(page).toHaveURL(/\/entrar\?next=/);
    await page.getByLabel("E-mail", { exact: true }).fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    await expect(page).toHaveURL(new RegExp(`${DOUBLES_PATH.replace(/\+/g, "\\+")}$`));
    await expect(page.getByRole("heading", { level: 1, name: "Lucas e Rafael × Pedro e Thiago", exact: true })).toBeAttached();
    await expect(sectionTitles(page)).toHaveText(["Forma recente", "No ranking", "Confrontos", "Jogador contra jogador"]);
    await expect(page.getByRole("link", { name: /^Lucas × Pedro/ })).toHaveAttribute("href", "/h2h/lucassilva/pedrohenrique");
  });

  test("jogadores com a URL invertida: o lado de quem vê fica à esquerda (HH6)", async ({ page }) => {
    const email = uniqueEmail("h2h-jogadores");
    await createConfirmedUser(email);
    await page.goto("/entrar");
    await page.getByLabel("E-mail", { exact: true }).fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/\/feed$/);

    await page.goto("/h2h/pedrohenrique/lucassilva");
    await expect(page.getByRole("heading", { level: 1, name: "Lucas × Pedro", exact: true })).toBeAttached();
    await expect(page.getByText(/^Você venceu 3 · Último/)).toBeVisible();
    await expect(sectionTitles(page)).toHaveText(["Forma recente", "Confrontos"]);
    // A tab bar continua visível, com o Feed marcado de fora do app (N4, N28)
    const nav = page.getByRole("navigation", { name: "Principal", exact: true });
    await expect(nav.getByRole("link", { name: "Feed", exact: true })).toHaveAttribute("aria-current", "page");

    // A dupla fora da ordem alfabética vai para a URL única (HH5)
    await page.goto("/h2h/rafaelcosta+lucassilva/pedrohenrique+thiagomendes");
    await expect(page).toHaveURL(new RegExp(`${DOUBLES_PATH.replace(/\+/g, "\\+")}$`));

    await page.goto("/h2h/lucassilva/ninguem");
    await expect(page.getByText("H2H não encontrado", { exact: true })).toBeVisible();
  });
});
