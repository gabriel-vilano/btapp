# Fluxo: Audit

Revisar uma tela que já existe pelas oito lentes, separar o que a spec já decidiu do que ficou decidido em silêncio, e entregar achados por prioridade.

Leia antes: `references/designer-lenses.md`.

---

## 1. O que está sendo revisado

- **Código** (página em `app/`, componentes em `src/components/`, stories): leia a estrutura e julgue as **decisões de design**, não a qualidade do código.
- **Story ou print:** avalie o que está visível e diga o que não dá para julgar (movimento, estados, alcance num aparelho real).
- **Só a spec:** dá para auditar a decisão escrita, mas diga que não viu a tela.

**Escopo.** Se pediram uma tela ou um problema, audite só isso. Diga o escopo em uma linha antes de avaliar.

## 2. Contexto

Plataforma, usuário e DS já estão no `SKILL.md`. Falta uma coisa: **para que serve esta tela, a única coisa que o jogador vem fazer aqui?** Procure na spec da tela (a seção dela costuma abrir com a pergunta que responde). Só pergunte se a spec não disser.

## 3. Ler as decisões da spec

Antes de qualquer lente, liste as regras da spec que tocam esta tela (ex.: para a aba Jogos, N12 a N24 e N26 da `NAVIGATION.md`) e o que os MDX dos componentes principais fixam. Essa lista é o filtro do passo 5: tudo o que estiver nela é "Já decidido" ou "Observação com fonte", nunca fork.

## 4. Passar pelas lentes

Use a tabela de peso de `designer-lenses.md`: as 2 ou 3 lentes do assunto lideram, mas todas as oito passam. A pergunta de cada uma:

- **Hoober:** funciona em qualquer pega? A ação primária é alcançável? (`reach-and-ergonomics.md`)
- **Hurff:** o que está nas zonas caras, e deveria estar? (`reach-and-ergonomics.md`)
- **Wroblewski:** houve priorização de verdade, ou é a tela de desktop encolhida? E os campos? (`content-and-attention.md`, `forms-and-input.md`)
- **Clark:** alvos de 48px? Gestos com pista? Controle onde o próprio conteúdo podia ser o controle? (`touch-gesture-motion.md`)
- **Rausch:** o padrão de navegação casa com a estrutura do conteúdo? Overlays usados certo? (`navigation.md`)
- **Budiu:** algo justificado por moda e não por evidência? Camadas empilhadas? Os títulos sozinhos contam a tela? (`content-and-attention.md`)
- **Ofício moderno:** o movimento comunica (Allen)? Parece nativo e rápido (de With)? Se a tela é densa, foi destilada ou só encolhida (Nelson)? (carregue `touch-gesture-motion.md` antes desta)
- **HIG/M3:** conflito de convenção? Gesto reservado ao sistema? Dependência de padrão em transição (iOS 26, M3 Expressive)? (`navigation.md`)

Atribua cada achado à lente pelo nome ("a preocupação do Hoober aqui…", "pela taxonomia do Rausch…"). No ofício moderno, diga qual das três vozes. Raciocínio com nome ensina; lista anônima é opinião.

Passe também pela lista de armadilhas do `SKILL.md`.

## 5. Forks em silêncio

A parte mais valiosa. Para cada escolha de design importante da tela, confira `references/design-forks.md`: era um fork em que outra opção serviria melhor?

Classifique cada um:

1. **Já decidido por escrito** → vai para "Já decidido", com a fonte. Se uma lente discorda, vai para "Observações com fonte". Conta como decisão escrita: a regra da spec (lista do passo 3), o `docs/TOKENS.md` e o MDX do componente (a variante, o estado ou o uso que ele fixa, e a seção "Decisões de design").
2. **Decidido só no código, sem nada escrito** → fork. Nomeie a decisão tomada, mostre a alternativa e o trade-off, e o sinal de qual serve ao BT App.
3. **Depende de algo que só o Gabriel sabe** (domínio de Beach Tennis, prioridade de produto) → fork, com a pergunta explícita.

Fork decidido em silêncio não é automaticamente errado. Só deveria ter sido uma decisão.

## 6. Entregar

Formato para comentário no Linear ou corpo de PR. Sem arquivo no repo.

```markdown
## Audit mobile: <tela>

**Para que serve:** <a única coisa> (<regra ou seção da spec>)
**Escopo:** <o que foi visto: código, story, print, spec>

### Lentes

| Lente | Leitura |
| --- | --- |
| Hoober | forte / atenção / problema: <uma linha> |
| … (as oito) | |

### Achados (por impacto)

1. **[Crítico] <título>** — <o problema>. *Lente:* <qual>. *Por que importa:* <impacto no jogador>. *Mudança de design:* <o quê, não o código>.
2. **[Importante] …**
3. **[Polimento] …**

### Já decidido pela spec

- <decisão> (<regra>): <por que a auditoria não reabre>.

### Observações com fonte

- <regra> diz X; <lente> argumenta Y (<fonte>). Reabrir se <sinal: métrica do beta, dado novo>.

### Forks para decidir

<cada um no formato Needs Decision do SKILL.md>

### O que não deu para avaliar

<movimento, estados, alcance real, conteúdo com dado real…>
```

Ordem dos achados por impacto no jogador: **Crítico** (bloqueia ou degrada muito a tarefa principal), **Importante** (atrito real), **Polimento** (refinamento). Seção sem conteúdo some, menos "Já decidido" e "O que não deu para avaliar", que dizem ao leitor que você olhou.

**Numa conversa:** apresente e pare; pergunte antes de seguir. **Numa sessão autônoma:** os forks vão para Needs Decision na issue (`docs/AGENT_WORKFLOW.md`); os achados sem fork viram leitura no PR ou comentário, nunca issue nova sem o Gabriel pedir.

## 7. Próximo passo

Depois que o Gabriel ler: replanejar uma tela problemática (modo Plan) ou levar as mudanças para implementação, com a skill de implementação que existir no repo (ex.: `mobile-nativo`). Esta skill identifica a mudança de design; não escreve o código.

## Critérios de pronto

- [ ] Escopo e propósito da tela estabelecidos, com a fonte na spec
- [ ] Regras da spec listadas antes das lentes
- [ ] As oito lentes passadas, com peso pelo assunto
- [ ] Armadilhas conferidas
- [ ] Nenhuma decisão da spec reaberta como fork
- [ ] Forks no formato Needs Decision, com sinal
- [ ] Achados por impacto e atribuídos a lentes
- [ ] Limites da auditoria declarados
