import { STORY_AVATAR_URL } from "@/src/components/ui/Avatar/storyFixtures";
import type { RankingRowPlayer } from "./rankingRowText";

// Jogadores fictícios das stories do ranking. Metade sem foto, para mostrar as iniciais.
function player(id: string, firstName: string, lastName: string, withPhoto: boolean): RankingRowPlayer {
  return { id, firstName, lastName, avatarUrl: withPhoto ? STORY_AVATAR_URL : null };
}

export const VIEWER: RankingRowPlayer = { ...player("viewer", "Gabriel", "Vilano", true), isViewer: true };

export const STORY_PLAYERS = {
  lucas: player("lucas", "Lucas", "Silva", true),
  rafael: player("rafael", "Rafael", "Costa", false),
  ana: player("ana", "Ana", "Souza", true),
  bia: player("bia", "Bia", "Lima", false),
  caio: player("caio", "Caio", "Reis", false),
  davi: player("davi", "Davi", "Melo", true),
  pedro: player("pedro", "Pedro", "Alves", false),
  long: player("long", "Maria Eduarda", "de Vasconcelos Albuquerque", false),
  longPartner: player("longPartner", "Guilherme Henrique", "Nascimento Bittencourt", true),
} as const;
