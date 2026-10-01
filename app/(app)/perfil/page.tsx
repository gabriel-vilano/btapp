import { connection } from "next/server";
import { OwnProfileHeader, ProfilePage } from "@/src/components/profile/ProfilePage";
import type { ProfilePageData } from "@/src/lib/domain/profile-page";
import { MOCK_VIEWER, mockProfilePage } from "@/src/mocks/profilePage";
import { loadOwnProfileIdentity, type OwnProfileIdentity } from "./ownProfileIdentity";

// Próprio perfil (docs/PROFILE.md). O nome, o @username e a foto vêm do Supabase
// (`profiles` do jogador logado); as seções de partidas, rankings e amizades seguem
// nos mocks do Lucas até as integrações delas.
export default async function OwnProfilePage() {
  // Renderiza a cada acesso: prerenderizada no build, a página congelaria as
  // datas relativas dos mocks ("há 3 dias") e as posições do momento do build
  await connection();
  const mockData = mockProfilePage(MOCK_VIEWER.username);
  if (mockData === null) throw new Error(`Perfil: o jogador dos mocks @${MOCK_VIEWER.username} não existe`);
  const data = withIdentity(mockData, await loadOwnProfileIdentity());
  return (
    <>
      <OwnProfileHeader username={data.player.username} />
      <main>
        <ProfilePage data={data} />
      </main>
    </>
  );
}

// Sem perfil legível (erro na consulta ou cadastro parado antes do @username), o
// cabeçalho fica com o jogador dos mocks, como antes da leitura do banco
function withIdentity(data: ProfilePageData, identity: OwnProfileIdentity | null): ProfilePageData {
  if (identity === null) return data;
  return { ...data, player: { ...data.player, ...identity } };
}
