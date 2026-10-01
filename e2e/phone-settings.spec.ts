import { expect, test } from "@playwright/test";

import { submitLogin } from "./support/auth";
import { collectBrowserErrors, reportPageOnFailure } from "./support/diagnostics";
import { signedInClient } from "./support/supabaseClients";
import { createConfirmedUser, TEST_PASSWORD, uniqueEmail } from "./support/users";

// Telefone para o "Abrir no WhatsApp" (docs/SCHEDULING.md §7). O número fica em
// `profile_private`, cuja linha só o dono lê (M23): estes testes provam a regra no banco.

const PHONE = "+5531999990001";
const CONSENTED_AT = "2026-10-01T05:30:00.000Z";

let browserErrors: string[] = [];
test.beforeEach(({ page }) => {
  browserErrors = collectBrowserErrors(page);
});
test.afterEach(({ page }, testInfo) => reportPageOnFailure(page, testInfo, browserErrors));

test.describe("Telefone na profile_private (RLS e checks)", () => {
  test("um jogador logado não lê nem altera o telefone de outro", async () => {
    const ownerEmail = uniqueEmail("telefone-dono");
    const otherEmail = uniqueEmail("telefone-outro");
    await createConfirmedUser(ownerEmail);
    await createConfirmedUser(otherEmail);
    const owner = await signedInClient(ownerEmail);
    const other = await signedInClient(otherEmail);

    const saved = await owner.client
      .from("profile_private")
      .upsert({ id: owner.userId, phone: PHONE, phone_consented_at: CONSENTED_AT });
    expect(saved.error).toBeNull();

    // Leitura: nem pelo id do dono, nem varrendo a tabela
    const byId = await other.client.from("profile_private").select("id, phone").eq("id", owner.userId);
    expect(byId.error).toBeNull();
    expect(byId.data).toEqual([]);
    const all = await other.client.from("profile_private").select("phone").not("phone", "is", null);
    expect(all.data).toEqual([]);

    // Escrita: apagar ou trocar o número do dono não muda nada
    await other.client
      .from("profile_private")
      .update({ phone: null, phone_consented_at: null })
      .eq("id", owner.userId);
    const ownerReads = await owner.client.from("profile_private").select("phone").eq("id", owner.userId).single();
    expect(ownerReads.data).toEqual({ phone: PHONE });
  });

  test("o banco recusa telefone sem consentimento e número fora do formato", async () => {
    const email = uniqueEmail("telefone-checks");
    await createConfirmedUser(email);
    const { client, userId } = await signedInClient(email);

    // M21: sem o momento do consentimento, o número não entra
    const withoutConsent = await client.from("profile_private").upsert({ id: userId, phone: PHONE });
    expect(withoutConsent.error?.code).toBe("23514");

    // Só +55 em E.164, mesmo gravando direto pela Data API, sem a tela
    const foreign = await client
      .from("profile_private")
      .upsert({ id: userId, phone: "+14155550101", phone_consented_at: CONSENTED_AT });
    expect(foreign.error?.code).toBe("23514");
    const masked = await client
      .from("profile_private")
      .upsert({ id: userId, phone: "(31) 99999-0001", phone_consented_at: CONSENTED_AT });
    expect(masked.error?.code).toBe("23514");
  });
});

test.describe("Telefone para o WhatsApp", () => {
  test("o primeiro toque no WhatsApp leva a informar o telefone, que volta ao confronto e se apaga nas Configurações", async ({
    page,
  }) => {
    const email = uniqueEmail("telefone-fluxo");
    await createConfirmedUser(email);
    await submitLogin(page, email, TEST_PASSWORD);
    await expect(page).toHaveURL(/\/feed$/);

    // M20: sem telefone, o primeiro toque pergunta antes de abrir o WhatsApp
    const matchPath = "/jogos/match-arena-mangaba-mb-r3-1";
    await page.goto(matchPath);
    // Um toque antes da hidratação segue o link nativo (nova aba) sem perguntar:
    // repete até o React assumir o clique
    const prompt = page.getByRole("dialog", { name: "Informar seu telefone?", exact: true });
    await expect(async () => {
      await page.getByRole("link", { name: "Abrir no WhatsApp", exact: true }).click();
      await expect(prompt).toBeVisible({ timeout: 2000 });
    }).toPass();
    await prompt.getByRole("link", { name: "Informar telefone", exact: true }).click();

    await expect(page).toHaveURL(/\/perfil\/configuracoes\/telefone\?volta=/);
    await expect(page.getByRole("heading", { name: "Telefone para o WhatsApp", exact: true })).toBeVisible();
    await page.getByLabel("Telefone", { exact: true }).fill("(31) 99999-0001");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Salvar telefone", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${matchPath}$`));

    // Nas Configurações, a linha mostra o número salvo
    await page.goto("/perfil/configuracoes");
    const phoneRow = page.getByRole("link", { name: /Telefone para o WhatsApp/ });
    await expect(phoneRow).toContainText("(31) 99999-0001");

    // M25: apagar grava null, e a linha volta a "Não informado"
    await phoneRow.click();
    await expect(page.getByLabel("Telefone", { exact: true })).toHaveValue("(31) 99999-0001");
    await page.getByRole("button", { name: "Apagar telefone", exact: true }).click();
    await expect(page).toHaveURL(/\/perfil\/configuracoes$/);
    await expect(page.getByRole("link", { name: /Telefone para o WhatsApp/ })).toContainText("Não informado");
  });
});
