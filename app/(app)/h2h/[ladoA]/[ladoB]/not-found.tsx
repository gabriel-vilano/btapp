import { H2HNotFound } from "@/src/components/h2h/H2HPage";
import { DetailHeader } from "@/src/components/shell/DetailHeader";

// "H2H não encontrado" (docs/HEAD_TO_HEAD.md §6.1): nada revela qual lado falhou
export default function H2HRouteNotFound() {
  return (
    <>
      <DetailHeader title="H2H" />
      <main>
        <H2HNotFound />
      </main>
    </>
  );
}
