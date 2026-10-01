import { describe, expect, it } from 'vitest';
import { mockH2HDomain, mockEntities } from '@/src/mocks/domain';
import { h2hPath, parseSideSegment, resolveH2HRoute } from './route';

// Rota do H2H (docs/HEAD_TO_HEAD.md, HH5) e o "H2H não encontrado" (§6.1).

const { units, players } = mockEntities;

describe('h2hPath', () => {
  it('põe a dupla em ordem alfabética, seja qual for a ordem recebida', () => {
    expect(h2hPath(['rafaelcosta', 'lucassilva'], ['thiagomendes', 'pedrohenrique'])).toBe(
      '/h2h/lucassilva+rafaelcosta/pedrohenrique+thiagomendes',
    );
  });

  it('mantém a ordem dos lados: ela é a perspectiva, não a identidade', () => {
    expect(h2hPath(['pedrohenrique'], ['lucassilva'])).toBe('/h2h/pedrohenrique/lucassilva');
  });
});

describe('parseSideSegment', () => {
  it('lê um jogador ou uma dupla', () => {
    expect(parseSideSegment('lucassilva')).toEqual(['lucassilva']);
    expect(parseSideSegment('lucassilva+rafaelcosta')).toEqual(['lucassilva', 'rafaelcosta']);
  });

  it('decodifica o + que o navegador codificou', () => {
    expect(parseSideSegment('lucassilva%2Brafaelcosta')).toEqual(['lucassilva', 'rafaelcosta']);
  });

  it.each(['', 'a+', '+b', 'a+b+c', '%E0%A4%A'])('recusa %j', (raw) => {
    expect(parseSideSegment(raw)).toBeNull();
  });
});

describe('resolveH2HRoute', () => {
  it('dois jogadores: os lados são jogadores', () => {
    const route = resolveH2HRoute(mockH2HDomain, 'lucassilva', 'pedrohenrique');
    expect(route).toEqual({
      status: 'found',
      sides: [
        { kind: 'player', player_id: players.lucas.id },
        { kind: 'player', player_id: players.pedro.id },
      ],
      canonical_path: '/h2h/lucassilva/pedrohenrique',
    });
  });

  it('duas duplas: os lados são as unidades, e a dupla fora de ordem dá a URL canônica', () => {
    const route = resolveH2HRoute(mockH2HDomain, 'rafaelcosta+lucassilva', 'pedrohenrique+thiagomendes');
    expect(route).toEqual({
      status: 'found',
      sides: [
        { kind: 'unit', unit_id: units.lucasRafael.id, player_ids: units.lucasRafael.player_ids },
        { kind: 'unit', unit_id: units.pedroThiago.id, player_ids: units.pedroThiago.player_ids },
      ],
      canonical_path: '/h2h/lucassilva+rafaelcosta/pedrohenrique+thiagomendes',
    });
  });

  it.each([
    ['@username inexistente', 'lucassilva', 'ninguem', "o @username 'ninguem' não existe"],
    ['lados iguais', 'lucassilva', 'lucassilva', 'têm jogador em comum'],
    ['dupla que nunca existiu', 'lucassilva+pedrohenrique', 'andrelima+brunoaraujo', "'lucassilva+pedrohenrique' nunca formaram uma dupla"],
    ['o mesmo jogador duas vezes', 'lucassilva+lucassilva', 'pedrohenrique+thiagomendes', 'nunca formaram uma dupla'],
    ['um jogador e uma dupla', 'lucassilva', 'pedrohenrique+thiagomendes', 'recebi um jogador e uma dupla'],
    ['segmento sem o formato', 'a+b+c', 'lucassilva', "recebi 'a+b+c', esperado 'username' ou dois unidos por '+'"],
  ])('%s: H2H não encontrado, com o valor recebido', (_, rawA, rawB, reason) => {
    const route = resolveH2HRoute(mockH2HDomain, rawA, rawB);
    expect(route.status).toBe('not_found');
    expect(route.status === 'not_found' && route.reason).toContain(reason);
  });

  it('duplas com um jogador em comum nunca se enfrentaram: H2H não encontrado', () => {
    // Júlia jogou com Roberto e depois com Vinícius (R17)
    const route = resolveH2HRoute(mockH2HDomain, 'juliaandrade+robertocampos', 'juliaandrade+viniciusprado');
    expect(route).toMatchObject({ status: 'not_found', reason: expect.stringContaining('jogador em comum') });
  });
});
