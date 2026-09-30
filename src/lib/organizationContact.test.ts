import { describe, expect, it } from 'vitest';
import { readOrganizationContact } from './organizationContact';

describe('readOrganizationContact', () => {
  it('link https vira botão', () => {
    expect(readOrganizationContact('https://wa.me/5531900000001')).toEqual({
      kind: 'link',
      href: 'https://wa.me/5531900000001',
    });
  });

  it('ignora espaços em volta do link', () => {
    expect(readOrganizationContact('  https://instagram.com/arenamangaba ')).toEqual({
      kind: 'link',
      href: 'https://instagram.com/arenamangaba',
    });
  });

  it('texto aparece como foi escrito', () => {
    expect(readOrganizationContact('Procure o Carlos na recepção')).toEqual({
      kind: 'text',
      text: 'Procure o Carlos na recepção',
    });
  });

  it('telefone e e-mail são texto, sem botão', () => {
    expect(readOrganizationContact('(31) 90000-0000')?.kind).toBe('text');
    expect(readOrganizationContact('contato@exemplo.com')?.kind).toBe('text');
  });

  it.each(['javascript:alert(1)', 'JavaScript:alert(1)', 'data:text/html,<script>alert(1)</script>'])(
    '%s nunca vira link',
    (contact) => {
      expect(readOrganizationContact(contact)).toEqual({ kind: 'text', text: contact });
    },
  );

  it('http sem TLS e mailto viram texto', () => {
    expect(readOrganizationContact('http://arenamangaba.com')?.kind).toBe('text');
    expect(readOrganizationContact('mailto:contato@exemplo.com')?.kind).toBe('text');
  });

  it('link no meio de uma frase é texto', () => {
    expect(readOrganizationContact('Instagram: https://instagram.com/arenamangaba')?.kind).toBe('text');
  });

  it('sem contato, vazio ou só espaços: nada', () => {
    expect(readOrganizationContact(null)).toBeNull();
    expect(readOrganizationContact('')).toBeNull();
    expect(readOrganizationContact('   ')).toBeNull();
  });
});
