import { describe, expect, it } from 'vitest';
import { mockDomain } from './domain';
import { MOCK_VIEWER_ID } from './matchScreen';
import { reportResultDataOf } from './reportResult';

describe('dados do fluxo de lançar nos mocks', () => {
  it('resolve a partida do ranking com a rodada, o prazo e a pontuação', () => {
    const data = reportResultDataOf('match-arena-mangaba-mb-r3-1');
    expect(data?.sideNames).toEqual({ a: 'Lucas e Rafael', b: 'Caio e Diego' });
    expect(data?.viewerId).toBe(MOCK_VIEWER_ID);
    expect(data?.isSingles).toBe(false);
    expect(data?.ranking?.roundNumber).toBe(3);
    expect(data?.ranking?.responseDeadlineHours).toBeGreaterThan(0);
  });

  it('resolve a partida do torneio sem contexto de ranking e com os admins dele', () => {
    const data = reportResultDataOf('match-copa-tucum-mb-final');
    expect(data?.match.kind).toBe('tournament');
    expect(data?.ranking).toBeNull();
    expect(data?.adminIds).toEqual(['player-fabio']);
  });

  it('marca a categoria de simples', () => {
    expect(reportResultDataOf('match-copa-tucum-mc-semi-2')?.isSingles).toBe(true);
  });

  it('amistoso e partida inexistente não têm este fluxo', () => {
    const friendly = mockDomain.matches.find((match) => match.kind === 'friendly');
    expect(friendly && reportResultDataOf(friendly.id)).toBeNull();
    expect(reportResultDataOf('match-inexistente')).toBeNull();
  });
});
