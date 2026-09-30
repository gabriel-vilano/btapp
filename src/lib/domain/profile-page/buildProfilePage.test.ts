import { describe, expect, it } from 'vitest';
import { mockDomain, mockEntities, mockProfileDomain } from '@/src/mocks/domain';
import { buildProfilePage } from './buildProfilePage';
import type { ProfilePageData, ProfileSection } from './types';

// Página do perfil (docs/PROFILE.md) montada sobre os mocks do domínio, vista
// pelo Lucas.

const { players } = mockEntities;
const NOW = new Date().toISOString();

function pageOf(username: string, viewerId = players.lucas.id): ProfilePageData {
  const page = buildProfilePage(mockProfileDomain, { username, viewerId, now: NOW });
  if (page === null) throw new Error(`Teste: perfil '${username}' não montou`);
  return page;
}

function dataOf<T>(section: ProfileSection<T>): T {
  if (section.status !== 'ready') throw new Error('Teste: seção com erro');
  return section.data;
}

describe('buildProfilePage', () => {
  it('@username inexistente: null, para a tela "Jogador não encontrado"', () => {
    expect(buildProfilePage(mockProfileDomain, { username: 'ninguem', viewerId: players.lucas.id, now: NOW })).toBeNull();
  });

  it('próprio perfil: relação "self", sem bloco "Vocês" e com a melhor posição (PF3, PF14)', () => {
    const page = pageOf(players.lucas.username);
    expect(page.relation).toBe('self');
    expect(dataOf(page.versus)).toBeNull();
    expect(dataOf(page.rankings)[0]).toMatchObject({ position: 3, best_position: 1, partner_name: 'Rafael' });
  });

  it('cabeçalho: jogos = vitórias + derrotas do cartel, sem W.O. (PF5, PF6)', () => {
    const page = pageOf(players.lucas.username);
    expect(page.record).toEqual({ wins: 7, losses: 2 });
    // O mock guarda 274 (com o legado): o cabeçalho não pode contradizer o cartel
    expect(page.player.total_matches).toBe(9);
    expect(page.friends_count).toBe(1);
  });

  it('a variação da tabela aparece em qualquer perfil, inclusive a queda (PF13)', () => {
    const [own] = dataOf(pageOf(players.lucas.username).rankings);
    const [seenByPedro] = dataOf(pageOf(players.lucas.username, players.pedro.id).rankings);
    expect(own.delta).toEqual({ direction: 'down', value: 1 });
    expect(seenByPedro.delta).toEqual(own.delta);
    expect(seenByPedro.best_position).toBeNull();
  });

  it('nomes e rotas das linhas de "Rankings" (PF10)', () => {
    expect(dataOf(pageOf(players.pedro.username).rankings)[0]).toMatchObject({
      competition_name: mockEntities.ranking.name,
      category_name: 'Masculino B',
      partner_name: 'Thiago',
      href: `/ranking/${mockEntities.rankingCategories.masculinoB.id}`,
    });
  });

  it('bloco "Vocês" com H2H: partidas e vitórias de quem vê (PF17)', () => {
    expect(dataOf(pageOf(players.pedro.username).versus)).toEqual({
      next_match: null,
      head_to_head: { href: '/jogadores/pedrohenrique/h2h', matches: 3, viewer_wins: 3 },
    });
  });

  it('bloco "Vocês" com confronto definido: rodada e data acordada (PF16)', () => {
    const versus = dataOf(pageOf(players.caio.username).versus);
    expect(versus?.next_match).toEqual({ href: '/jogos/match-arena-rm-mb-r3-1', stage: 'Rodada 3', scheduled_at: null });
    expect(versus?.head_to_head).toBeNull();
  });

  it('partidas recentes do lado do dono: resultado, adversários e contexto (PF18)', () => {
    const matches = dataOf(pageOf(players.lucas.username).recent_matches);
    expect(matches).toHaveLength(5);
    expect(matches.find((m) => m.context === 'Amistoso' && m.result_type === 'retired')).toMatchObject({
      outcome: 'win',
      opponents: 'Thiago Mendes',
      score: { type: 'retired', completed_sets: [], interrupted_set: { a: 5, b: 3 } },
    });
  });

  it('derrota: o placar continua gravado do lado vencedor', () => {
    const loss = dataOf(pageOf(players.lucas.username).recent_matches).find((m) => m.outcome === 'loss');
    expect(loss).toMatchObject({ opponents: 'André e Bruno', score: { type: 'normal', sets: [{ a: 7, b: 6 }] } });
  });

  it('temporadas encerradas com posição final, marcos e final (PF19)', () => {
    expect(dataOf(pageOf(players.pedro.username).seasons)).toEqual([
      expect.objectContaining({
        season_name: '1º semestre de 2026',
        final_position: 2,
        milestones: [{ type: 'top_n', n: 2 }],
        final_name: 'Saideira',
        href: expect.stringContaining('?temporada=season-arena-rm-2026-1'),
      }),
    ]);
  });

  it('jogador sem partida e sem inscrição: seções vazias (PF2, §6.2)', () => {
    const page = pageOf(players.marina.username);
    expect(page.record).toEqual({ wins: 0, losses: 0 });
    expect([dataOf(page.rankings), dataOf(page.recent_matches), dataOf(page.seasons)]).toEqual([[], [], []]);
    expect(dataOf(page.versus)).toBeNull();
  });

  it('sem a temporada encerrada nas tabelas, "Temporadas" fica vazia', () => {
    const page = buildProfilePage(mockDomain, { username: players.lucas.username, viewerId: players.lucas.id, now: NOW });
    expect(page && dataOf(page.seasons)).toEqual([]);
  });
});
