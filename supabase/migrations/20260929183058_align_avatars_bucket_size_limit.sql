-- Limite de tamanho do avatar alinhado nas três camadas em 1MB (antes: tela 5MB,
-- bucket 2MB, body da server action 1MiB). A tela redimensiona a foto para no máximo
-- 512px antes do envio, então o arquivo real fica bem abaixo disso.
-- Mesmo valor de AVATAR_MAX_BYTES (src/lib/validations.ts): 1.000.000 bytes, não 1MiB,
-- para sobrar espaço no body de 1MiB da server action para o resto do form.
update storage.buckets
set file_size_limit = 1000000
where id = 'avatars';
