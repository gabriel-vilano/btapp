import { describe, expect, it } from 'vitest';
import { mockDomain, mockEntities, mockProfileDomain, pastSeasonEntities } from '@/src/mocks/domain';
import { daysAgo, daysFromNow } from '@/src/mocks/relativeTime';
import { rankingScreen, type RankingScreenContent, type RankingScreenRequest } from '.';

// Tela de classificação (docs/RANKING.md): os casos do mapa de estados (8.4)
// sobre o cenário dos mocks. Masculino B ao vivo: André e Bruno, Eduardo e
// Felipe, Lucas e Rafael, Pedro e Thiago | Saideira (4 vagas) | Gustavo e
// Henrique, Caio e Diego.

const { players, rankingCategories, masculinoB: mb, mistaC40: mx, season, tournamentCategories } = mockEntities;
const MB = rankingCategories.masculinoB.id;
const NOW = new Date().toISOString();

function request(partial: Partial<RankingScreenRequest> = {}): RankingScreenRequest {
  return { category_id: MB, season_id: null, viewer_id: players.lucas.id, now: NOW, ...partial };
}

function tableOf(content: RankingScreenContent | undefined) {
  if (content?.kind !== 'table') throw new Error(`Esperado 'table', recebi '${content?.kind}'`);
  return content;
}

const screen = (partial?: Partial<RankingScreenRequest>) => rankingScreen(mockProfileDomain, request(partial));
const table = (partial?: Partial<RankingScreenRequest>) => tableOf(screen(partial)?.content);
const ids = (lines: { enrollment_id: string }[]) => lines.map((line) => line.enrollment_id);

describe('rankingScreen: temporada aberta, rodada ≥ 2 (8.4)', () => {
  it('cabeçalho: temporada, rodada 3 de 4, final e temporada anterior (RK4, RK15)', () => {
    const { header } = table();
    expect(header).toMatchObject({
      season_name: season.name,
      phase: 'open',
      current_round: { number: 3, total: 4 },
      final: { name: 'Saideira', qualifiers: 4 },
      all_qualify: false,
      previous_season_id: pastSeasonEntities.season.id,
    });
  });

  it('linha de corte depois da 4ª inscrição ativa (RK13)', () => {
    const { qualified, outside, divider } = table();
    expect(ids(qualified)).toEqual([mb.t3.id, mb.t5.id, mb.t1.id, mb.t2.id]);
    expect(ids(outside)).toEqual([mb.t6.id, mb.t4.id]);
    expect(divider).toEqual({ final_name: 'Saideira', qualifiers: 4, after_cutoff: false, awaiting_admin: false });
  });

  it('a própria linha, dentro da zona: destacada e sem distância da vaga (RK9, RK11)', () => {
    const { qualified, own_enrollment_id } = table();
    expect(own_enrollment_id).toBe(mb.t1.id);
    expect(qualified[2]).toMatchObject({ is_own: true, position: 3, cutoff_distance: null });
    expect(qualified.filter((line) => line.is_own)).toHaveLength(1);
  });

  it('delta contra a foto da rodada 2 e jogos sem W.O. (RK8, RK12)', () => {
    const [andre, eduardo, lucas] = table().qualified;
    expect([andre.delta, eduardo.delta, lucas.delta]).toEqual([null, 1, -1]);
    expect(lucas).toMatchObject({ points: 364, played: 4, wins: 3 });
  });

  it('fora da zona: a própria linha mostra quanto falta para a última vaga (RK11)', () => {
    const { outside } = table({ viewer_id: players.caio.id });
    expect(outside[1]).toMatchObject({ is_own: true, cutoff_distance: { points: 202 - 46, position: 4 } });
  });

  it('não inscrito na categoria: nenhuma linha destacada (4.1)', () => {
    const content = table({ category_id: rankingCategories.mistaC40.id });
    expect(content.own_enrollment_id).toBeNull();
    expect([...content.qualified, ...content.outside].some((line) => line.is_own)).toBe(false);
  });
});

