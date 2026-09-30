-- Todo jogador tem @username (ENG-101): o perfil mora em /jogadores/[username], e
-- quem pulava o passo 2 do cadastro ficava sem endereço de perfil. Daqui em diante
-- o app grava a sugestão mesmo quando o jogador pula; esta migration preenche quem
-- já ficou sem.
--
-- Mesma regra do `usernameBaseFromName` (src/lib/username.ts): nome e sobrenome
-- juntos, sem acento, sem espaço e sem partículas (menos a primeira palavra), só
-- [a-z0-9], cortado em 20. Base com menos de 3 caracteres vira "jogador". Em uso,
-- ganha número a partir do 2, cortando a base para caber nos 20.
--
-- Os acentos saem com `translate`, não com a extensão `unaccent`, para não instalar
-- extensão só por isso. Cobre as letras latinas acentuadas; o `normalize` do app
-- cobre mais (qualquer marca combinante), mas a diferença só aparece em nomes com
-- letras fora dessa lista, que aqui caem no "jogador".
-- As maiúsculas acentuadas estão na lista porque o `lower()` com collation C não
-- converte letra fora do ASCII.
--
-- A RLS de `profiles` não muda. A migration roda como dono da tabela.

do $$
declare
  profile record;
  base text;
  candidate text;
  n integer;
begin
  for profile in
    select
      id,
      coalesce(nullif(btrim(concat_ws(' ', first_name, last_name)), ''), full_name) as name
    from public.profiles
    where username is null
    order by created_at, id
  loop
    select coalesce(string_agg(
      regexp_replace(
        lower(translate(
          word,
          'ÁÀÂÃÄÅáàâãäåÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñÝýÿ',
          'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNnYyy'
        )),
        '[^a-z0-9]', '', 'g'
      ),
      '' order by position
    ), '')
    into base
    from unnest(regexp_split_to_array(btrim(profile.name), '\s+')) with ordinality as w(word, position)
    where position = 1 or lower(word) not in ('de', 'da', 'do', 'dos', 'das', 'e');

    base := left(base, 20);
    if length(base) < 3 then
      base := 'jogador';
    end if;

    n := 1;
    candidate := base;
    while exists (select 1 from public.profiles where username = candidate) loop
      n := n + 1;
      candidate := left(base, 20 - length(n::text)) || n::text;
    end loop;

    update public.profiles set username = candidate where id = profile.id;
  end loop;
end;
$$;
