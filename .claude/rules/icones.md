---
paths:
  - "src/**/*.tsx"
  - "app/**/*.tsx"
---

# Ícones

- Lib: `@phosphor-icons/react`
- Sempre via wrapper: `<Icon icon={TrophyIcon} size="md" weight="regular" />`
- **Sempre importar com sufixo `Icon`:** `import { TrophyIcon } from '@phosphor-icons/react'`. Os nomes legados (`Trophy`, `Heart`) ainda funcionam por compatibilidade, mas o padrão moderno da lib é com sufixo — use sempre o novo.
- Cor sempre via `currentColor` — nunca definir cor dentro do componente `Icon`
- Ícones decorativos: `aria-hidden={true}` (default — não precisa declarar)
- Ícones com significado semântico: `aria-label="descrição"` + `aria-hidden={false}`
- Botão com ícone sem texto: `aria-label` vai no `<button>`, não no `<Icon>`
- Ícones customizados de marca: `src/components/icons/` (SVG próprio, fora do Phosphor)
- Referência completa: ver `Icon.mdx` no Storybook (`UI/Icon > Docs`)

## Phosphor em Server Components

**Sintoma:** `createContext only works in Client Components` ao renderizar um ícone do `@phosphor-icons/react` num Server Component.

**Causa:** o import padrão do Phosphor usa React Context, que não existe em Server Components (README do pacote, seção "React Server Components and SSR"). Qualquer import de valor (ex: `import { HandshakeIcon } from "@phosphor-icons/react"`) num Server Component dispara o erro.

**Solução:** o componente que importa o ícone roda no cliente. Ou ele tem `"use client"` (`Toast`, `FormInput`, `AvatarUpload`), ou só é usado dentro de componentes client (`Alert` e `PasswordChecklist`, usados só em páginas de auth com `"use client"`). Num Server Component, importar de `@phosphor-icons/react/ssr`. O wrapper `<Icon />` em si é seguro em Server Components: recebe o ícone como prop (`React.ElementType`) e não importa nada do Phosphor — o erro vem de quem importa o ícone.

**Regra do feed:** todo componente de `src/components/feed/` que importa ícone Phosphor tem `"use client"` no próprio arquivo, em vez de depender de quem o renderiza. Assim ele funciona em qualquer página, inclusive num Server Component.

Origem não localizada (anterior ao histórico do repo).
