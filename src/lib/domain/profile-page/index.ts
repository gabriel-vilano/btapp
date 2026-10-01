// Página do perfil (docs/PROFILE.md): as derivações de `profile/` no formato
// da tela, com nomes e rotas.

export type * from './types';
export { buildProfilePage, type ProfilePageRequest } from './buildProfilePage';
export { buildFriendsList, type FriendsListRequest } from './friendsList';
export { categoryName, firstName } from './names';
export * from './routes';
