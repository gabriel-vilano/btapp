# Fluxo: Plan

Desenhar a experiência mobile de uma feature **antes do código**: decidir padrões, ergonomia e prioridade de conteúdo, e entregar um brief que a issue de ENG consiga implementar.

Leia antes: `references/designer-lenses.md`.

---

## 1. Entender a feature

Plataforma, usuário e DS já estão no `SKILL.md`. Do resto, procure primeiro na issue e nas specs; pergunte só o que faltar, 2 ou 3 perguntas por vez:

1. Qual é a feature, e qual a **única** coisa que o jogador vem fazer nela?
2. Tela nova, ou parte de uma tela que já existe? Em qual aba ela mora (`NAVIGATION.md`)?
3. Em que momento o jogador chega: na quadra, logo depois do jogo, em casa, avisado por notificação? Primeira vez ou uso semanal?

Confirme o entendimento em 2 ou 3 linhas antes de seguir.

## 2. Ler as decisões da spec

Liste as regras que já valem para esta feature (aba, rota, cabeçalho, estados, componentes da seção 11 da `NAVIGATION.md`, tokens). Elas entram no brief como **restrições**, não como forks.

## 3. Priorizar o conteúdo

Antes de qualquer layout (lente do Wroblewski, `references/content-and-attention.md`):

1. Liste tudo o que a feature poderia mostrar ou fazer.
2. Ordene: o propósito principal, depois o secundário, depois o resto.
3. Para cada item de baixo: manter, adiar (atrás de um toque, mais abaixo, outra tela) ou cortar.

Apresente a lista com os cortes e adiamentos, com a lente pelo nome ("o ponto do Wroblewski: a tela obriga a perguntar *o que merece este espaço?*"). **Numa conversa, espere a confirmação** antes dos padrões: o layout depende disso. Numa sessão autônoma, a priorização é a primeira pergunta do comentário.

## 4. Escolher os padrões: forks

Para cada decisão importante, confira `references/design-forks.md` e a lista do passo 2. Se a spec já decidiu, é restrição. Se não, é fork: opções com trade-off, e o Gabriel escolhe.

Ordem típica:

- **Navegação** dentro da feature (`navigation.md`, forks 1 e 2)
- **Ação primária**: qual é e onde fica (`reach-and-ergonomics.md`, fork 4)
- **Layout do conteúdo**: lista, grade ou carrossel; densidade (forks 5 e 7)
- **Formulário**, se houver (`forms-and-input.md`, fork 6)
- **Modelo de interação**: gesto ou controle visível; o que se move e por quê (`touch-gesture-motion.md`, fork 3)
- **Ações destrutivas ou raras**: onde ficam (fork 8)

Atribua cada argumento à lente ("a taxonomia do Rausch diz…", "o Hoober contestaria porque…"). No ofício moderno, a voz pelo nome.

**Numa conversa:** no máximo dois forks por vez, e espere a escolha de cada um antes do próximo. **Numa sessão autônoma:** todos os forks no comentário de Needs Decision, do mais caro de refazer ao mais barato, e a sessão para.

## 5. Testar com as outras lentes

Antes do brief, passe o desenho pelas lentes que não lideraram, principalmente a do Budiu. Carregue `references/touch-gesture-motion.md` aqui em qualquer feature: o critério de movimento precisa dele.

- **Hoober:** funciona em pega com as duas mãos ou apoiada, não só com uma mão confortável?
- **Budiu:** alguma escolha se apoia em moda e não em evidência? Camadas empilhadas?
- **Ofício moderno:** o que se move e o que cada transição comunica (Allen)? Parece nativo e rápido (de With)? A personalidade combina com um app de competição?
- **HIG/M3:** conflito de convenção? Algo depende de padrão em transição?

Confira as armadilhas do `SKILL.md`.

## 6. Brief de design mobile

O entregável, para a spec ou para o comentário que gera as issues de ENG. Curto.

```markdown
## Brief mobile: <feature>

**Propósito:** <a única coisa>
**Onde mora:** <aba e rota, com a regra da spec>
**Contexto de uso:** <quem, em que situação>

**Prioridade de conteúdo:** 1. <principal> 2. <secundário> 3. …
Adiado: … · Cortado: …

**Restrições da spec:** <regras que já valem, com o número>

**Decisões de estrutura** (fork escolhido e por quê):
- Navegação: <escolha> — <motivo e lente>
- Ação primária: <qual> em <onde> — <motivo>
- Layout do conteúdo: <escolha> — <motivo>
- Formulário: <abordagem, se houver>
- Interação: <gestos, com pista e alternativa visível>
- Destrutivas e raras: <onde, e a proteção>

**Ergonomia:** <o que fica em qual zona>
**Movimento:** <transições principais e o que cada uma comunica, com os tokens `--motion-*`>
**Estados:** vazio, carregando e erro, com o próximo passo de cada um

**Perguntas abertas e riscos:** …
**Padrões em transição:** <iOS 26 / M3 Expressive, se algo depender>
```

**Entrega:** o brief diz a decisão de design; a implementação é da issue de ENG e da skill de implementação que existir no repo (ex.: `mobile-nativo`).

## Critérios de pronto

- [ ] Feature, aba e momento de uso entendidos, com o mínimo de perguntas
- [ ] Regras da spec listadas como restrições
- [ ] Conteúdo priorizado, com algo cortado ou adiado
- [ ] Cada padrão decidido como fork explícito, ou citado como restrição da spec
- [ ] Desenho testado com as lentes que não lideraram e com as armadilhas
- [ ] Brief entregue, com as lentes atribuídas
