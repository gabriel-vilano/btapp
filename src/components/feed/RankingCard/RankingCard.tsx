import { RankingBlock } from "@/src/components/feed/RankingBlock";
import type { RankingCard as RankingCardData } from "@/src/types/feed";

interface RankingCardProps {
  data: RankingCardData;
}

export function RankingCard({ data }: RankingCardProps) {
  return <RankingBlock data={data} />;
}
