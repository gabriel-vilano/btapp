import { MatchVsBlock } from "@/src/components/feed/MatchVsBlock";
import { CheerBar } from "@/src/components/feed/CheerBar";
import { MetaInfo } from "@/src/components/feed/MetaInfo";
import { H2HButton } from "@/src/components/ui/H2HButton";
import { matchCardH2HHref } from "@/src/components/feed/h2hLink";
import type { MatchCard as MatchCardData, MatchSide } from "@/src/types/feed";

interface MatchCardProps {
  data: MatchCardData;
}

export function MatchCard({ data }: MatchCardProps) {
  const { side_a, side_b, date, location, cheer_a, cheer_b, user_cheer, h2h_count } = data;
  const h2hHref = matchCardH2HHref(data);

  return (
    <>
      <MatchVsBlock sideA={side_a} sideB={side_b} />

      <CheerBar
        cheerA={cheer_a}
        cheerB={cheer_b}
        userCheer={user_cheer}
        ariaLabelA={`Torcer pelo lado ${getSideLabel(side_a)}`}
        ariaLabelB={`Torcer pelo lado ${getSideLabel(side_b)}`}
      />

      <MetaInfo date={date} location={location} />

      {h2hHref !== null && <H2HButton count={h2h_count} href={h2hHref} />}
    </>
  );
}

function getSideLabel(side: MatchSide): string {
  if (side.format === "singles") return side.player.name.split(" ")[0];
  return side.players.map((p) => p.name.split(" ")[0]).join(" e ");
}
