"use client";

import { CaretRightIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { ButtonLink } from "@/src/components/ui/Button";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { Icon } from "@/src/components/ui/Icon";
import { TextLink } from "@/src/components/ui/TextLink";
import type { RankingPlayer, RankingScreenModel, SeasonHeader } from "@/src/lib/domain/ranking-screen";
import { categoryLabel, seasonContextLines } from "./rankingScreenText";
import { PairSheet } from "./PairSheet";
import { RankingTableView } from "./RankingTableView";
import { UnrankedList } from "./UnrankedList";
import styles from "./RankingScreen.module.css";

/** Destinos da tela, resolvidos pela rota (os slugs são dela). */
export interface RankingScreenLinks {
  back: string;
  /** Regras da competição, na seção de pontuação (RK5). */
  rules: string;
  /** Classificação da temporada anterior (RK15); null quando não há. */
  previousSeason: string | null;
}

interface RankingScreenProps {
  model: RankingScreenModel;
  viewerId: string;
  /** Momento da carga, ISO 8601: o texto relativo ("fecha em 5 dias") sai igual no servidor e no cliente. */
  now: string;
  links: RankingScreenLinks;
  /** Abre rolada até a própria linha: a temporada antiga vinda do perfil (RK21). */
  scrollToOwnOnOpen?: boolean;
}

/**
 * Classificação de uma categoria numa temporada (docs/RANKING.md): cabeçalho da
 * temporada, tabela com a linha de corte e a própria linha fixada, e os vazios.
 * Ex.: `<RankingScreen model={model} viewerId={lucas.id} now={now} links={links} />`
 */
export function RankingScreen({ model, viewerId, now, links, scrollToOwnOnOpen = false }: RankingScreenProps) {
  const [pair, setPair] = useState<RankingPlayer[] | null>(null);
  const { content } = model;
  return (
    <>
      <AppHeader title="Classificação" backHref={links.back} />
      <main className={styles["ranking-screen"]}>
        <header className={styles["ranking-screen__header"]}>
          {/* Vira o seletor de categoria (RK6) na issue dele */}
          <h2 className={styles["ranking-screen__title"]}>
            {model.competition_name} · {categoryLabel(model.category)}
          </h2>
          {content.kind !== "no_season" && <SeasonContext header={content.header} model={model} now={now} links={links} />}
        </header>
        {content.kind === "no_season" && <NoSeason competitionName={model.competition_name} rulesHref={links.rules} />}
        {content.kind === "unranked" && <UnrankedList entries={content.entries} viewerId={viewerId} onOpenPair={setPair} />}
        {content.kind === "table" && (
          <RankingTableView content={content} viewerId={viewerId} scrollToOwnOnOpen={scrollToOwnOnOpen} onOpenPair={setPair} />
        )}
      </main>
      <PairSheet players={pair} viewerId={viewerId} onClose={() => setPair(null)} />
    </>
  );
}

interface SeasonContextProps {
  header: SeasonHeader;
  model: RankingScreenModel;
  now: string;
  links: RankingScreenLinks;
}

function SeasonContext({ header, model, now, links }: SeasonContextProps) {
  return (
    <>
      {seasonContextLines(header, model.category, now).map((line) => (
        <p key={line} className={styles["ranking-screen__context"]}>
          {line}
        </p>
      ))}
      <div className={styles["ranking-screen__links"]}>
        <TextLink href={links.rules} block>
          <span className={styles["ranking-screen__link"]}>
            Como funciona a pontuação
            <Icon icon={CaretRightIcon} size="sm" />
          </span>
        </TextLink>
        {links.previousSeason && (
          <TextLink href={links.previousSeason} block>
            Temporada anterior
          </TextLink>
        )}
      </div>
    </>
  );
}

function NoSeason({ competitionName, rulesHref }: { competitionName: string; rulesHref: string }) {
  return (
    <EmptyState
      title="Nenhuma temporada em andamento"
      description={`A próxima temporada do ${competitionName} ainda não começou.`}
      action={
        <ButtonLink href={rulesHref} variant="secondary">
          Ver regras do ranking
        </ButtonLink>
      }
    />
  );
}

export type { RankingScreenProps };
