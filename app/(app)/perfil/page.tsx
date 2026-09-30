import { connection } from "next/server";
import { OwnProfileHeader, ProfilePage } from "@/src/components/profile/ProfilePage";
import { MOCK_VIEWER, mockProfilePage } from "@/src/mocks/profilePage";

// Próprio perfil (docs/PROFILE.md), com os mocks até a integração com o
// Supabase: quem vê é o jogador "logado" dos mocks.
export default async function OwnProfilePage() {
  // Renderiza a cada acesso: prerenderizada no build, a página congelaria as
  // datas relativas dos mocks ("há 3 dias") e as posições do momento do build
  await connection();
  const data = mockProfilePage(MOCK_VIEWER.username);
  if (data === null) throw new Error(`Perfil: o jogador dos mocks @${MOCK_VIEWER.username} não existe`);
  return (
    <>
      <OwnProfileHeader username={data.player.username} />
      <main>
        <ProfilePage data={data} />
      </main>
    </>
  );
}
