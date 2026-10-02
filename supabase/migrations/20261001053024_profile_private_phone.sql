-- Telefone para o "Abrir no WhatsApp" (SCHEDULING.md §7, M20–M25), na tabela dos dados
-- que só o dono lê. As colunas novas herdam as policies de `profile_private`: a RLS é
-- por linha, e a linha inteira já é só do dono (select, insert e update com
-- `(select auth.uid()) = id`). Nenhum outro jogador lê o número.
--
-- Ler o número de um adversário (M23: só adversários e parceiro de um confronto ativo)
-- fica para quando as partidas estiverem no banco: a regra depende delas. Até lá, o
-- "Abrir no WhatsApp" abre sem destinatário (M24).

alter table public.profile_private
  add column phone text,
  -- Quando o jogador marcou a caixa de consentimento (M21, LGPD art. 8º): registro de
  -- que o número foi salvo com a finalidade aceita
  add column phone_consented_at timestamptz;

-- Só números do Brasil no MVP, em E.164: +55, DDD de dois dígitos sem zero e 8 ou 9
-- dígitos. A action valida antes; o check garante o formato a quem grava direto pela
-- Data API, sem passar pela tela.
alter table public.profile_private
  add constraint profile_private_phone_format
  check (phone is null or phone ~ '^\+55[1-9]{2}[0-9]{8,9}$');

-- Sem consentimento, o número não é salvo (M21). E apagar o número apaga também o
-- consentimento (M25): os dois são nulos juntos ou preenchidos juntos.
alter table public.profile_private
  add constraint profile_private_phone_consent
  check ((phone is null) = (phone_consented_at is null));
