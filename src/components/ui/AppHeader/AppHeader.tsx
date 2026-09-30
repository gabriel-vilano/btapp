"use client";

import { CaretLeftIcon } from "@phosphor-icons/react";
import { type ReactNode } from "react";
import { IconButtonLink } from "@/src/components/ui/IconButton";
import styles from "./AppHeader.module.css";

type AppHeaderProps = {
  /** Título da tela, renderizado como o `h1`. Pode ser o `<Logo />`, como no Feed. */
  title: ReactNode;
  /** Destino do "Voltar". Sem ele, a tela é a raiz de uma aba e o cabeçalho não tem "Voltar". */
  backHref?: string;
  /**
   * Tag do título. `h1` (padrão) na maioria das telas; `p` quando o conteúdo já tem o próprio `h1`,
   * como o nome no perfil (PROFILE.md §7). Cada tela tem exatamente um `h1`.
   */
  titleAs?: "h1" | "p";
  /** Ações à direita: IconButton, IconButtonLink ou um Button ghost. */
  actions?: ReactNode;
  className?: string;
};

/**
 * Cabeçalho das abas e das telas de detalhe (NAVIGATION.md, seção 3): "Voltar", título e ações.
 * @example <AppHeader title="Jogos" actions={<Button variant="ghost">Registrar amistoso</Button>} />
 */
export function AppHeader({ title, titleAs: TitleTag = "h1", backHref, actions, className }: AppHeaderProps) {
  const classes = [styles.header, backHref && styles["header--with-back"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classes}>
      {backHref && <IconButtonLink href={backHref} icon={CaretLeftIcon} label="Voltar" />}
      <TitleTag className={styles.header__title}>{title}</TitleTag>
      {actions && <div className={styles.header__actions}>{actions}</div>}
    </header>
  );
}

export type { AppHeaderProps };
