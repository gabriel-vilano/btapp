---
paths:
  - "supabase/**"
  - "src/lib/supabase/**"
  - "app/**/actions*.ts"
---

# Supabase

As regras que não podem falhar (RLS, segredo, migration só por PR, mocks primeiro) estão no `CLAUDE.md` > "Supabase: o que não pode falhar". Aqui fica o detalhe.

- Variáveis de ambiente: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`), lidas só via `getSupabasePublicEnv()` (`src/lib/supabase/env.ts`). A anon key legada (JWT) não é usada
- **Env vars na Vercel:** a integração Supabase ↔ Vercel sincroniza só o ambiente Production, com os segredos marcados como *sensitive*. Preview e Development recebem apenas as variáveis públicas, cadastradas à mão — build de branch (o repo é público) nunca recebe segredo
- **Schema versionado em `supabase/migrations/`.** Toda mudança de schema, policy ou bucket entra como migration — nunca editar direto pelo dashboard. O repo é a fonte de verdade do banco; o dashboard é só leitura
- Migration nasce com `supabase migration new <descricao_em_snake_case>` (gera `<timestamp>_<descricao>.sql`) e entra por PR. **Quem aplica no remoto é o merge na `master`**, via integração GitHub do Supabase (*Deploy to production*). Nunca aplicar à mão (`supabase db push`, `apply_migration` via MCP): o `apply_migration` grava a hora da chamada como versão, diferente do timestamp do arquivo — no merge a integração roda o mesmo SQL de novo e o histórico do banco diverge do repo. Para testar antes do merge: `supabase db reset` local (Docker)
- Antes de mexer em migration, ver `docs/GIT_WORKFLOW.md` > "Deploy" (o merge aplica no remoto) e "CI" (versão fixa do Supabase CLI no E2E, CLI local no mínimo 2.108)
