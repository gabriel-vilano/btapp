import { ButtonLink } from "@/src/components/ui/Button";
import { DeltaIndicator, type DeltaIndicatorProps } from "@/src/components/ui/DeltaIndicator";
import { rankingImpactOf, type RankingImpact as Impact } from "@/src/lib/domain/rankingImpact";
import type { RankingMatch } from "@/src/types/domain";
import { voiceOf, type MatchResultContext } from "./matchResultContext";
import styles from "./MatchResult.module.css";

type RankingImpactProps = {
  match: Extract<RankingMatch, { status: "confirmed" }>;
  context: MatchResultContext;
};

/**
 * O que a partida confirmada fez no ranking de quem jogou (docs/RESULTS.md, RG18):
 * os pontos, a posição ao vivo e o delta desde antes desta partida. Mesma
 * estrutura na vitória e na derrota: só o DeltaIndicator tem cor.
 * @example <RankingImpact match={match} context={context} />
 */
export function RankingImpact({ match, context }: RankingImpactProps) {
  const voice = voiceOf(context);
  if (voice.userSide === null) return null;
  const enrollmentId = voice.userSide === "a" ? match.side_a_enrollment_id : match.side_b_enrollment_id;
  const impact = rankingImpactOf(context.standings, match, enrollmentId);
  if (impact === null) return null;
  const delta = deltaOf(impact);
  return (
    <div className={styles.impact}>
      <p className={styles.impact__points}>{formatPoints(impact.points)} nesta partida</p>
      <p className={styles.impact__position}>
        {voice.names[voice.userSide]} {voice.isSingles ? "está" : "estão"} em {impact.position}º{" "}
        {categoryArticle(context.categoryName)} {context.categoryName}
        {/* Em linha, sem flex: o espaço separa a frase do delta também no leitor de tela */}
        {delta && <> <DeltaIndicator {...delta} /></>}
      </p>
      <ButtonLink href={context.rankingHref} variant="secondary" fullWidth>
        Ver ranking
      </ButtonLink>
    </div>
  );
}

function deltaOf({ position_change: change }: Impact): DeltaIndicatorProps | null {
  if (change === null) return null;
  if (change === 0) return { direction: "none" };
  return { direction: change > 0 ? "up" : "down", value: Math.abs(change) };
}

// O W.O. pode valer pontos negativos para quem faltou, se a regra do ranking quiser
function formatPoints(points: number): string {
  const unit = Math.abs(points) === 1 ? "pt" : "pts";
  return `${points < 0 ? "−" : "+"}${Math.abs(points)} ${unit}`;
}

// O nome da categoria começa pelo gênero (`formatCategoryLabel`): "no Masculino B", "na Mista C"
function categoryArticle(categoryName: string): string {
  return categoryName.startsWith("Mista") ? "na" : "no";
}
