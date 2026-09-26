import type { ReactNode } from "react";
import { CardShell } from "@/src/components/feed/CardShell";
import { CardHeader } from "@/src/components/feed/CardHeader";
import { CardFooter } from "@/src/components/feed/CardFooter";
import { ResultCard } from "@/src/components/feed/ResultCard";
import { MatchCard } from "@/src/components/feed/MatchCard";
import { EnrollmentCard } from "@/src/components/feed/EnrollmentCard";
import { FriendshipCard } from "@/src/components/feed/FriendshipCard";
import { RankingCard } from "@/src/components/feed/RankingCard";
import type { FeedCard, CardHeader as CardHeaderData } from "@/src/types/feed";

interface ActivityCardProps {
  data: FeedCard;
}

export function ActivityCard({ data }: ActivityCardProps) {
  const { headerData, showHandshake } = getHeaderProps(data);

  return (
    <CardShell
      header={
        <CardHeader
          data={headerData}
          createdAt={data.created_at}
          showHandshake={showHandshake}
        />
      }
      body={getBody(data)}
      footer={<CardFooter />}
    />
  );
}

function getHeaderProps(card: FeedCard): {
  headerData: CardHeaderData;
  showHandshake: boolean;
} {
  if (card.card_type === "result" || card.card_type === "match") {
    return { headerData: card.header, showHandshake: false };
  }

  if (card.card_type === "enrollment") {
    const text =
      card.enrollment_format === "singles"
        ? `${card.player.name} inscreveu-se`
        : `${card.players[0].name} e ${card.players[1].name} inscreveram-se`;
    const player =
      card.enrollment_format === "singles" ? card.player : card.players[0];
    return {
      headerData: { header_type: "player", player, action_text: text },
      showHandshake: false,
    };
  }

  if (card.card_type === "friendship") {
    return {
      headerData: {
        header_type: "player",
        player: card.player_a,
        action_text: `${card.player_a.name} e ${card.player_b.name} agora são amigos`,
      },
      showHandshake: true,
    };
  }

  const action = card.movement === "down" ? "caiu no ranking" : "subiu no ranking";
  return {
    headerData: {
      header_type: "player",
      player: card.player,
      action_text: `${card.player.name} ${action}`,
    },
    showHandshake: false,
  };
}

function getBody(card: FeedCard): ReactNode {
  switch (card.card_type) {
    case "result":
      return <ResultCard data={card} />;
    case "match":
      return <MatchCard data={card} />;
    case "enrollment":
      return <EnrollmentCard data={card} />;
    case "friendship":
      return <FriendshipCard data={card} />;
    case "ranking":
      return <RankingCard data={card} />;
  }
}
