-- Bucket público serve o download pela URL pública sem passar por RLS, então este
-- SELECT amplo não é necessário para exibir avatares. O único efeito dele era deixar
-- qualquer cliente, sem login, listar o bucket inteiro e, com isso, todos os user_ids
-- (Supabase advisor 0025, public_bucket_allows_listing).
-- O upsert do upload continua coberto pelo SELECT restrito à pasta do próprio usuário.
drop policy if exists "Avatar público para leitura 1oj01fe_0" on storage.objects;
