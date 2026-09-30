import { expect, test } from "@playwright/test";

import { submitLogin } from "./support/auth";
import { createConfirmedUser, TEST_PASSWORD, uniqueEmail } from "./support/users";

// O bloco lê dos mocks (o jogador da agenda mockada tem pendência), não do usuário criado
test.describe("Feed: bloco Sua vez (N20)", () => {
  test("aparece no topo do feed, com o item da agenda e a ação", async ({ page }) => {
    const email = uniqueEmail("feed-sua-vez");
    await createConfirmedUser(email);
    await submitLogin(page, email, TEST_PASSWORD);
    await expect(page).toHaveURL(/\/feed$/);

    const block = page.getByRole("region", { name: "Sua vez", exact: true });
    await expect(block).toBeVisible();
    await expect(block.getByRole("listitem").first()).toBeVisible();
    await expect(block.getByRole("link", { name: "Propor horários", exact: true }).first()).toHaveAttribute(
      "href",
      /^\/jogos\//,
    );
  });
});
