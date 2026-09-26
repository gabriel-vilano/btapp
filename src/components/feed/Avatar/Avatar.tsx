import Image from "next/image";
import styles from "./Avatar.module.css";

export type AvatarSize = 32 | 40 | 48;

interface AvatarProps {
  url: string | null;
  alt: string;
  size: AvatarSize;
}

export function Avatar({ url, alt, size }: AvatarProps) {
  if (url) {
    return (
      <Image
        src={url}
        alt={alt}
        width={size}
        height={size}
        className={`${styles.avatar} ${styles[`avatar--${size}`]}`}
      />
    );
  }
  return (
    <span
      className={`${styles.avatar} ${styles[`avatar--${size}`]} ${styles.avatar__placeholder}`}
      aria-hidden
    />
  );
}

interface AvatarStackProps {
  items: Array<{ id: string; url: string | null; alt: string }>;
  size: AvatarSize;
}

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
