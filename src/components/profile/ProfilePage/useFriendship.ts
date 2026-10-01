"use client";

import { useState } from "react";
import {
  applyFriendshipAction,
  friendsCountDelta,
  type FriendshipAction,
} from "@/src/lib/domain/friendship";
import type { ProfileRelation } from "@/src/lib/domain/profile-page";

interface FriendshipState {
  relation: ProfileRelation;
  friendsCount: number;
  /** Frase para o leitor de tela depois da ação ("Pedido enviado para Lucas."). */
  announcement: string;
  act: (action: FriendshipAction) => void;
}

// O botão só troca de rótulo: sem a frase, o leitor de tela não diz que a ação aconteceu
const ANNOUNCEMENTS: Record<FriendshipAction, (firstName: string) => string> = {
  request: (name) => `Pedido enviado para ${name}.`,
  cancel: (name) => `Pedido para ${name} cancelado.`,
  accept: () => "Agora vocês são amigos.",
  decline: (name) => `Pedido de ${name} recusado.`,
  unfriend: (name) => `Amizade com ${name} desfeita.`,
};

/**
 * Vínculo de amizade de quem vê com o dono do perfil e o número de amigos dele (PF5, PF7).
 * Com os mocks, a ação muda só a tela; com o Supabase, ela chama o servidor antes.
 * @example const { relation, friendsCount, act } = useFriendship(data.relation, data.friends_count, "Lucas");
 */
export function useFriendship(initial: ProfileRelation, initialCount: number, firstName: string): FriendshipState {
  const [relation, setRelation] = useState(initial);
  const [announcement, setAnnouncement] = useState("");
  const act = (action: FriendshipAction) => {
    if (relation === "self") throw new Error(`Amizade: ação '${action}' no próprio perfil`);
    setRelation(applyFriendshipAction(relation, action));
    setAnnouncement(ANNOUNCEMENTS[action](firstName));
  };
  const friendsCount =
    initial === "self" || relation === "self" ? initialCount : initialCount + friendsCountDelta(initial, relation);
  return { relation, friendsCount, announcement, act };
}
