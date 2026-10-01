import { Spinner } from "@/src/components/ui/Spinner";
import type { UsernameStatus } from "./useUsernameAvailability";
import styles from "./EditProfile.module.css";

type UsernameStatusLineProps = { status: UsernameStatus; hasError: boolean };

/** Linha abaixo do @username: verificando ou disponível. O erro é o do próprio campo. */
export function UsernameStatusLine({ status, hasError }: UsernameStatusLineProps) {
  if (hasError) return null;
  if (status === "checking") {
    return (
      <p className={`${styles["edit-profile__username-status"]} ${styles["edit-profile__username-status--checking"]}`}>
        <Spinner size="xs" />
        Verificando disponibilidade...
      </p>
    );
  }
  if (status !== "available") return null;
  return (
    <p className={`${styles["edit-profile__username-status"]} ${styles["edit-profile__username-status--available"]}`}>
      Nome de usuário disponível
    </p>
  );
}
