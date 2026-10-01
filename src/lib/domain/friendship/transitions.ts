// Ações de amizade (R24, PROFILE.md PF7). Regra única para o perfil e para o
// "+ Adicionar" do card de amizade do feed: os dois lugares mudam o mesmo
// vínculo, e a mesma ação nunca pode dar resultados diferentes.

/** O vínculo de quem vê com outro jogador. */
export type FriendshipStatus = 'none' | 'request_sent' | 'request_received' | 'friends';

/** O que quem vê pode fazer com o vínculo. */
export type FriendshipAction = 'request' | 'cancel' | 'accept' | 'decline' | 'unfriend';

// De onde cada ação sai e para onde leva. Cada status tem as próprias ações:
// "Pedido enviado" só cancela; "Aceitar" e "Recusar" só existem no pedido recebido
const TRANSITIONS: Record<FriendshipAction, { from: FriendshipStatus; to: FriendshipStatus }> = {
  request: { from: 'none', to: 'request_sent' },
  cancel: { from: 'request_sent', to: 'none' },
  accept: { from: 'request_received', to: 'friends' },
  decline: { from: 'request_received', to: 'none' },
  unfriend: { from: 'friends', to: 'none' },
};

/**
 * O vínculo depois da ação. Ação que não cabe no vínculo atual é erro de quem chamou.
 * Ex.: `applyFriendshipAction('none', 'request')` → "request_sent".
 */
export function applyFriendshipAction(status: FriendshipStatus, action: FriendshipAction): FriendshipStatus {
  const { from, to } = TRANSITIONS[action];
  if (status !== from) {
    throw new Error(`Amizade: a ação '${action}' vale para o vínculo '${from}', recebi '${status}'`);
  }
  return to;
}

/**
 * Quanto o número de amigos do outro jogador muda entre dois vínculos: +1 ao virar
 * amigos, -1 ao desfazer. Ex.: `friendsCountDelta('request_received', 'friends')` → 1.
 */
export function friendsCountDelta(before: FriendshipStatus, after: FriendshipStatus): number {
  return Number(after === 'friends') - Number(before === 'friends');
}
