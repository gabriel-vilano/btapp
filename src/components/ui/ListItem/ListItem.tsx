import Link from "next/link";
import { type ReactNode } from "react";
import styles from "./ListItem.module.css";

interface ListItemContent {
  /** Avatar ou ícone à esquerda. Decorativo: sai da leitura de tela, o título carrega o nome. */
  leading?: ReactNode;
  title: ReactNode;
  /** Linha de apoio abaixo do título: data, local, categoria. */
  supportingText?: ReactNode;
  /** Badge, valor, chevron ou ação à direita. */
  trailing?: ReactNode;
}

// Três formas: navega (href), age (onClick) ou só exibe (nenhum dos dois).
// Com os dois, href vence: a linha vira link. Um union exclusivo seria mais estrito,
// mas o Storybook não infere args de union de props e as stories deixam de tipar.
interface ListItemProps extends ListItemContent {
  href?: string;
  onClick?: () => void;
}

/**
 * Linha de lista com leading, título, texto de apoio e trailing. Renderiza um `<li>`:
 * use dentro de `<List>`.
 * Ex.: `<ListItem href="/perfil" leading={<Avatar … />} title="Lucas Silva" trailing={chevron} />`
 */
export function ListItem({ href, onClick, ...content }: ListItemProps) {
  if (href !== undefined) {
    return (
      <li className={styles["list-item"]}>
        <Link href={href} className={rowClass(true)}>
          <ListItemBody {...content} />
        </Link>
      </li>
    );
  }
  if (onClick !== undefined) {
    return (
      <li className={styles["list-item"]}>
        <button type="button" onClick={onClick} className={rowClass(true)}>
          <ListItemBody {...content} />
        </button>
      </li>
    );
  }
  return (
    <li className={styles["list-item"]}>
      <div className={rowClass(false)}>
        <ListItemBody {...content} />
      </div>
    </li>
  );
}

function rowClass(interactive: boolean): string {
  const base = styles["list-item__row"];
  return interactive ? `${base} ${styles["list-item__row--interactive"]}` : base;
}

function ListItemBody({ leading, title, supportingText, trailing }: ListItemContent) {
  return (
    <>
      {/* aria-hidden: o avatar repetiria o nome do título ("Lucas Silva, Lucas Silva") */}
      {leading && (
        <span className={styles["list-item__leading"]} aria-hidden>
          {leading}
        </span>
      )}
      <span className={styles["list-item__content"]}>
        <span className={styles["list-item__title"]}>{title}</span>
        {supportingText && (
          <span className={styles["list-item__supporting"]}>{supportingText}</span>
        )}
      </span>
      {trailing && <span className={styles["list-item__trailing"]}>{trailing}</span>}
    </>
  );
}

interface ListProps {
  children: ReactNode;
  /** Linha fina entre os itens, para listas longas e homogêneas (configurações). */
  divided?: boolean;
  /** Nome da lista para leitor de tela, quando não há título visível ligado a ela. */
  "aria-label"?: string;
}

/** `<ul>` sem marcadores que agrupa `ListItem`s. */
export function List({ children, divided = false, "aria-label": ariaLabel }: ListProps) {
  const className = divided ? `${styles.list} ${styles["list--divided"]}` : styles.list;
  // role="list" explícito: o Safari tira a semântica de lista de <ul> com list-style: none
  return (
    <ul className={className} role="list" aria-label={ariaLabel}>
      {children}
    </ul>
  );
}
