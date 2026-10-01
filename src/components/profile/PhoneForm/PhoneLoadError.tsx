"use client";

import { useRouter } from "next/navigation";
import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import styles from "./PhoneForm.module.css";

// "use client": o Alert importa ícones do Phosphor, que não rodam em Server Component.

/**
 * Tela do telefone sem a leitura do número salvo. O formulário não aparece: sem
 * saber se há número, o "Apagar telefone" sumiria mesmo com um número gravado.
 */
export function PhoneLoadError() {
  const router = useRouter();
  return (
    <div className={styles["phone-form"]}>
      <Alert status="attention" title="Não foi possível carregar seu telefone" description="Confira a conexão e tente de novo." />
      <Button variant="secondary" fullWidth onClick={() => router.refresh()}>
        Tentar de novo
      </Button>
    </div>
  );
}
