import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { ListItem } from "@/src/components/ui/ListItem";
import type { CompetitionListItemView } from "@/src/lib/domain/explore";
import styles from "./CompetitionListItem.module.css";

type CompetitionListItemProps = Omit<CompetitionListItemView, "id">;

/**
 * Competição na vitrine, na busca e na página da organização (docs/EXPLORE.md, EX10):
 * avatar da organização, nome, "tipo · organização · cidade", a situação e o selo
 * "Você participa". Renderiza um `<li>`: use dentro de `<List>`.
 * @example <CompetitionListItem {...showcase.competitions[0]} />
 */
export function CompetitionListItem({
  name,
  typeLabel,
  organizationName,
  organizationAvatarUrl,
  city,
  situation,
  participating,
  href,
}: CompetitionListItemProps) {
  return (
    <ListItem
      href={href}
      leading={<Avatar url={organizationAvatarUrl} alt={organizationName} size={40} />}
      title={name}
      supportingText={
        <>
          <span className={styles["competition-list-item__line"]}>
            {typeLabel} · {organizationName} · {city}
          </span>
          <span className={styles["competition-list-item__line"]}>{situation}</span>
        </>
      }
      trailing={participating ? <Badge tone="neutral">Você participa</Badge> : undefined}
    />
  );
}

export type { CompetitionListItemProps };
