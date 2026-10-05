---
paths:
  - "src/components/**"
---

# Onde mora cada componente

`src/components/` se divide por grupo, e o grupo segue o Tier (ver `.claude/rules/storybook.md` > "Estratégia de cobertura"):

- **`ui/`** guarda os Tier 1 e os Tier 2 genéricos: primitivos e compostos sem regra de negócio (Button, FormInput, Avatar, Badge, EmptyState).
- **Grupos de área** (`auth/`, `feed/` e os próximos, como `agenda/`, `ranking/` e `profile/`) guardam os Tier 3 e Tier 4 daquela área, e os Tier 2 que só fazem sentido nela (OtpInput, PasswordChecklist).
- **`icons/`** guarda os SVGs próprios da marca (fora do Phosphor).
- **`shell/`** guarda a casca das telas logadas: o `AppShell` (TabBar, NavigationRail e a aba marcada, `docs/NAVIGATION.md` N10 e N28), montado no `app/(app)/layout.tsx`, e o `DetailHeader`, o cabeçalho de toda tela de detalhe, cujo "Voltar" leva à aba marcada, ou à tela pai quando a página passa `parentHref` (a área "Administrar" volta à competição). Quem usa o `shell/` são as páginas em `app/`; os grupos de área não importam dele.

**Componente usado por duas ou mais áreas sobe para `ui/`.** Um grupo de área não importa de outro grupo de área: se `ranking/` precisa de algo que está em `feed/`, esse algo vai para `ui/`. Assim cada área depende só de `ui/`, e mover ou apagar uma área não quebra as outras.

**Documentação:** cada componente do Tier 1 e do Tier 2 tem um `Component.mdx` ao lado, que é a fonte única da documentação dele (renderizada no Storybook). As convenções de story e de MDX estão em `.claude/rules/storybook.md`, que um hook exige ler antes de escrever story ou MDX.

**Regra do feed:** todo componente de `src/components/feed/` que importa ícone Phosphor tem `"use client"` no próprio arquivo, em vez de depender de quem o renderiza. Assim ele funciona em qualquer página, inclusive num Server Component (por quê: `.claude/rules/icones.md` > "Phosphor em Server Components").
