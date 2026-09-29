-- Nome e sobrenome separados (ENG-98). A tabela de classificação mostra o nome
-- abreviado ("João Pedro S."), e com um campo só não dá para saber onde termina o
-- primeiro nome de "João Pedro Silva".
--
-- `full_name` continua existindo e o app grava os três juntos. Coluna gerada foi
-- descartada: o Postgres não converte uma coluna comum em gerada (seria drop + add),
-- e o upsert do perfil, que hoje escreve `full_name`, passaria a falhar.
--
-- As colunas novas nascem sem `not null`: um perfil antigo com nome de uma palavra
-- só não tem sobrenome, e um valor inventado seria pior que a ausência.
-- A RLS de `profiles` é por linha, então as colunas novas seguem as mesmas policies
-- de leitura (autenticados) e escrita (só o dono).

alter table public.profiles
  add column first_name text,
  add column last_name text;

-- Usuários que já existem: a primeira palavra vira o nome e o resto, o sobrenome.
-- Mesma regra do `splitFullName` (src/lib/names.ts), usado para os metadados.
update public.profiles
set
  first_name = nullif(substring(btrim(full_name) from '^\S+'), ''),
  last_name = nullif(
    regexp_replace(btrim(regexp_replace(btrim(full_name), '^\S+', '')), '\s+', ' ', 'g'),
    ''
  )
where first_name is null;
