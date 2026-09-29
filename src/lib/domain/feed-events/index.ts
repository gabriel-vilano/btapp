// Geração dos eventos automáticos do feed a partir do domínio (docs/DOMAIN.md,
// R20–R25, R28, R46, R47). Funções puras: recebem as tabelas e devolvem os
// eventos, sem guardar nada. A exceção é o marco, que é concedido no
// fechamento da rodada (`grantMilestones`) e guardado para nunca ser revogado.

export { actorLookup, type ActorLookup, type FeedDomain } from './feedDomain';
export { enrollmentEvents, friendshipEvents, matchDefinedEvents, resultEvents } from './activityEvents';
export { movementEvents, type RankingMovementEvent } from './rankingMovement';
export { grantMilestones, milestoneEvents, topNOf } from './milestones';
export { qualificationEvents } from './finalQualification';
export { generateFeedEvents } from './generateFeedEvents';
export { isVisibleTo } from './visibility';