describe('rankingScreen: situações da linha e da linha de corte (4.4, 4.5)', () => {
  it('encerrada continua na tabela, apagada; com menos ativas que vagas, sem divisor', () => {
    const content = table({ category_id: rankingCategories.mistaC40.id });
    expect(content.header.all_qualify).toBe(true);
    expect(content.divider).toBeNull();
    expect(content.outside).toEqual([]);
    expect(content.qualified.find((line) => line.enrollment_id === mx.m4.id)?.status).toBe('closed');
  });

  it('a Júlia vê a inscrição ativa como a própria; a encerrada fica como as outras', () => {
    const content = table({ category_id: rankingCategories.mistaC40.id, viewer_id: players.julia.id });
    expect(content.own_enrollment_id).toBe(mx.m5.id);
  });
});

describe('rankingScreen: tempo da temporada (8.4)', () => {
  it('sem jogo confirmado: inscrições em ordem alfabética, sem posição (RK20)', () => {
    const content = screen({ now: daysAgo(58) })?.content;
    if (content?.kind !== 'unranked') throw new Error(`Esperado 'unranked', recebi '${content?.kind}'`);
    expect(content.entries.map((entry) => entry.players[0].name)).toEqual([
      'André Lima', 'Caio Ferreira', 'Eduardo Rocha', 'Gustavo Pereira', 'Lucas Silva', 'Pedro Henrique',
    ]);
    expect(content.entries.find((entry) => entry.is_own)?.enrollment_id).toBe(mb.t1.id);
  });

  it('1ª rodada: nenhuma linha com delta (RK12)', () => {
    const lines = [...table({ now: daysAgo(41) }).qualified, ...table({ now: daysAgo(41) }).outside];
    expect(lines.every((line) => line.delta === null)).toBe(true);
  });

  it('depois da data de corte: "classificados", sem distância da vaga', () => {
    const content = table({ now: daysFromNow(26), viewer_id: players.caio.id });
    expect(content.header.phase).toBe('after_cutoff');
    expect(content.divider?.after_cutoff).toBe(true);
    expect(content.outside.every((line) => line.cutoff_distance === null)).toBe(true);
  });

  it('encerrada: fica na tela até a próxima começar, sem link para a anterior (RK15)', () => {
    const { header, own_enrollment_id } = table({ now: daysFromNow(41) });
    expect([header.phase, header.current_round, header.previous_season_id]).toEqual(['ended', null, null]);
    expect(own_enrollment_id).toBe(mb.t1.id);
  });

  it('temporada antiga por ?temporada=, com a linha da dupla daquela temporada (RK21)', () => {
    const model = screen({ season_id: pastSeasonEntities.season.id });
    const content = tableOf(model?.content);
    expect(model?.season_id).toBe(pastSeasonEntities.season.id);
    expect(content.header.phase).toBe('ended');
    expect(content.own_enrollment_id).toBe(pastSeasonEntities.masculinoB.p1.id);
  });

  it('nenhuma temporada começou: vazio da competição (RK19)', () => {
    const model = rankingScreen(mockDomain, request({ now: daysAgo(61) }));
    expect(model?.content).toEqual({ kind: 'no_season' });
    expect(model?.season_id).toBeNull();
  });
});

describe('rankingScreen: rota inexistente', () => {
  it('temporada de outro ranking ou inexistente: null (404)', () => {
    expect(screen({ season_id: 'season-outro-ranking' })).toBeNull();
  });

  it('categoria de torneio: null, torneio não tem classificação (R31)', () => {
    const [tournamentCategory] = Object.values(tournamentCategories);
    expect(screen({ category_id: tournamentCategory.id })).toBeNull();
  });

  it('categoria que não existe: null', () => {
    expect(screen({ category_id: 'cat-nao-existe' })).toBeNull();
  });
});
