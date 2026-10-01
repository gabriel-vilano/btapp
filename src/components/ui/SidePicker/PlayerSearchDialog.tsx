"use client";

import { useState } from "react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { Dialog } from "@/src/components/ui/Dialog";
import { List, ListItem } from "@/src/components/ui/ListItem";
import { SearchField } from "@/src/components/ui/SearchField";
import { searchPickablePlayers, type PickablePlayer } from "./sidePickerModel";
import styles from "./SidePicker.module.css";

type PlayerSearchDialogProps = {
  title: string;
  players: readonly PickablePlayer[];
  excludedIds: string[];
  onClose: () => void;
  onPick: (player: PickablePlayer) => void;
};

/** Folha de busca de uma vaga. Montada só enquanto aberta: cada vaga começa a busca em branco. */
export function PlayerSearchDialog({ title, players, excludedIds, onClose, onPick }: PlayerSearchDialogProps) {
  const [term, setTerm] = useState("");
  const found = searchPickablePlayers(players, term, excludedIds);
  return (
    <Dialog open onClose={onClose} title={title}>
      <div className={styles["side-picker__search"]}>
        <SearchField value={term} onValueChange={setTerm} placeholder="Nome ou @username" label="Buscar jogador" />
        <SearchResults term={term} found={found} onPick={onPick} />
      </div>
    </Dialog>
  );
}

type SearchResultsProps = { term: string; found: PickablePlayer[]; onPick: (player: PickablePlayer) => void };

function SearchResults({ term, found, onPick }: SearchResultsProps) {
  const isSuggestion = term.trim().replace(/^@/, "") === "";
  if (found.length === 0) {
    const hint = isSuggestion ? "Busque pelo nome ou @username." : `Nenhum jogador encontrado para "${term.trim()}".`;
    return (
      <p className={styles["side-picker__hint"]} role="status">
        {hint}
      </p>
    );
  }
  return (
    <>
      {isSuggestion && <p className={styles["side-picker__group-title"]}>Amigos</p>}
      <List aria-label={isSuggestion ? "Amigos" : "Jogadores encontrados"}>
        {found.map((player) => (
          <ListItem
            key={player.id}
            onClick={() => onPick(player)}
            leading={<Avatar url={player.avatarUrl} alt={player.name} size={40} />}
            title={player.name}
            supportingText={`@${player.username}`}
            trailing={player.isFriend && !isSuggestion ? <Badge tone="neutral">Amigo</Badge> : undefined}
          />
        ))}
      </List>
    </>
  );
}
