import { H2HPageSkeleton } from "@/src/components/h2h/H2HPage";
import { DetailHeader } from "@/src/components/shell/DetailHeader";

// Carregando (HH21, N23): o cabeçalho e a tab bar aparecem na hora
export default function H2HLoading() {
  return (
    <>
      <DetailHeader title="H2H" titleAs="p" />
      <main>
        <H2HPageSkeleton />
      </main>
    </>
  );
}
