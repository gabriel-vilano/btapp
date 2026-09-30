import { describe, expect, it } from 'vitest';
import type { Season } from '@/src/types/domain';
import { mockDomain, mockEntities } from '@/src/mocks/domain';
import { daysFromNow } from '@/src/mocks/relativeTime';
import type { AgendaDomain } from './agendaDomain';
import { agendaEmptyReason } from './emptyReason';
import { hasOpenEntries, playerAgenda, yourTurnCount } from './playerAgenda';

// A agenda montada sobre o cenário dos mocks (rodada 3 do Ranking Arena RM,
// final da Copa Sunset hoje e amistosos). Cada jogador vê as partidas do
// próprio lado.

const { players } = mockEntities;
const NOW = new Date().toISOString();
const matchIds = (entries: { match_id: string }[]) => entries.map((entry) => entry.match_id);

function agendaOf(playerId: string, domain: AgendaDomain = mockDomain, now = NOW) {
  return playerAgenda(domain, { playerId, now });
}

describe('playerAgenda', () => {
  it('distribui as partidas do Lucas pelas 4 seções, cada uma numa só (N13)', () => {
    const agenda = agendaOf(players.lucas.id);
    expect(matchIds(agenda.your_turn)).toEqual(['match-arena-rm-mb-r3-1']);
    expect(matchIds(agenda.upcoming)).toEqual(['match-copa-sunset-mb-final']);
    expect(matchIds(agenda.waiting)).toEqual(['match-arena-rm-mb-r3-4']);
    const all = [...agenda.your_turn, ...agenda.upcoming, ...agenda.waiting, ...agenda.history].map((e) => e.match_id);
    expect(new Set(all).size).toBe(all.length);
  });

  it('não mostra partida de que o jogador não participa', () => {
    const agenda = agendaOf(players.lucas.id);
    expect(matchIds(agenda.history)).not.toContain('match-copa-sunset-mb-semi-2');
  });

  it('"Sua vez" vem pelo prazo mais próximo, e o amistoso sem prazo por último (5.1)', () => {
    const agenda = agendaOf(players.pedro.id);
    expect(agenda.your_turn.map((entry) => entry.situation.kind)).toEqual(['confirm_result', 'confirm_friendly']);
    expect(yourTurnCount(agenda)).toBe(2);
  });

  it('"Aguardando" deixa quem não tem prazo por último', () => {
    const agenda = agendaOf(players.pedro.id);
    expect(agenda.waiting.map((entry) => entry.situation.kind)).toEqual(['with_admin']);
  });

  it('jogo marcado que passou com remarcação do próprio lado pendente: lançar resultado vence (N13)', () => {
    const gustavo = agendaOf(players.gustavo.id);
    const andre = agendaOf(players.andre.id);
    expect(gustavo.your_turn.map((entry) => entry.situation.kind)).toContain('report_result');
    expect(andre.your_turn.find((entry) => entry.match_id === 'match-arena-rm-mb-r3-3')?.situation.kind).toBe(
      'answer_proposal',
    );
  });

  it('histórico: mais recente primeiro', () => {
    const history = agendaOf(players.lucas.id).history;
    const times = history.map((entry) => Date.parse(entry.played_at ?? ''));
    expect(times).toEqual([...times].sort((x, y) => y - x));
    expect(history.length).toBeGreaterThan(0);
  });
});

describe('agendaEmptyReason', () => {
  it('agenda com alguma coisa aberta não é vazia', () => {
    const agenda = agendaOf(players.lucas.id);
    expect(hasOpenEntries(agenda)).toBe(true);
    expect(agendaEmptyReason(mockDomain, agenda, { playerId: players.lucas.id, now: NOW })).toBeNull();
  });

  it('sem inscrição e sem histórico: jogador novo', () => {
    const agenda = agendaOf(players.marina.id);
    expect(agendaEmptyReason(mockDomain, agenda, { playerId: players.marina.id, now: NOW })).toEqual({
      kind: 'new_player',
    });
  });

  it('inscrito sem confronto aberto: entre rodadas, com o ranking', () => {
    const viewer = { playerId: players.vinicius.id, now: NOW };
    const agenda = playerAgenda(mockDomain, viewer);
    expect(agendaEmptyReason(mockDomain, agenda, viewer)).toEqual({
      kind: 'between_rounds',
      competition_id: mockEntities.ranking.id,
    });
  });

  // Depois do fim da temporada, só com as partidas confirmadas: nada aberto.
  const afterSeason = daysFromNow(45);
  const endedDomain: AgendaDomain = {
    ...mockDomain,
    matches: mockDomain.matches.filter((match) => match.status === 'confirmed'),
  };

  it('temporada encerrada, sem a próxima: mostra a posição final da dupla', () => {
    const viewer = { playerId: players.lucas.id, now: afterSeason };
    const reason = agendaEmptyReason(endedDomain, playerAgenda(endedDomain, viewer), viewer);
    expect(reason?.kind).toBe('season_ended');
    if (reason?.kind !== 'season_ended') return;
    expect(reason.season.season_id).toBe(mockEntities.season.id);
    expect(reason.season.final_position).toBeGreaterThan(0);
  });

  it('o ranking já abriu outra temporada: sem inscrição, com histórico', () => {
    const next: Season = {
      ...mockEntities.season,
      id: 'season-next',
      starts_on: daysFromNow(42),
      ends_on: daysFromNow(200),
    };
    const domain: AgendaDomain = { ...endedDomain, seasons: [...endedDomain.seasons, next] };
    const viewer = { playerId: players.lucas.id, now: afterSeason };
    expect(agendaEmptyReason(domain, playerAgenda(domain, viewer), viewer)).toEqual({ kind: 'no_enrollment' });
  });
});
