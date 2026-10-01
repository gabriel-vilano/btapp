import { expect, test } from "@playwright/test";

import { submitLogin } from "./support/auth";
import { anonymousClient, signedInClient } from "./support/supabaseClients";
import { createConfirmedUser, TEST_PASSWORD, uniqueEmail } from "./support/users";

// @username único por teste, dentro do limite de 20 caracteres e de [a-z0-9._]
function uniqueUsername(): string {
  return `e2e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

test.describe("Dados privados do perfil (RLS de profile_private)", () => {
  test("um jogador logado não lê nem altera a data de nascimento de outro", async () => {
    const ownerEmail = uniqueEmail("privado-dono");
    const otherEmail = uniqueEmail("privado-outro");
    await createConfirmedUser(ownerEmail);
    await createConfirmedUser(otherEmail);
    const owner = await signedInClient(ownerEmail);
    const other = await signedInClient(otherEmail);

    const saved = await owner.client.from("profile_private").upsert({ id: owner.userId, birth_date: "1990-05-12" });
    expect(saved.error).toBeNull();

    // Leitura: a linha do dono simplesmente não existe para o outro
    const otherReads = await other.client.from("profile_private").select("id, birth_date").eq("id", owner.userId);
    expect(otherReads.error).toBeNull();
    expect(otherReads.data).toEqual([]);
    const otherReadsAll = await other.client.from("profile_private").select("id");
    expect(otherReadsAll.data).toEqual([]);

    // Escrita: criar com o id do dono é recusado, e editar a linha dele não muda nada
    const otherInserts = await other.client.from("profile_private").upsert({ id: owner.userId, birth_date: "2000-01-01" });
    expect(otherInserts.error).not.toBeNull();
    await other.client.from("profile_private").update({ birth_date: "2000-01-01" }).eq("id", owner.userId);

    const ownerReads = await owner.client.from("profile_private").select("birth_date").eq("id", owner.userId).single();
    expect(ownerReads.data).toEqual({ birth_date: "1990-05-12" });
  });

  test("sem login, a tabela não responde", async () => {
    const { data } = await anonymousClient().from("profile_private").select("id");
    expect(data ?? []).toEqual([]);
  });

  test("o perfil público, legível por qualquer jogador, não carrega a data de nascimento", async () => {
    const ownerEmail = uniqueEmail("privado-perfil");
    const otherEmail = uniqueEmail("privado-leitor");
    await createConfirmedUser(ownerEmail);
    await createConfirmedUser(otherEmail);
    const owner = await signedInClient(ownerEmail);
    const other = await signedInClient(otherEmail);
    await owner.client.from("profiles").upsert({ id: owner.userId, full_name: "Jogador E2E", username: uniqueUsername() });
    await owner.client.from("profile_private").upsert({ id: owner.userId, birth_date: "1990-05-12" });

    const { data } = await other.client.from("profiles").select("*").eq("id", owner.userId).single();
    expect(data).not.toBeNull();
    expect(JSON.stringify(data)).not.toContain("1990-05-12");
  });
});

test.describe("Editar perfil", () => {
  test("salva nome, @username e data de nascimento, e a tela reabre com os valores salvos", async ({ page }) => {
    const email = uniqueEmail("editar-perfil");
    const username = uniqueUsername();
    await createConfirmedUser(email);
    await submitLogin(page, email, TEST_PASSWORD);
    await expect(page).toHaveURL(/\/feed$/);

    await page.goto("/perfil/editar");
    await expect(page.getByRole("heading", { name: "Editar perfil", exact: true })).toBeVisible();
    // Fluxo modal de tarefa (N4): sem a navegação principal
    await expect(page.getByRole("navigation", { name: "Principal", exact: true })).toHaveCount(0);

    await page.getByLabel("Nome", { exact: true }).fill("Lucas");
    await page.getByLabel("Sobrenome", { exact: true }).fill("Silva");
    await page.getByLabel("Nome de usuário", { exact: true }).fill(username);
    await expect(page.getByText("Nome de usuário disponível", { exact: true })).toBeVisible();
    await page.getByLabel("Data de nascimento", { exact: true }).fill("1990-05-12");
    await page.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect(page).toHaveURL(/\/perfil$/);

    await page.goto("/perfil/editar");
    await expect(page.getByLabel("Nome", { exact: true })).toHaveValue("Lucas");
    await expect(page.getByLabel("Sobrenome", { exact: true })).toHaveValue("Silva");
    await expect(page.getByLabel("Nome de usuário", { exact: true })).toHaveValue(username);
    await expect(page.getByLabel("Data de nascimento", { exact: true })).toHaveValue("1990-05-12");
  });
});
