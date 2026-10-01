import { PhoneForm, PhoneLoadError } from "@/src/components/profile/PhoneForm";
import { DetailHeader } from "@/src/components/shell/DetailHeader";
import { SETTINGS_PATH } from "@/src/lib/domain/profile-page";
import { PHONE_RETURN_PARAM, phoneReturnPath } from "@/src/lib/navigation/phoneSettings";
import { loadOwnPhone } from "@/src/lib/supabase/ownPhone";
import { deletePhone, savePhone } from "./actions";

type PhoneSettingsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// "Telefone para o WhatsApp" (docs/SCHEDULING.md M20–M25), aberta pelas Configurações
// ou pelo primeiro toque em "Abrir no WhatsApp" na tela do confronto. Vinda de lá,
// o "Voltar" e o salvar levam de volta ao confronto.
export default async function PhoneSettingsPage({ searchParams }: PhoneSettingsPageProps) {
  const returnTo = await matchReturnPath(searchParams);
  const phone = await loadOwnPhone();
  return (
    <>
      <DetailHeader title="Telefone para o WhatsApp" parentHref={returnTo ?? SETTINGS_PATH} />
      <main>
        {phone === "error" ? (
          <PhoneLoadError />
        ) : (
          <PhoneForm currentPhone={phone} returnTo={returnTo} savePhone={savePhone} deletePhone={deletePhone} />
        )}
      </main>
    </>
  );
}

// Só a tela do confronto vale como volta; qualquer outro valor é ignorado
async function matchReturnPath(searchParams: PhoneSettingsPageProps["searchParams"]): Promise<string | undefined> {
  const candidate = (await searchParams)[PHONE_RETURN_PARAM];
  const path = phoneReturnPath(typeof candidate === "string" ? candidate : null);
  return path === SETTINGS_PATH ? undefined : path;
}
