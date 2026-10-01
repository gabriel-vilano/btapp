-- Dados pessoais do jogador que só ele lê (ENG-94): por enquanto, a data de nascimento.
--
-- Por que fora de `profiles`: a policy de leitura de `profiles` é `using (true)` para
-- autenticados (o perfil é visível para qualquer jogador com conta, PROFILE.md PF20), e
-- a RLS protege linhas, não colunas. Uma coluna nova em `profiles` sairia para qualquer
-- jogador logado pela Data API. Aqui a linha inteira é só do dono.
--
-- O nome é genérico de propósito: o telefone para o WhatsApp (SCHEDULING.md M23) entra
-- nesta mesma tabela, com as mesmas policies.
--
-- `id` aponta para auth.users, não para profiles: a linha não depende de o passo 2 do
-- cadastro ter criado o perfil, e some junto com a conta (cascade, como em profiles).

create table public.profile_private (
  id uuid primary key references auth.users (id) on delete cascade,
  birth_date date,
  updated_at timestamptz not null default now()
);

-- O event trigger `ensure_rls` já liga a RLS em tabela nova; fica explícito para a
-- proteção não depender dele.
alter table public.profile_private enable row level security;

-- Menor privilégio: o Supabase dá todos os privilégios de tabela nova a `anon` e
-- `authenticated`. Sem login, nada; logado, só ler, criar e editar a própria linha.
-- Sem DELETE (apagar a data é gravar null) e sem TRUNCATE, que não passa pela RLS.
revoke all on table public.profile_private from anon, authenticated;
grant select, insert, update on table public.profile_private to authenticated;

-- `(select auth.uid())` em vez de `auth.uid()`: o Postgres avalia uma vez por consulta,
-- não uma por linha (recomendação do Supabase para policies).
create policy "Dono lê os próprios dados privados"
  on public.profile_private for select to authenticated
  using ((select auth.uid()) = id);

create policy "Dono cria os próprios dados privados"
  on public.profile_private for insert to authenticated
  with check ((select auth.uid()) = id);

-- O `with check` impede trocar o `id` da própria linha pelo de outro jogador
create policy "Dono edita os próprios dados privados"
  on public.profile_private for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
