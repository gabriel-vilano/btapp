"use client";

import { CaretRightIcon } from "@phosphor-icons/react";
import { useId, type ReactNode } from "react";
import { Icon } from "@/src/components/ui/Icon";
import { List, ListItem } from "@/src/components/ui/ListItem";
import { Spinner } from "@/src/components/ui/Spinner";
import styles from "./SettingsList.module.css";

interface SettingsListProps {
  /** Título do grupo (ex.: "Conta"). Sem ele, o grupo é só a lista, como o do "Sair". */
  title?: string;
  /** `SettingsRow`s do grupo. */
  children: ReactNode;
}

/**
 * Um grupo da tela de configurações (NAVIGATION.md, N8): título opcional e as linhas.
 * @example <SettingsList title="Conta"><SettingsRow label="E-mail" value="ana@email.com" /></SettingsList>
 */
export function SettingsList({ title, children }: SettingsListProps) {
  const headingId = useId();
  if (title === undefined) {
    return (
      <div className={styles["settings-list"]}>
        <List divided>{children}</List>
      </div>
    );
  }
  return (
    <section className={styles["settings-list"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["settings-list__title"]}>
        {title}
      </h2>
      <List divided>{children}</List>
    </section>
  );
}

interface SettingsRowProps {
  label: string;
  /** Valor atual, abaixo do rótulo. Embaixo, e não à direita: um e-mail longo quebra a linha em vez de vazar. */
  value?: string;
  /** Tela que a linha abre. Ganha o chevron. */
  href?: string;
  /** Ação na própria linha, sem outra tela (ex.: "Sair"). */
  onClick?: () => void;
  /** A ação está em andamento: spinner no lugar do chevron, e novos toques não repetem a ação. */
  pending?: boolean;
  /** O que o leitor de tela anuncia enquanto `pending` (ex.: "Saindo"). */
  pendingLabel?: string;
}

/**
 * Linha de configuração: rótulo, valor e navegação. Sem `href` nem `onClick`, só exibe.
 * @example <SettingsRow label="Telefone para o WhatsApp" value="Não informado" href="/perfil/telefone" />
 */
export function SettingsRow({ label, value, href, onClick, pending = false, pendingLabel }: SettingsRowProps) {
  // O botão continua no DOM durante a ação: tirá-lo derrubaria o foco de quem usa teclado
  const handleClick = onClick && (() => (pending ? undefined : onClick()));
  return (
    <ListItem
      title={label}
      supportingText={value}
      href={href}
      onClick={handleClick}
      trailing={rowTrailing(href !== undefined, pending, pendingLabel)}
    />
  );
}

function rowTrailing(navigates: boolean, pending: boolean, pendingLabel?: string): ReactNode {
  if (pending) return <Spinner size="sm" label={pendingLabel} />;
  if (navigates) return <Icon icon={CaretRightIcon} size="sm" />;
  return undefined;
}

export type { SettingsListProps, SettingsRowProps };
