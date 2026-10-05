-- Desliga o pg_graphql. O app só fala com o banco pela Data API REST (`supabase-js`), e
-- nenhum código usa o endpoint `/graphql/v1`.
--
-- Por que desligar em vez de revogar grants: o linter do Supabase (lints 0026 e 0027)
-- avisa que `profiles` e `profile_private` aparecem no schema GraphQL porque `anon` e
-- `authenticated` têm SELECT. Revogar o SELECT tiraria o acesso também pela REST e
-- quebraria o perfil, o feed e o ranking. Sem a extensão, o aviso some pela raiz e
-- tabela nova não nasce com ele.
--
-- RLS e grants das tabelas não mudam: a Data API REST segue igual.

drop extension if exists pg_graphql;
