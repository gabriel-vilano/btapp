import Image from "next/image";
import { formatInitials } from "@/src/lib/formatters";
import styles from "./Avatar.module.css";

export type AvatarSize = 24 | 32 | 40 | 48 | 96;
// 96 é o avatar de perfil e 24 o da aba Perfil: nenhum aparece em pilha, então o stack não os aceita.
export type AvatarStackSize = Exclude<AvatarSize, 24 | 96>;

interface AvatarProps {
  url: string | null;
  /** Nome da pessoa ou organização: vira o texto alternativo e as iniciais. */
  alt: string;
  size: AvatarSize;
}

/**
 * Foto redonda de jogador ou organização. Sem foto, mostra as iniciais do `alt`.
 * Ex.: `<Avatar url={player.avatar_url} alt={player.name} size={40} />`
 */
export function Avatar({ url, alt, size }: AvatarProps) {
  const sizeClass = `${styles.avatar} ${styles[`avatar--${size}`]}`;
  if (url) {
    return <Image src={url} alt={alt} width={size} height={size} className={sizeClass} />;
  }

  const initials = formatInitials(alt);
  if (!initials) {
    return <span className={`${sizeClass} ${styles.avatar__placeholder}`} aria-hidden />;
  }
  // role="img" faz as iniciais serem lidas como o nome, igual ao alt da foto
  return (
    <span className={`${sizeClass} ${styles.avatar__initials}`} role="img" aria-label={alt}>
      {initials}
    </span>
  );
}

interface AvatarStackProps {
  items: Array<{ id: string; url: string | null; alt: string }>;
  size: AvatarStackSize;
}

/** Dois avatares sobrepostos, para a dupla. O primeiro item fica por cima. */
export function AvatarStack({ items, size }: AvatarStackProps) {
  return (
    <span className={`${styles.stack} ${styles[`stack--${size}`]}`}>
      {items.map((item) => (
        <span key={item.id} className={styles.stack__item}>
          <Avatar url={item.url} alt={item.alt} size={size} />
        </span>
      ))}
    </span>
  );
}
