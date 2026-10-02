"use client";

import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import styles from "./H2HPage.module.css";

interface H2HLoadErrorProps {
  onRetry: () => void;
}

/**
 * Erro ao carregar lados e resumo (HH22, N24): sem eles a página não tem sentido, então o
 * erro ocupa a tela, com "Tentar de novo". O cabeçalho da tela continua.
 * @example <H2HLoadError onRetry={unstable_retry} />
 */
export function H2HLoadError({ onRetry }: H2HLoadErrorProps) {
  return (
    <div className={`${styles.h2h} ${styles["h2h__load-error"]}`}>
      <Alert status="attention" title="Não foi possível carregar o H2H." description="Confira a conexão e tente de novo." />
      <Button variant="secondary" onClick={onRetry}>
        Tentar de novo
      </Button>
    </div>
  );
}

export type { H2HLoadErrorProps };
