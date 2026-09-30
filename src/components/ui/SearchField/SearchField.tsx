"use client";

import { useId, useRef, type ChangeEvent } from "react";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./SearchField.module.css";

type SearchFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  /** Diz o que o escopo atual busca (EX3), ex.: "Nome ou @username". */
  placeholder: string;
  /** Rótulo acessível, visualmente oculto: a lupa e o placeholder já dizem o que o campo é. */
  label?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  name?: string;
  className?: string;
};

/**
 * Campo de busca com lupa, rótulo oculto e botão de limpar.
 * @example <SearchField value={term} onValueChange={setTerm} placeholder="Nome ou @username" onFocus={showScopes} />
 */
export function SearchField({
  value,
  onValueChange,
  placeholder,
  label = "Buscar",
  onFocus,
  onBlur,
  name,
  className,
}: SearchFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Limpar devolve o foco ao campo: quem limpou quase sempre vai digitar outro termo
  function handleClear() {
    onValueChange("");
    inputRef.current?.focus();
  }

  return (
    <div className={[styles["search-field"], className].filter(Boolean).join(" ")}>
      <label htmlFor={inputId} className={styles["search-field__label"]}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="search"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onValueChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        // Sem autocomplete, o iOS sugere nomes e e-mails salvos em cima do teclado
        autoComplete="off"
        enterKeyHint="search"
        className={styles["search-field__input"]}
      />
      <span className={styles["search-field__leading"]}>
        <Icon icon={MagnifyingGlassIcon} size="sm" />
      </span>
      {value.length > 0 && (
        <button
          type="button"
          className={styles["search-field__clear"]}
          onClick={handleClear}
          aria-label="Limpar busca"
        >
          <Icon icon={XIcon} size="sm" />
        </button>
      )}
    </div>
  );
}
