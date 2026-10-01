import { describe, expect, it } from 'vitest';
import { mockEntities, mockH2HDomain } from '@/src/mocks/domain';
import { playerSide, unitSide } from './h2h.test-utils';
import { h2hSharedRankings } from './rankings';

// "No ranking" (docs/HEAD_TO_HEAD.md, HH13).

const { units, masculinoB, season, ranking, rankingCategories } = mockEntities;
const now = new Date().toISOString();

describe('h2hSharedRankings', () => {
  it('mocks: as duas duplas no Masculino B, cada uma com a posição atual', () => {
    expect(h2hSharedRankings(mockH2HDomain, unitSide(units.lucasRafael), unitSide(units.pedroThiago), now)).toEqual([
      {
        competition_id: ranking.id,
        season_id: season.id,
        category_id: rankingCategories.masculinoB.id,
        // A inscrição do torneio é ativa, mas não tem temporada nem classificação: fica fora
        left: { enrollment_id: masculinoB.t1.id, position: 3, position_delta: -1 },
        right: { enrollment_id: masculinoB.t2.id, position: 4, position_delta: null },
      },
    ]);
  });

  it('cada linha fica do seu lado: a ordem segue a página', () => {
    const [entry] = h2hSharedRankings(mockH2HDomain, unitSide(units.pedroThiago), unitSide(units.lucasRafael), now);
    expect([entry.left.enrollment_id, entry.right.enrollment_id]).toEqual([masculinoB.t2.id, masculinoB.t1.id]);
  });

  it('sem categoria em comum, a seção some', () => {
    expect(h2hSharedRankings(mockH2HDomain, unitSide(units.lucasRafael), unitSide(units.marcosAna), now)).toEqual([]);
  });

  it('a inscrição encerrada pela troca de parceiro não entra (PF15)', () => {
    // Roberto e Júlia se desfizeram na Mista C 40+; Vinícius e Júlia seguem ativos
    const marcosAna = unitSide(units.marcosAna);
    expect(h2hSharedRankings(mockH2HDomain, unitSide(units.robertoJulia), marcosAna, now)).toEqual([]);
    expect(h2hSharedRankings(mockH2HDomain, unitSide(units.viniciusJulia), marcosAna, now)).toEqual([
      expect.objectContaining({ category_id: rankingCategories.mistaC40.id }),
    ]);
  });

  it('na página de jogadores não existe: a posição é da dupla (R1)', () => {
    expect(h2hSharedRankings(mockH2HDomain, playerSide('lucas'), playerSide('pedro'), now)).toEqual([]);
  });
});
