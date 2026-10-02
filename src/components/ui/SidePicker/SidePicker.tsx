"use client";

import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from "react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Icon } from "@/src/components/ui/Icon";
import { IconButton } from "@/src/components/ui/IconButton";
import { PlayerSearchDialog } from "./PlayerSearchDialog";
import {
  slotsOf,
  type PickablePlayer,
  type SideModality,
  type SideSlot,
  type SideSlots,
} from "./sidePickerModel";
import styles from "./SidePicker.module.css";

type SidePickerProps = {
  /** Simples: um adversário. Duplas: o parceiro e dois adversários. */
  modality: SideModality;
  /** Quem escolhe. Já está no lado dele e não sai (docs/RESULTS.md §6.1). */
  self: PickablePlayer;
  /** Quem pode ocupar uma vaga, sem `self`. A busca põe os amigos primeiro. */
  players: readonly PickablePlayer[];
  value: SideSlots;
  onValueChange: (slots: SideSlots) => void;
};

/**
 * Monta os dois lados de uma partida: quem escolhe já está no lado dele e
 * escolhe o parceiro (duplas) e o adversário ou os adversários, por busca,
 * com os amigos primeiro (docs/RESULTS.md §6.1, RG17).
 * @example <SidePicker modality="doubles" self={me} players={players} value={slots} onValueChange={setSlots} />
 */
export function SidePicker({ modality, self, players, value, onValueChange }: SidePickerProps) {
  const [openSlot, setOpenSlot] = useState<SideSlot | null>(null);
  const [pickedSlot, setPickedSlot] = useState<SideSlot | null>(null);
  const byId = new Map(players.map((player) => [player.id, player]));
  const slots = slotsOf(modality);
  const opponentSlots = slots.filter((slot) => slot !== "partner");
  const slotProps = (slot: SideSlot) => ({
    label: slotLabel(slot, modality),
    player: playerIn(value[slot], byId),
    onOpen: () => setOpenSlot(slot),
    onClear: () => onValueChange({ ...value, [slot]: null }),
    focusOnFill: slot === pickedSlot,
  });

  return (
    <div className={styles["side-picker"]}>
      <SideGroup title="Seu lado">
        <SelfRow self={self} />
        {slots.includes("partner") && <SlotRow {...slotProps("partner")} />}
      </SideGroup>
      <SideGroup title={modality === "singles" ? "Adversário" : "Adversários"}>
        {opponentSlots.map((slot) => (
          <SlotRow key={slot} {...slotProps(slot)} />
        ))}
      </SideGroup>
      {openSlot !== null && (
        <PlayerSearchDialog
          title={slotLabel(openSlot, modality)}
          players={players}
          excludedIds={Object.values(value).filter((id): id is string => id !== null)}
          onClose={() => setOpenSlot(null)}
          onPick={(player) => {
            onValueChange({ ...value, [openSlot]: player.id });
            setPickedSlot(openSlot);
            setOpenSlot(null);
          }}
        />
      )}
    </div>
  );
}

// Em duplas há dois adversários: o número diferencia os botões para o leitor de tela
function slotLabel(slot: SideSlot, modality: SideModality): string {
  if (slot === "partner") return "Escolher parceiro";
  if (modality === "singles") return "Escolher adversário";
  return slot === "opponent1" ? "Escolher adversário 1" : "Escolher adversário 2";
}

function playerIn(id: string | null, byId: Map<string, PickablePlayer>): PickablePlayer | null {
  return id === null ? null : (byId.get(id) ?? null);
}

function SideGroup({ title, children }: { title: string; children: ReactNode }) {
  const titleId = useId();
  return (
    <div role="group" aria-labelledby={titleId} className={styles["side-picker__group"]}>
      <p id={titleId} className={styles["side-picker__group-title"]}>
        {title}
      </p>
      <ul className={styles["side-picker__slots"]} role="list">
        {children}
      </ul>
    </div>
  );
}

function SelfRow({ self }: { self: PickablePlayer }) {
  return (
    <li className={styles["side-picker__player"]}>
      <Avatar url={self.avatarUrl} alt={self.name} size={40} />
      <PlayerText title="Você" detail={self.name} />
    </li>
  );
}

type SlotRowProps = {
  label: string;
  player: PickablePlayer | null;
  onOpen: () => void;
  onClear: () => void;
  /** A vaga acabou de ser escolhida pela busca. */
  focusOnFill: boolean;
};

// Vaga vazia é um botão de escolher; preenchida mostra quem está nela, e o X
// esvazia para escolher outro
function SlotRow({ label, player, onOpen, onClear, focusOnFill }: SlotRowProps) {
  if (player === null) {
    return (
      <li>
        <button type="button" className={styles["side-picker__add"]} onClick={onOpen}>
          <Icon icon={PlusIcon} size="sm" />
          {label}
        </button>
      </li>
    );
  }
  return <FilledSlot player={player} onClear={onClear} focusOnMount={focusOnFill} />;
}

type FilledSlotProps = { player: PickablePlayer; onClear: () => void; focusOnMount: boolean };

// O botão que abriu a busca some quando a vaga é preenchida, e o Dialog não
// tem para onde devolver o foco: ele vem para quem acabou de entrar na vaga
function FilledSlot({ player, onClear, focusOnMount }: FilledSlotProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (focusOnMount) textRef.current?.focus();
  }, [focusOnMount]);
  return (
    <li className={styles["side-picker__player"]}>
      <Avatar url={player.avatarUrl} alt={player.name} size={40} />
      <PlayerText title={player.name} detail={`@${player.username}`} textRef={textRef} />
      <IconButton icon={XIcon} label={`Remover ${player.name}`} onClick={onClear} />
    </li>
  );
}

type PlayerTextProps = { title: string; detail: string; textRef?: Ref<HTMLSpanElement> };

function PlayerText({ title, detail, textRef }: PlayerTextProps) {
  return (
    <span ref={textRef} tabIndex={textRef ? -1 : undefined} className={styles["side-picker__text"]}>
      <span className={styles["side-picker__name"]}>{title}</span>
      <span className={styles["side-picker__detail"]}>{detail}</span>
    </span>
  );
}

export type { SidePickerProps };
