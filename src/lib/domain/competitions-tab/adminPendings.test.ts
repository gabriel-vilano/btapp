import { describe, expect, it } from 'vitest';
import { adminPendingCount, sortAdminPendings } from './adminPendings';
import { pendingItem } from './competitionsTab.test-utils';

describe('adminPendingCount (N3)', () => {
  const pendings = [pendingItem('p1', '2026-09-20'), pendingItem('p2', '2026-09-21')];

  it('conta as pendências do admin', () => {
    expect(adminPendingCount({ is_admin: true, admin_pendings: pendings })).toBe(2);
  });

  it('é zero para admin sem pendência', () => {
    expect(adminPendingCount({ is_admin: true, admin_pendings: [] })).toBe(0);
  });

  it('é zero para quem não é admin, mesmo que chegue alguma pendência', () => {
    expect(adminPendingCount({ is_admin: false, admin_pendings: pendings })).toBe(0);
  });
});

describe('sortAdminPendings', () => {
  it('põe a mais antiga primeiro', () => {
    const sorted = sortAdminPendings([pendingItem('nova', '2026-09-25'), pendingItem('velha', '2026-09-18')]);
    expect(sorted.map((pending) => pending.id)).toEqual(['velha', 'nova']);
  });

  it('desempata pelo id', () => {
    const sorted = sortAdminPendings([pendingItem('b', '2026-09-20'), pendingItem('a', '2026-09-20')]);
    expect(sorted.map((pending) => pending.id)).toEqual(['a', 'b']);
  });
});
