import { brand } from "@/src/lib/brand";
import styles from "./Logo.module.css";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  const classNames = [styles.logo, className].filter(Boolean).join(" ");

  // translate="no": a tradução automática do navegador trocaria o "App" do nome
  return (
    <span className={classNames} translate="no">
      {brand.name}
    </span>
  );
}
