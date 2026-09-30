"use client";

import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import styles from "./RankingLoadError.module.css";

interface RankingLoadErrorProps {
  onRetry: () => void;
}

/**
 * Erro ao carregar a classificação (RANKING.md 8.3, N24): no lugar da tabela, o aviso
 * e "Tentar de novo". O cabeçalho da tela continua.
 * Ex.: `<RankingLoadError onRetry={unstable_retry} />`
 */
export function RankingLoadError({ onRetry }: RankingLoadErrorProps) {
  return (
    <div className={styles["ranking-load-error"]}>
      <Alert
        status="attention"
        title="Não foi possível carregar a classificação."
        description="Confira a conexão e tente de novo."
      />
      <Button variant="secondary" onClick={onRetry}>
        Tentar de novo
      </Button>
    </div>
  );
}
