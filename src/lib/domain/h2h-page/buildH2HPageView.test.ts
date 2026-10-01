import { describe, expect, it } from 'vitest';
import { mockEntities, mockH2HDomain } from '@/src/mocks/domain';
import { buildH2HPageView } from './buildH2HPageView';
import type { H2HPageView } from './types';

const { players } = mockEntities;
const now = '2026-10-01T12:00:00Z';
const links = { rankingHref: (categoryId: string) => `/ranking/${categoryId}` };

function resultOf(sideA: string, sideB: string, viewerId = players.lucas.id) {
  return buildH2HPageView(mockH2HDomain, { sideA, sideB, viewerId, now }, links);
}

function viewOf(sideA: string, sideB: string, viewerId = players.lucas.id): H2HPageView {
  const result = resultOf(sideA, sideB, viewerId);
  if (result.status !== 'found') throw new Error(`Teste: esperava a página de '${sideA}/${sideB}', veio '${result.reason}'`);
  return result.view;
}

const LUCAS_RAFAEL = 'lucassilva+rafaelcosta';
const PEDRO_THIAGO = 'pedrohenrique+thiagomendes';

describe('buildH2HPageView: dupla × dupla', () => {
  const view = viewOf(LUCAS_RAFAEL, PEDRO_THIAGO);

  it('o h1 é o confronto pelos primeiros nomes (HH9)', () => {
    expect(view.title).toBe('Lucas e Rafael × Pedro e Thiago');
  });

  it('o lado de quem vê fala com "Vocês"; o outro, pelos nomes (HH6)', () => {
    expect(view.left.label).toBe('Vocês');
    expect(view.right.label).toBe('Pedro e Thiago');
  });

  it('cada jogador mostra o primeiro nome e abre o perfil (HH9)', () => {
    expect(view.left.players.map((p) => [p.shown_name, p.href])).toEqual([
      ['Lucas', '/jogadores/lucassilva'],
      ['Rafael', '/jogadores/rafaelcosta'],
    ]);
  });

  it('"No ranking" tem uma linha por dupla em cada categoria em comum (HH13)', () => {
    if (view.rankings.status !== 'ready') throw new Error('Teste: esperava "No ranking" pronta');
    expect(view.rankings.data.map((row) => row.side_name)).toEqual(['Lucas e Rafael', 'Pedro e Thiago']);
    expect(view.rankings.data[0].delta).toEqual({ direction: 'down', value: 1 });
    expect(view.rankings.data[1].delta).toBeNull();
  });

  it('cada par cruzado abre a página de jogadores daquele par (HH2)', () => {
    expect(view.cross_pairs.map((pair) => [pair.title, pair.href])).toEqual([
      ['Lucas × Pedro', '/h2h/lucassilva/pedrohenrique'],
      ['Lucas × Thiago', '/h2h/lucassilva/thiagomendes'],
      ['Rafael × Pedro', '/h2h/rafaelcosta/pedrohenrique'],
      ['Rafael × Thiago', '/h2h/rafaelcosta/thiagomendes'],
    ]);
  });

  it('a linha de confronto diz de onde veio a partida e não mostra parceiros (HH14)', () => {
    expect(view.confrontations.map((item) => item.context)).toContain('Amistoso');
    expect(view.confrontations.map((item) => item.context)).toContain('Ranking Arena Mangaba 2026 · Masculino B · Rodada 1');
    expect(view.confrontations.every((item) => item.lineup === null)).toBe(true);
  });
});

describe('buildH2HPageView: jogador × jogador', () => {
  // URL na ordem inversa: quem vê vai para a esquerda mesmo assim (HH6)
  const view = viewOf('pedrohenrique', 'lucassilva');

  it('põe o Lucas à esquerda, com "Você", e o nome completo nos lados', () => {
    expect(view.title).toBe('Lucas × Pedro');
    expect(view.left.label).toBe('Você');
    expect(view.left.players.map((p) => p.shown_name)).toEqual(['Lucas Silva']);
    expect(view.summary).toMatchObject({ left_wins: 3, right_wins: 2 });
  });

  it('mantém a URL pedida como canônica: a ordem dos lados é a perspectiva', () => {
    const result = resultOf('pedrohenrique', 'lucassilva');
    expect(result.status === 'found' && result.canonical_path).toBe('/h2h/pedrohenrique/lucassilva');
  });

  it('mostra com quem cada um jogou nas partidas de duplas (HH14)', () => {
    expect(view.confrontations[0].lineup).toEqual({ partner_name: 'Rafael', opponent_names: 'Pedro e Thiago' });
  });

  it('não tem "No ranking" nem "Jogador contra jogador" (HH3, HH13)', () => {
    expect(view.rankings).toEqual({ status: 'ready', data: [] });
    expect(view.cross_pairs).toEqual([]);
  });
});

describe('buildH2HPageView: estados da §6.1', () => {
  it('quem vê de fora lê os dois lados pelo nome', () => {
    const view = viewOf('rafaelcosta', 'thiagomendes');
    expect([view.left.label, view.right.label]).toEqual(['Rafael', 'Thiago']);
    expect(view.viewer_is_left).toBe(false);
  });

  it('sem confronto: resumo vazio, lista vazia e a forma recente continua', () => {
    const view = viewOf('lucassilva', 'marcostavares');
    expect(view.summary).toBeNull();
    expect(view.confrontations).toEqual([]);
    expect(view.form.status).toBe('ready');
  });

  it('@username inexistente dá "H2H não encontrado"', () => {
    expect(resultOf('lucassilva', 'ninguem').status).toBe('not_found');
  });

  it('dupla que nunca existiu dá "H2H não encontrado"', () => {
    expect(resultOf('lucassilva+pedrohenrique', 'rafaelcosta+thiagomendes').status).toBe('not_found');
  });

  it('a dupla fora da ordem alfabética aponta para a URL única dela (N10)', () => {
    const result = resultOf('rafaelcosta+lucassilva', PEDRO_THIAGO);
    expect(result.status === 'found' && result.canonical_path).toBe(`/h2h/${LUCAS_RAFAEL}/${PEDRO_THIAGO}`);
  });
});
