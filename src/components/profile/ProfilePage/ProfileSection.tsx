"use client";

import { useRouter } from "next/navigation";
import { useId, type ReactNode } from "react";
import { Button } from "@/src/components/ui/Button";
import type { ProfileSection as ProfileSectionData } from "@/src/lib/domain/profile-page";
import styles from "./ProfilePage.module.css";

interface ProfileSectionProps<T> {
  title: string;
  section: ProfileSectionData<T>;
  /** Conteúdo com o dado carregado. Devolver `null` esconde a seção inteira (PF2). */
  children: (data: T) => ReactNode;
}

/**
 * Uma seção do perfil: `<section>` com `h2` (PROFILE.md §7) e o erro só dela (PF22).
 * @example <ProfileSection title="Rankings" section={page.rankings}>{(items) => …}</ProfileSection>
 */
export function ProfileSection<T>({ title, section, children }: ProfileSectionProps<T>) {
  const headingId = useId();
  const content = section.status === "ready" ? children(section.data) : <SectionError />;
  if (content === null) return null;
  return (
    <section className={styles.profile__section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["profile__section-title"]}>
        {title}
      </h2>
      {content}
    </section>
  );
}

// O erro fica no lugar da seção, e o resto do perfil continua (N24).
// "Tentar de novo" refaz a renderização no servidor, que refaz as consultas.
function SectionError() {
  const router = useRouter();
  return (
    <div className={styles["profile__section-error"]} role="status">
      <p className={styles["profile__section-error-text"]}>Não foi possível carregar.</p>
      <Button variant="secondary" onClick={() => router.refresh()}>
        Tentar de novo
      </Button>
    </div>
  );
}

export type { ProfileSectionProps };
