import { describe, expect, it } from 'vitest';
import { mockDomain, mockEntities } from '@/src/mocks/domain';
import { playerAgenda } from '@/src/lib/domain/agenda';
import { agendaActionOf, agendaItemModel, categoryName } from './agendaItemModel';

const { players, rankingCategories } = mockEntities;
const NOW = new Date().toISOString();

describe('agendaItemModel', () => {
  const agenda = playerAgenda(mockDomain, { playerId: players.lucas.id, now: NOW });

  it('item de "Sua vez": lado de quem vê primeiro, contexto do ranking e botão', () => {
    const item = agendaItemModel(mockDomain, agenda.your_turn[0], NOW);
    expect(item.ownSide.map((person) => person.name)).toEqual(['Lucas Silva', 'Rafael Costa']);
    expect(item.opponentSide.map((person) => person.name)).toEqual(['Caio Ferreira', 'Diego Martins']);
    expect(item.context).toBe('Ranking Arena RM 2026 · Masculino B · Rodada 3');
    expect(item.situation).toMatch(/^Marcar jogo · rodada fecha em /);
    expect(item.action).toEqual({ label: 'Propor horários', href: '/jogos/match-arena-rm-mb-r3-1' });
  });

  it('fora de "Sua vez" não há botão', () => {
    const item = agendaItemModel(mockDomain, agenda.waiting[0], NOW);
    expect(item.action).toBeNull();
    expect(item.situation).toMatch(/^Aguardando confirmação · confirma sozinho em /);
  });

  it('torneio: competição · categoria · fase', () => {
    const item = agendaItemModel(mockDomain, agenda.upcoming[0], NOW);
    expect(item.context).toBe('Copa Sunset de Beach Tennis · Masculino B · Final');
  });

  it('amistoso: o contexto é "Amistoso"', () => {
    const friendly = agenda.history.find((entry) => entry.match_id.startsWith('match-friendly'));
    expect(friendly).toBeDefined();
    if (friendly === undefined) return;
    expect(agendaItemModel(mockDomain, friendly, NOW).context).toBe('Amistoso');
  });
});

describe('agendaActionOf', () => {
  it('"Lançar resultado" abre direto o fluxo de lançar (N16)', () => {
    expect(agendaActionOf({ kind: 'report_result', deadline: NOW }, 'm-1')).toEqual({
      label: 'Lançar resultado',
      href: '/jogos/m-1/resultado',
    });
  });

  it('resultado e amistoso usam "Confirmar", que abre a partida', () => {
    expect(agendaActionOf({ kind: 'confirm_result', deadline: NOW }, 'm-1')?.label).toBe('Confirmar');
    expect(agendaActionOf({ kind: 'confirm_friendly' }, 'm-1')).toEqual({ label: 'Confirmar', href: '/jogos/m-1' });
  });

  it('situações sem ação devolvem null', () => {
    expect(agendaActionOf({ kind: 'with_admin' }, 'm-1')).toBeNull();
  });
});

describe('categoryName', () => {
  it('traz a idade da categoria', () => {
    expect(categoryName(rankingCategories.mistaC40)).toBe('Mista C 40+');
    expect(categoryName(rankingCategories.masculinoB)).toBe('Masculino B');
  });
});
