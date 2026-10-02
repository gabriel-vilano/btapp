import { notFound } from "next/navigation";
import { connection } from "next/server";
import { RankingScreen, type RankingScreenLinks } from "@/src/components/ranking/RankingScreen";
import { DetailHeader } from "@/src/components/shell/DetailHeader";
import {
  categorySwitcher,
  rankingScreen,
  type CategorySwitcher,
  type RankingScreenModel,
} from "@/src/lib/domain/ranking-screen";
import { mockProfileDomain } from "@/src/mocks/domain";
import { MOCK_VIEWER_ID, mockRankingRoutes } from "@/src/mocks/rankingRoutes";

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function screenLinks(model: RankingScreenModel): RankingScreenLinks {
  const content = model.content;
  const previous = content.kind === "no_season" ? null : content.header.previous_season_id;
  return {
    rules: mockRankingRoutes.rulesHref(model.competition_id),
    previousSeason: previous && mockRankingRoutes.categoryHref(model.category.id, previous),
  };
}

// O item da folha leva à temporada padrão da categoria (RK6): sem `?temporada=`
function switcherFor(model: RankingScreenModel, requestedSeason: string | null, now: string): CategorySwitcher {
  const request = {
    competition_id: model.competition_id,
    category_id: model.category.id,
    season_id: model.season_id,
    is_default_season: requestedSeason === null,
    viewer_id: MOCK_VIEWER_ID,
    now,
  };
  return categorySwitcher(mockProfileDomain, request, (categoryId) => mockRankingRoutes.categoryHref(categoryId));
}

interface RankingPageProps {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Dados mockados até a integração com o Supabase: o `mockProfileDomain` tem a
// temporada atual e a encerrada do mesmo ranking (RK15, RK21)
export default async function RankingPage(props: RankingPageProps) {
  // Renderiza a cada acesso: a tabela é ao vivo (RK16), e os mocks têm datas
  // relativas que congelariam no build
  await connection();
  const { categoria } = await props.params;
  const temporada = firstValue((await props.searchParams).temporada);
  const categoryId = mockRankingRoutes.categoryId(categoria);
  const seasonId = temporada === undefined ? null : mockRankingRoutes.seasonId(temporada);
  if (categoryId === undefined || seasonId === undefined) notFound();

  const now = new Date().toISOString();
  const model = rankingScreen(mockProfileDomain, { category_id: categoryId, season_id: seasonId, viewer_id: MOCK_VIEWER_ID, now });
  if (model === null) notFound();

  return (
    <>
      <DetailHeader title="Classificação" />
      <RankingScreen
        model={model}
        viewerId={MOCK_VIEWER_ID}
        now={now}
        links={screenLinks(model)}
        categories={switcherFor(model, seasonId, now)}
        scrollToOwnOnOpen={seasonId !== null}
      />
    </>
  );
}
