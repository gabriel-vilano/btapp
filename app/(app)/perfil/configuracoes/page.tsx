import { SettingsList, SettingsRow } from "@/src/components/profile/SettingsList";
import { DetailHeader } from "@/src/components/shell/DetailHeader";
import { loadAccountEmail } from "./accountEmail";
import { SignOutSection } from "./SignOutSection";

// Configurações (NAVIGATION.md, N8), aberta pela engrenagem do Perfil. A spec
// também põe aqui a senha e o telefone para o WhatsApp (M20–M25): as linhas
// entram com os fluxos delas, para nenhuma linha levar a lugar nenhum.
export default async function SettingsPage() {
  const email = await loadAccountEmail();

  return (
    <>
      <DetailHeader title="Configurações" />
      <main>
        {email !== null && (
          <SettingsList title="Conta">
            <SettingsRow label="E-mail" value={email} />
          </SettingsList>
        )}
        <SignOutSection />
      </main>
    </>
  );
}
