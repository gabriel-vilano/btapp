// O que a tabela de classificação mostra além da posição e dos pontos
// (docs/RANKING.md): delta (RK12), distância da vaga (RK11), jogos e vitórias
// (RK8) e a lista sem posição da temporada sem jogo (RK20). A classificação
// em si vem de `computeStandings`; a linha de corte, de `cutoffLine`.

export { deltaBaseRound, positionDeltas } from './positionDelta';
export { cutoffDistance, type CutoffDistance } from './cutoffDistance';
export { lineRecords, type LineRecord } from './lineRecord';
export { unrankedEnrollments } from './unrankedTable';
