import { SettingsList, SettingsRow } from "@/src/components/profile/SettingsList";
import { DetailHeader } from "@/src/components/shell/DetailHeader";
import { PHONE_SETTINGS_PATH } from "@/src/lib/navigation/phoneSettings";
import { formatBrazilPhone } from "@/src/lib/phone";
import { loadOwnPhone, type OwnPhone } from "@/src/lib/supabase/ownPhone";
import { loadAccountEmail } from "./accountEmail";
import { SignOutSection } from "./SignOutSection";

// Configurações (NAVIGATION.md, N8), aberta pela engrenagem do Perfil. A spec
// também põe aqui a senha (N8): a linha entra com o fluxo dela, para nenhuma
// linha levar a lugar nenhum.
export default async function SettingsPage() {
  const [email, phone] = await Promise.all([loadAccountEmail(), loadOwnPhone()]);

  return (
    <>
      <DetailHeader title="Configurações" />
      <main>
        {email !== null && (
          <SettingsList title="Conta">
            <SettingsRow label="E-mail" value={email} />
            <SettingsRow label="Telefone para o WhatsApp" value={phoneRowValue(phone)} href={PHONE_SETTINGS_PATH} />
          </SettingsList>
        )}
        <SignOutSection />
      </main>
    </>
  );
}

// Na falha da leitura, a linha continua levando à tela do telefone, que mostra o erro
function phoneRowValue(phone: OwnPhone): string | undefined {
  if (phone === "error") return undefined;
  return phone === null ? "Não informado" : formatBrazilPhone(phone);
}
