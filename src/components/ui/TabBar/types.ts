import type { ElementType } from "react";
import type { CountBadgeInfo } from "@/src/components/ui/CountBadge";

/** Uma aba da navegação principal (docs/NAVIGATION.md, N1). */
export type NavigationItem = {
  /** Identificador da aba, comparado com `currentValue`. */
  value: string;
  href: string;
  /** Rótulo visível de uma palavra. É também o nome acessível. */
  label: string;
  /** Componente do Phosphor. Na aba ativa, aparece com peso `fill`. */
  icon: ElementType;
  /** Foto no lugar do ícone (aba Perfil). O rótulo continua sendo o nome acessível. */
  avatar?: { url: string | null; alt: string };
  /** Contador sobre o ícone (N3). A descrição entra no nome acessível. */
  badge?: CountBadgeInfo;
};

export type NavigationProps = {
  items: NavigationItem[];
  /**
   * Aba marcada. Vem de fora, não da URL: numa tela de detalhe, a aba marcada
   * é a de origem (N10), e a mesma URL pode ter vindo de abas diferentes.
   */
  currentValue: string;
  /** Nome do landmark `<nav>`. */
  label?: string;
  className?: string;
};
