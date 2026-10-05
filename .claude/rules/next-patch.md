---
paths:
  - "patches/**"
  - "package.json"
  - "next.config.ts"
---

# Next com patch: tela em branco depois de clicar num link

**Sintoma:** a URL muda, mas a área de conteúdo fica vazia: sem skeleton, sem erro e sem nada no console. Só um reload recupera. Acontece quando o clique (ou o toque, no celular) num `<Link>` pega o prefetch dele ainda em voo. No E2E, aparecia como teste instável que não achava o link ou o cabeçalho da tela seguinte.

**Causa:** bug do roteador do Next 16 ([vercel/next.js#98684](https://github.com/vercel/next.js/issues/98684)). Em `createCacheNodeForSegment` (`ppr-navigations.js`), a entrada do cache em `Pending` vira uma promise comum que pode resolver para `null`, e o React renderiza o segmento vazio.

**Solução:** `patches/next+16.2.2.patch`, aplicado pelo `patch-package` no `postinstall`, trata a entrada `Pending` como cache miss. O patch vale só para a versão exata do `next`: antes de qualquer upgrade, ver a issue "Remover o patch do Next quando a vercel/next.js#98684 for corrigida" no Linear (remover o patch quando o Next corrigir, ou refazê-lo para a versão nova).

Origem: PR #142 (correção do E2E instável que revelou o bug).
