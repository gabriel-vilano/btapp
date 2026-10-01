import type { CompetitorUnit, FriendlyMatch, FriendlyResult, MatchFormat, Player } from '@/src/types/domain';
import { daysAgo, hoursAgo, onTheHour } from '../relativeTime';
import { gameSet, hoursAfter, interruptedSet, reportBy, responseBy, superTiebreak } from './builders';
import { players as p, units } from './people';

// Amistosos (R42–R44): um em cada estado, em simples e duplas. O de Lucas e
// Rafael × Pedro e Thiago repete um confronto do ranking, então entra no H2H
// da dupla exata.

function base(
  slug: string,
  sideA: CompetitorUnit,
  sideB: CompetitorUnit,
  format: MatchFormat,
  playedAt: string,
  result: FriendlyResult,
  reporter: Player,
) {
  const report = reportBy(result, reporter, hoursAfter(playedAt, 2));
  return {
    id: `match-friendly-${slug}`,
    kind: 'friendly' as const,
    side_a_unit_id: sideA.id,
    side_b_unit_id: sideB.id,
    format,
    played_at: playedAt,
    venue: 'Arena Mangaba – Beach · Nova Lima/MG',
    created_at: report.reported_at,
    report,
  };
}

const doublesConfirmed = base(
  'lucas-rafael-pedro-thiago', units.lucasRafael, units.pedroThiago, 'one_set_of_6',
  onTheHour(daysAgo(10)), { type: 'normal', winner: 'a', sets: [gameSet(6, 4)] }, p.lucas,
);

// O Thiago torceu o tornozelo perdendo por 5/3 no set de 8.
const singlesRetired = base(
  'lucas-thiago', units.lucas, units.thiago, 'one_set_of_8',
  onTheHour(daysAgo(8)), { type: 'retired', winner: 'a', sets: [interruptedSet(5, 3)] }, p.lucas,
);

// Pendente há mais de um dia: sem prazo, não confirma sozinho (R43).
const singlesAwaiting = base(
  'andre-pedro', units.andre, units.pedro, 'two_sets_of_6_stb',
  onTheHour(hoursAgo(30)),
  { type: 'normal', winner: 'a', sets: [gameSet(6, 4), gameSet(4, 6), superTiebreak(10, 8)] }, p.andre,
);

const doublesDiscarded = base(
  'ana-beatriz-carla-julia', units.anaBeatriz, units.carlaJulia, 'one_set_of_6',
  onTheHour(daysAgo(5)), { type: 'normal', winner: 'b', sets: [gameSet(2, 6)] }, p.carla,
);

const singlesCancelled = base(
  'caio-diego', units.caio, units.diego, 'one_set_of_6',
  onTheHour(daysAgo(3)), { type: 'normal', winner: 'a', sets: [gameSet(6, 3)] }, p.caio,
);

// Os dois pendentes do Lucas, que vê o app nos mocks: um para ele confirmar
// e um que ele lançou e ainda pode cancelar (docs/RESULTS.md §6.2).
const singlesAwaitingLucas = base(
  'pedro-lucas', units.pedro, units.lucas, 'one_set_of_6',
  onTheHour(daysAgo(3)), { type: 'normal', winner: 'a', sets: [gameSet(6, 3)] }, p.pedro,
);

const doublesAwaitingByLucas = base(
  'lucas-rafael-andre-bruno', units.lucasRafael, units.andreBruno, 'one_set_of_8',
  onTheHour(daysAgo(1)), { type: 'normal', winner: 'a', sets: [gameSet(8, 6)] }, p.lucas,
);

export const friendlyMatches: FriendlyMatch[] = [
  { ...doublesConfirmed, status: 'confirmed', response: responseBy(p.thiago, hoursAfter(doublesConfirmed.created_at, 3)) },
  { ...singlesRetired, status: 'confirmed', response: responseBy(p.thiago, hoursAfter(singlesRetired.created_at, 20)) },
  { ...singlesAwaiting, status: 'awaiting_confirmation' },
  { ...singlesAwaitingLucas, status: 'awaiting_confirmation' },
  { ...doublesAwaitingByLucas, status: 'awaiting_confirmation' },
  // A Ana contestou: sem admin no amistoso, o resultado é descartado (R43).
  { ...doublesDiscarded, status: 'discarded', response: responseBy(p.ana, hoursAfter(doublesDiscarded.created_at, 1)) },
  // O Caio lançou o jogo errado e cancelou antes de o Diego responder.
  { ...singlesCancelled, status: 'cancelled', cancelled_at: hoursAfter(singlesCancelled.created_at, 1) },
];
