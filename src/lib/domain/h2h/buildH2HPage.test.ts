import { describe, expect, it } from 'vitest';
import { mockEntities, mockH2HDomain } from '@/src/mocks/domain';
import { buildH2HPage, type H2HPageData } from './buildH2HPage';

// A página de H2H inteira sobre os mocks (docs/HEAD_TO_HEAD.md).

const { players, units } = mockEntities;
const now = new Date().toISOString();

function pageOf(sideA: string, sideB: string, viewerId: string): H2HPageData {
  const result = buildH2HPage(mockH2HDomain, { sideA, sideB, viewerId, now });
  if (result.status !== 'found') throw new Error(`Teste: esperava a página de '${sideA}/${sideB}', veio '${result.reason}'`);
  return result.page;
}

describe('buildH2HPage: dupla × dupla', () => {
  const page = pageOf('pedrohenrique+thiagomendes', 'lucassilva+rafaelcosta', players.lucas.id);

  it('quem vê vai para a esquerda, e a URL canônica é a da ordem pedida', () => {
    expect(page).toMatchObject({ kind: 'doubles', viewer_is_left: true, canonical_path: '/h2h/pedrohenrique+thiagomendes/lucassilva+rafaelcosta' });
    expect(page.left).toMatchObject({ unit_id: units.lucasRafael.id });
  });

  it('resumo e lista contam as mesmas partidas: 2+ confrontos, com uma derrota', () => {
    expect(page.summary).toMatchObject({ left_wins: 3, right_wins: 1, total: 4 });
    expect(page.confrontations).toHaveLength(page.summary.total);
    expect(page.summary.last_played_at).toBe(page.confrontations[0].played_at);
  });

  it('o confronto ainda aguardando confirmação não entra', () => {
    expect(page.confrontations.map((line) => line.match_id)).not.toContain('match-arena-mangaba-mb-r3-4');
  });

  it('tem forma das duas duplas, ranking em comum e os 4 pares cruzados', () => {
    expect(page.form.left).toHaveLength(5);
    expect(page.form.right).toHaveLength(5);
    expect(page.shared_rankings).toHaveLength(1);
    expect(page.cross_pairs).toHaveLength(4);
  });
});

describe('buildH2HPage: jogador × jogador', () => {
  const page = pageOf('lucassilva', 'pedrohenrique', players.marina.id);

  it('soma simples e duplas, sem ranking em comum nem pares cruzados', () => {
    expect(page).toMatchObject({ kind: 'players', viewer_is_left: false, shared_rankings: [], cross_pairs: [] });
    expect(page.summary).toMatchObject({ left_wins: 3, right_wins: 2, total: 5 });
  });

  it('as partidas de duplas trazem os parceiros; a de simples, não', () => {
    const lineups = page.confrontations.map((line) => line.lineup !== null);
    expect(lineups).toEqual([true, true, true, false, true]);
  });

  it('os lados nunca se enfrentaram: resumo zerado, lista vazia e a forma continua (§6.1)', () => {
    const empty = pageOf('lucassilva', 'marcostavares', players.lucas.id);
    expect(empty.summary).toEqual({ left_wins: 0, right_wins: 0, total: 0, last_played_at: null });
    expect(empty.confrontations).toEqual([]);
    expect(empty.form.left.length).toBeGreaterThan(0);
  });
});

describe('buildH2HPage: H2H não encontrado', () => {
  it('devolve o motivo da rota', () => {
    expect(buildH2HPage(mockH2HDomain, { sideA: 'lucassilva', sideB: 'ninguem', viewerId: players.lucas.id, now })).toEqual({
      status: 'not_found',
      reason: "H2H: o @username 'ninguem' não existe, esperado o @username de um jogador",
    });
  });
});
