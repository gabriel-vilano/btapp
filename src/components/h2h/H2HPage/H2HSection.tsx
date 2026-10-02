"use client";

import { useRouter } from "next/navigation";
import { useId, type ReactNode } from "react";
import { Button } from "@/src/components/ui/Button";
import type { H2HPageSection } from "@/src/lib/domain/h2h-page";
import styles from "./H2HPage.module.css";

interface H2HSectionProps<T> {
  title: string;
  section: H2HPageSection<T>;
  /** Conteúdo com o dado carregado. Devolver `null` esconde a seção inteira (HH8). */
  children: (data: T) => ReactNode;
}

/**
 * Uma seção do H2H: `<section>` com `h2` (HEAD_TO_HEAD.md §7) e o erro só dela (HH22).
 * @example <H2HSection title="Forma recente" section={view.form}>{(form) => …}</H2HSection>
 */
export function H2HSection<T>({ title, section, children }: H2HSectionProps<T>) {
  const headingId = useId();
  const content = section.status === "ready" ? children(section.data) : <SectionError />;
  if (content === null) return null;
  return (
    <section className={styles.h2h__section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["h2h__section-title"]}>
        {title}
      </h2>
      {content}
    </section>
  );
}

// O erro fica no lugar da seção, e o resto da página continua (N24).
// "Tentar de novo" refaz a renderização no servidor, que refaz as consultas.
function SectionError() {
  const router = useRouter();
  return (
    <div className={styles["h2h__section-error"]} role="status">
      <p className={styles["h2h__section-error-text"]}>Não foi possível carregar.</p>
      <Button variant="secondary" onClick={() => router.refresh()}>
        Tentar de novo
      </Button>
    </div>
  );
}

export type { H2HSectionProps };
