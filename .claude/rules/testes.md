---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "e2e/**"
  - "vitest.config.ts"
  - "playwright.config.ts"
---

# Testes

Os princípios (fluxo crítico ganha teste, bug fix ganha teste de regressão, prioridade de cobertura) estão no `CLAUDE.md` > "Testes". Stories e `play` estão em `.claude/rules/storybook.md`.

- **Framework:** Vitest 4. `npm test` roda só o project `unit` (testes node). `npm run test:stories` roda as stories no Chromium. Arquivos `<nome>.test.ts(x)` ao lado do código testado
- **Server actions:** testar com `vi.mock` em `@/src/lib/supabase/server` (fake de `app/(auth)/actions.test-utils.ts`) e em `next/navigation`, com `redirect` lançando `NEXT_REDIRECT:<url>` como o real. Asserção de redirect: `rejects.toThrow(redirectSignal(url))`
- **E2E:** Playwright em `e2e/`, contra o build de produção e um Supabase local (`supabase start`) com as migrations aplicadas do zero; o código de verificação dos e-mails vem do Mailpit. Roda no job E2E da CI. Sessões de agente não têm Docker: validam pelo resultado desse job no PR, não localmente. Cada teste cria usuário com e-mail único (`uniqueEmail`), e os helpers recusam qualquer Supabase que não seja local
- **Seletores E2E:** preferir `getByLabel`/`getByRole` com `exact: true`. Alerta sempre filtrado pelo texto (`getByRole("alert").filter({ hasText })`): o anunciador de rota do Next também tem `role="alert"`
- **Falha de E2E na CI:** o screenshot e o trace ficam no artefato, que os agentes não conseguem baixar. Por isso o `e2e/app-shell.spec.ts` usa o `e2e/support/diagnostics.ts`: na falha, escreve no log do job a URL, os erros do navegador e as respostas com erro, a árvore de acessibilidade e o HTML da área de conteúdo. Spec nova que navegue pelo app pode usar o mesmo `beforeEach`/`afterEach`
