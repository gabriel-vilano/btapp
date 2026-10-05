"use client";

import { DotsThreeIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Dialog } from "@/src/components/ui/Dialog";
import { IconButton } from "@/src/components/ui/IconButton";
import { List, ListItem } from "@/src/components/ui/ListItem";
import { brand } from "@/src/lib/brand";
import { playerPath } from "@/src/lib/domain/profile-page";
import styles from "./ProfilePage.module.css";

interface ProfileMenuProps {
  username: string;
  name: string;
}

type ShareState = "idle" | "copied" | "failed";

// Sem o sheet nativo (desktop, alguns navegadores), o link vai para a área de transferência
async function shareProfile(url: string, name: string): Promise<ShareState> {
  if (typeof navigator.share === "function") {
    await navigator.share({ title: `${name} no ${brand.nameNoBreak}`, url }).catch(() => undefined);
    return "idle";
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

const SHARE_FEEDBACK: Record<Exclude<ShareState, "idle">, string> = {
  copied: "Link copiado.",
  failed: "Não foi possível copiar o link.",
};

/**
 * Menu "⋯" do perfil de outro jogador (PROFILE.md, PF8): por enquanto, só "Compartilhar perfil",
 * que abre o sheet nativo com o link público `/jogadores/[username]`.
 * @example <ProfileMenu username="lucassilva" name="Lucas Silva" />
 */
export function ProfileMenu({ username, name }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [shareState, setShareState] = useState<ShareState>("idle");
  const close = () => {
    setOpen(false);
    setShareState("idle");
  };
  const share = async () => {
    const state = await shareProfile(`${window.location.origin}${playerPath(username)}`, name);
    if (state === "idle") close();
    else setShareState(state);
  };
  return (
    <>
      <IconButton icon={DotsThreeIcon} label="Mais opções" onClick={() => setOpen(true)} />
      <Dialog open={open} onClose={close} title="Opções">
        <List>
          <ListItem onClick={share} title="Compartilhar perfil" />
        </List>
        {shareState !== "idle" && (
          <p className={styles["profile__share-feedback"]} role="status">
            {SHARE_FEEDBACK[shareState]}
          </p>
        )}
      </Dialog>
    </>
  );
}

export type { ProfileMenuProps };
