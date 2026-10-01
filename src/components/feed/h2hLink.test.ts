import { describe, expect, it } from 'vitest';
import { mockFeedCards } from '@/src/mocks/feed';
import type { FeedCard, MatchCard, ResultCard } from '@/src/types/feed';
import { matchCardH2HHref, resultCardH2HHref } from './h2hLink';

// Botão H2H dos cards (docs/HEAD_TO_HEAD.md, HH16, HH17)

function cardOf<T extends FeedCard>(id: string): T {
  const card = mockFeedCards.find((candidate) => candidate.id === id);
  if (card === undefined) throw new Error(`Card '${id}' não existe em mockFeedCards`);
  return card as T;
}

const singlesResult = cardOf<ResultCard>('event-result-2sets');
const doublesResult = cardOf<ResultCard>('event-result-3sets-stb');

describe('H2H do card de resultado (HH17)', () => {
  it('1 confronto, o do próprio card: sem botão', () => {
    expect(resultCardH2HHref({ ...singlesResult, h2h_count: 1 })).toBeNull();
  });

  it('2 confrontos: botão para a página de jogadores, no card de simples', () => {
    expect(resultCardH2HHref({ ...singlesResult, h2h_count: 2 })).toBe('/h2h/lucassilva/pedrohenrique');
  });

  it('no card de duplas, a página de duplas', () => {
    expect(resultCardH2HHref({ ...doublesResult, h2h_count: 3 })).toBe(
      '/h2h/lucassilva+rafaelcosta/pedrohenrique+thiagomendes',
    );
  });

  it('W.O.: sem botão, seja qual for o total', () => {
    const wo = cardOf<ResultCard>('event-result-wo');
    expect(wo.score.type).toBe('wo');
    expect(resultCardH2HHref({ ...wo, h2h_count: 5 })).toBeNull();
  });
});

describe('H2H do card de confronto (HH16)', () => {
  const doublesMatch = cardOf<MatchCard>('event-match-doubles');

  it('1 confronto jogado basta: a partida do card ainda não foi jogada', () => {
    expect(matchCardH2HHref({ ...doublesMatch, h2h_count: 1 })).toBe(
      '/h2h/lucassilva+rafaelcosta/pedrohenrique+thiagomendes',
    );
  });

  it('sem confronto jogado: sem botão', () => {
    expect(matchCardH2HHref({ ...doublesMatch, h2h_count: 0 })).toBeNull();
  });
});
