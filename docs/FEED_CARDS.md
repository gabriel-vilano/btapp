# FEED_CARDS.md — LetzPlay
**Escopo:** Especificação de produto e design dos cards do activity stream  
**Versão:** 3.0  
**Status:** Aprovado para implementação  
**Gerado em:** Abril 2026  
**Contexto:** Este documento consolida todas as decisões tomadas nas sessões de design review, análise de wireframes e iterações de componentes. Substitui `letzplay-feed-cards-prd.md` e `letzplay-feed-cards-prd-v2.md`.

> Este documento é a fonte de verdade para implementação dos componentes React do feed. As decisões de dados que os cards assumem estão na seção 11. Os tipos que materializam o contrato estão em `src/types/feed.ts`.

---

## 1. Contexto de produto

### O feed como activity stream
O feed do LetzPlay é um **activity stream** — modelo Strava, não Instagram. O conteúdo é gerado automaticamente por eventos do sistema (resultados, inscrições, amizades, movimentações de ranking), não por publicações manuais dos usuários. Não há UGC (user-generated content) no MVP.

### JTBD associados ao feed
- **Job 1** — Encontrar competição: descoberta social via inscrições de amigos
- **Job 2** — Saber onde estou no ranking: resultados e movimentações
- **Job 3** — Preparar-me para um confronto: card de confronto com H2H
- **Job 4** — Acompanhar amigos no BT: feed geral de atividades

### Tipos de card — visão geral

| Tipo | Gatilho | JTBD primário |
|---|---|---|
| Resultado de partida | Placar confirmado | Job 2 |
| Confronto definido | Chave sorteada/divulgada | Job 3 |
| Inscrição em competição | Inscrição confirmada | Job 1 |
| Nova amizade | Conexão confirmada | Job 4 |
| Movimentação no ranking | Ranking atualizado | Job 2 |

---

## 2. Estrutura base — compartilhada por todos os cards

Todo card tem três zonas fixas. Esta estrutura é imutável entre tipos.

```
┌─────────────────────────────────────────────────────┐
│  CABEÇALHO DE CONTEXTO                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  CORPO DO EVENTO                                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│  RODAPÉ DE AÇÕES                                    │
└─────────────────────────────────────────────────────┘
```

### 2.1 Cabeçalho de contexto

Dois padrões dependendo do tipo de card:

**Padrão A — Cabeçalho de organização** (resultado, confronto, inscrição)
```
[Avatar org 40px]  Fase · Nome da competição — Categoria
                   @username-org · há X tempo · [Seguir]
```
- Fase: `--text-label-md`, `--color-foreground-accent` — "Rodada 3", "QF", "Final"
- Nome da competição: `--text-body-md`, `font-weight-bold`, `--color-foreground-primary`, truncado com ellipsis após 1 linha
- Categoria: gênero + nível + idade, com a modalidade só em simples — "Masculino B", "Mista C 40+", "Masculino B · Simples" (ver 11.5)
- @username + timestamp: `--text-label-md`, `--color-foreground-secondary`
- Botão Seguir: **fora do MVP** (ver 11.2). Quando voltar: `--text-label-md`, `--color-foreground-accent`, visível apenas quando o usuário não segue a org

**Padrão B — Cabeçalho de jogador** (amizade, ranking)
```
[Avatar jogador 40px]  Nome do jogador + ação descritiva
                       @username · há X tempo
```
- Nome + ação: `--text-body-md`, `--color-foreground-primary` — ex: "Lucas Silva subiu no ranking"

**Textos neutros de gênero.** O cadastro não coleta gênero, então nenhum texto do feed flexiona pelo jogador: "agora são amigos" em vez de "tornou-se amigo", "Assumiu a liderança" em vez de "Líder". Verbos ("subiu", "inscreveu-se") já são neutros. Texto novo segue a mesma regra.
- @username + timestamp: `--text-label-md`, `--color-foreground-secondary`

### 2.2 Rodapé de ações — idêntico em todos os cards

```
[♡ Curtir]   [💬 Comentar]   [↗ Compartilhar]
```

**Especificações:**
- Ícones Phosphor: `Heart`, `ChatCircle`, `ShareNetwork` — `--dimension-icon-md` (24px)
- Labels: `--text-label-lg`, `--color-foreground-secondary`
- **Curtir:** toggle — `Heart` outline em repouso, `Heart` filled em `--color-foreground-accent` quando ativo
- **Comentar:** navega para tela de detalhamento com seção de comentários — não expande inline
- **Compartilhar:** abre sheet nativo de compartilhamento
- **Contagem de interações:** dinâmica — label fixo quando `count === 0`, número substituindo o label quando `count > 0`. No MVP, exibir sempre o label fixo (contagem é pós-MVP)
- Altura mínima do rodapé: `--dimension-tap-target-minimum` (48px)
- Sem avatares de quem curtiu no MVP

### 2.3 Tokens de layout dos cards

| Propriedade | Token | Valor |
|---|---|---|
| Background do feed | `--color-background-secondary` | #F7F7F7 |
| Background do card | `--color-background-primary` | #FFFFFF |
| Border radius do card | `--radius-card` | 16px |
| Sombra | `--shadow-subtle` | — |
| Gap entre cards | `--spacing-150` | 12px |
| Margin horizontal do feed | `--spacing-page-margin` | 16px |
| Padding interno do card | `--spacing-200` | 16px |
| Gap entre elementos internos | `--spacing-100` | 8px |
| Gap entre seções do corpo | `--spacing-150` | 12px |

---

## 3. Sistema de placar unificado

> **Decisão crítica de sistema:** o tamanho tipográfico do placar é sempre o mesmo, independente do formato da partida, do resultado (vitória, derrota, WO, desistência) ou do número de sets. O que varia é a grade que organiza os números e a cor que comunica quem venceu cada set.

### 3.1 Tipografia do placar

| Elemento | Token tipográfico | Cor — vencedor do set | Cor — perdedor do set |
|---|---|---|---|
| Números do placar | `--text-display-sm` (40px), bold | `--color-foreground-primary` | `--color-foreground-secondary` |
| Labels de coluna (Set 1, Set 2, STB) | `--text-label-md` | `--color-foreground-secondary` | `--color-foreground-secondary` |

**Regra de cor dos números:** o jogador/dupla que venceu aquele set específico tem seu placar em `--color-foreground-primary`. O perdedor do set tem seu placar em `--color-foreground-secondary`. Isso é independente do resultado final da partida.

### 3.2 Grades por formato

**1 set — sem labels de coluna**
```
     6      ← foreground-primary (venceu o set)
     4      ← foreground-secondary (perdeu o set)
```

**2 sets — com labels de coluna, sem STB**
```
   Set 1   Set 2
     6       6    ← foreground-primary em ambas as colunas
     4       3    ← foreground-secondary em ambas
```

**3 sets com super tiebreak — com labels incluindo STB**
```
   Set 1   Set 2   STB
     6       4      10   ← foreground-primary, foreground-secondary, foreground-primary
     4       6       7   ← foreground-secondary, foreground-primary, foreground-secondary
```

**WO e desistência — placar em cor secundária**
```
     0      ← foreground-secondary (número não é informação)
     0      ← foreground-secondary
```
Quando a desistência acontece com sets parciais jogados, esses sets usam a regra de cor normal — apenas os sets não jogados ficam em secundário.

### 3.3 Labels de resultado

Todo card de resultado exibe um label ao lado do nome de cada jogador/dupla:

| Situação | Label | Cor do label | Background do label |
|---|---|---|---|
| Vencedor normal | VITÓRIA | `--color-foreground-success` | `--color-background-success-subtle` |
| Perdedor normal | DERROTA | `--color-foreground-attention` | `--color-background-attention-subtle` |
| Perdedor por WO | W.O. | `--color-foreground-attention` | `--color-background-attention-subtle` |
| Perdedor por desistência | Desistência | `--color-foreground-attention` | `--color-background-attention-subtle` |

**Regras dos labels:**
- Tipografia: `--text-label-md`, `font-weight-bold`
- Border radius: `--radius-sm`
- Padding: `--spacing-50` vertical, `--spacing-100` horizontal
- **O vencedor aparece sempre na linha superior** — independente de quem é o usuário logado
- Sem ícones de checkmark (✓) ou X — os labels substituem completamente essa função

---

## 4. Card — Resultado de partida

**JTBD:** Job 2  
**Gatilho:** placar confirmado por ambos os lados (ranking) ou registrado pela organização (torneio)  
**Variações:** 1 set simples, 2 sets simples, 3 sets duplas, WO, desistência

### 4.1 Anatomia

```
┌─────────────────────────────────────────────────────┐
│ [Logo org]  Rodada 3 · Ranking BH — Masculino B ·…  │
│             @arenaRM · há 2h · Seguir               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [avt 32px]  Lucas Silva               [VITÓRIA]   │
│                                                     │
│                    6   ← foreground-primary         │
│                    4   ← foreground-secondary       │
│                                                     │
│  [avt 32px]  Pedro Henrique            [DERROTA]   │
│                                                     │
│  📅 13/04/2026, Segunda às 19:00                    │
│  📍 Arena RM – Beach · Nova Lima/MG                 │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  ⚖️  Já jogaram 2 vezes, veja o H2H         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ♡ Curtir   💬 Comentar   ↗ Compartilhar            │
└─────────────────────────────────────────────────────┘
```

### 4.2 Especificações de elementos

**Identidade dos jogadores:**
- Avatar: circular, 32px
- Para duplas: dois avatares sobrepostos (stack com offset de 8px), mesmo tamanho
- Nome: `--text-body-md`, `font-weight-bold`, `--color-foreground-primary` (ambos — a cor do label é que comunica vitória/derrota, não a cor do nome)
- Para duplas: nomes separados por ` · ` — apenas primeiro nome de cada jogador

**Metadados (data, local):**
- Ícones: `Calendar`, `MapPin` Phosphor — 16px, `--color-foreground-secondary`
- Texto: `--text-label-md`, `--color-foreground-secondary`

**Botão H2H:**
- Estilo: ghost button — borda `--color-border-subtle`, background transparente
- Ícone: `Scales` Phosphor — 16px
- Texto: `--text-label-lg`, `--color-foreground-accent`
- Alinhamento: centralizado
- **Exibição condicional:** aparece apenas quando `h2h_count >= 1`. Quando é o primeiro confronto, o botão não existe — sem placeholder, sem "0 partidas anteriores"
- **Ausente no card de WO:** WO não exibe H2H
- Tap: navega para página de H2H entre os dois lados

### 4.3 Variação — WO

```
┌─────────────────────────────────────────────────────┐
│ [Logo org]  Rodada 3 · Ranking BH — Masculino B ·…  │
│             @arenaRM · há 2h                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [avt]  Lucas Silva                    [VITÓRIA]   │
│                                                     │
│                 Vitória por W.O.                    │
│                                                     │
│  [avt]  Pedro Henrique                  [W.O.]     │
│                                                     │
│  Jogo encerrado por W.O.                            │
│  📅 13/04/2026, Segunda às 19:00                    │
│  📍 Arena RM – Beach · Nova Lima/MG                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ♡ Curtir   💬 Comentar   ↗ Compartilhar            │
└─────────────────────────────────────────────────────┘
```

- **Sem placar.** Não houve jogo, então a área do placar mostra só o rótulo "Vitória por W.O." (`--text-title-sm`, `font-weight-bold`, `--color-foreground-secondary`). Um 0/0 leria como placar real
- O rótulo segue o ponto de vista do card. O card de resultado é sempre lido do lado vencedor (vencedor em cima), por isso "Vitória por W.O."; um card lido do lado de quem perdeu usaria "Derrota por W.O."
- Texto "Jogo encerrado por W.O.": `--text-label-md`, `--color-foreground-secondary`
- Sem botão H2H

### 4.4 Variação — Desistência

Mesma estrutura do WO com duas diferenças:
- Label do perdedor: "Desistência"
- Texto: "Jogo encerrado por desistência"
- Se houver sets parciais jogados: esses sets usam cor normal (foreground-primary/secondary conforme quem venceu). Apenas o placeholder de sets não jogados fica em foreground-secondary
- Se nenhum set foi completado: segue o WO, sem placar. A área mostra só o rótulo "Vitória por desistência"

---

## 5. Card — Confronto definido

**JTBD:** Job 3  
**Gatilho:** chave sorteada pela organização e confrontos divulgados  
**Variações:** simples, duplas

### 5.1 Anatomia — Simples

```
┌─────────────────────────────────────────────────────┐
│ [Logo org]  QF · Torneio Sunset — Masculino B ·…    │
│             @arenasunset · há 3h · Seguir            │
├─────────────────────────────────────────────────────┤
│                                                     │
│   [avt 48px]          VS          [avt 48px]        │
│   Lucas                           Pedro             │
│   274 jogos                       188 jogos         │
│                                                     │
│   [▽ Torcer]                      [▽ Torcer]        │
│                                                     │
│   ████████████████░░░░░░░░░░                        │
│   12 torcendo                     8 torcendo        │
│                                                     │
│   📅 20/04/2026, Sábado às 14:00                    │
│   📍 Arena Sunset · Carandaí/MG                     │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  ⚖️  Já jogaram 3 vezes, veja o H2H         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ♡ Curtir   💬 Comentar   ↗ Compartilhar            │
└─────────────────────────────────────────────────────┘
```

### 5.2 Anatomia — Duplas

```
┌─────────────────────────────────────────────────────┐
│ [Logo org]  QF · Torneio Sunset — Masculino B       │
│             @arenasunset · há 3h · Seguir            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [avt][avt]        VS        [avt][avt]             │
│  Lucas · Rafael               Pedro · Thiago        │
│  274 jogos · 310 jogos        188 jogos · 220 jogos │
│                                                     │
│   [▽ Torcer]                  [▽ Torcer]            │
│                                                     │
│   ████████████████░░░░░░░░░░                        │
│   12 torcendo                 8 torcendo            │
│                                                     │
│   📅 20/04/2026, Sábado às 14:00                    │
│   📍 Arena Sunset · Carandaí/MG                     │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  ⚖️  Já jogaram 2 vezes, veja o H2H         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ♡ Curtir   💬 Comentar   ↗ Compartilhar            │
└─────────────────────────────────────────────────────┘
```

### 5.3 Especificações de elementos

**"VS":**
- Tipografia: `--text-title-md`, `--color-foreground-secondary`
- Centralizado horizontalmente entre os dois lados

**Nomes dos jogadores:**
- Usar **apenas o primeiro nome** — o avatar já ajuda na identificação
- Para duplas: `Primeiro1 · Primeiro2`
- Tipografia: `--text-body-md`, `font-weight-bold`, `--color-foreground-primary`

**Estatísticas abaixo dos nomes:**
- Simples: "N jogos" — número total de jogos do jogador
- Duplas: "N jogos · M jogos" — jogos de cada jogador separados por ` · `
- Tipografia: `--text-label-md`, `--color-foreground-secondary`
- **Sem @username no card de confronto** — espaço insuficiente para duplas

**Avatares:**
- Simples: avatar circular único, 48px
- Duplas: dois avatares sobrepostos com offset de 8px, 48px cada

**Botão Torcer:**
- Variante: secondary (outline)
- Ícone: `CaretDown` Phosphor (triângulo para baixo) — simboliza torcida/bandeira
- Estado ativo: fundo `--color-background-accent`, texto `--color-foreground-on-accent`
- Largura: ~45% da viewport, um botão por lado
- Altura mínima: `--dimension-tap-target-minimum` (48px)

**Barra de torcida:**
- Altura: 4px
- Fundo base: `--color-background-tertiary`
- Preenchimento: `--color-background-accent` proporcional ao lado com mais torcida
- Labels: "N torcendo" em `--text-label-md`, `--color-foreground-secondary`, alinhados às extremidades

**Botão H2H:**
- Mesma especificação do card de resultado
- Posicionamento: abaixo de data/local
- Mesma lógica condicional: aparece apenas quando `h2h_count >= 1`

**Comportamento temporal:**
- O card de confronto permanece no feed após o resultado ser registrado
- Resultado aparece acima (mais recente); confronto permanece abaixo como evento histórico independente

---

## 6. Card — Inscrição em competição

**JTBD:** Job 1  
**Gatilho:** jogador ou dupla confirma inscrição em torneio ou ranking  
**Variações:** simples, duplas

### 6.1 Anatomia — Simples

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [avt 40px]  Lucas Silva inscreveu-se               │
│              @lucas · há 18h                        │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ [Logo  │  Copa BH de Beach Tennis             │  │
│  │  48px] │  Masculino B · Simples               │  │
│  │        │  📅 20 e 21 de maio de 2026          │  │
│  │        │  📍 Arena Sunset · Carandaí/MG       │  │
│  │        │  👥 24 jogadores inscritos           │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ♡ Curtir   💬 Comentar   ↗ Compartilhar            │
└─────────────────────────────────────────────────────┘
```

### 6.2 Anatomia — Duplas

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [avt][avt]  Lucas e Rafael inscreveram-se          │
│              @lucas · há 18h                        │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ [Logo  │  Copa BH de Beach Tennis             │  │
│  │  48px] │  Mista C                             │  │
│  │        │  📅 20 e 21 de maio de 2026          │  │
│  │        │  📍 Arena Sunset · Carandaí/MG       │  │
│  │        │  👥 16 duplas inscritas              │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ♡ Curtir   💬 Comentar   ↗ Compartilhar            │
└─────────────────────────────────────────────────────┘
```

### 6.3 Especificações de elementos

**Cabeçalho do card (padrão B — jogador):**
- Avatares duplas: stack sobreposto com offset de 8px, 40px
- Texto: `--text-body-md`, `--color-foreground-primary`
  - Simples: "[Nome] inscreveu-se"
  - Duplas: "[Nome1] e [Nome2] inscreveram-se"
- @username + timestamp: `--text-label-md`, `--color-foreground-secondary`

**Bloco de competição (container interno):**
- Background: `--color-background-secondary`
- Border radius: `--radius-md` (8px)
- Padding: `--spacing-150` (12px)
- Logo da org: 48px, border radius `--radius-sm`
- Nome do torneio: `--text-body-md`, `font-weight-bold`, `--color-foreground-primary`
- Categoria: `--text-label-md`, `--color-foreground-secondary`
- Data, local, inscritos: `--text-label-md`, `--color-foreground-secondary`
  - Inscritos pela unidade competidora: "16 duplas inscritas" em duplas, "24 jogadores inscritos" em simples (ver 11.4)
  - Ícones: `Calendar`, `MapPin`, `Users` Phosphor — 16px

**Decisão de hierarquia:**
- Nome do torneio e cabeçalho do card usam o mesmo tamanho de fonte (`--text-body-md`)
- A diferenciação é feita pela cor: o bloco interno usa `--color-background-secondary` como container, destacando visualmente o torneio como entidade referenciada

**Agrupamento de dupla:**
- Quando dois jogadores de uma dupla se inscrevem juntos, gera **um único card** com ambos os nomes — não dois cards individuais

---

## 7. Card — Nova amizade

**JTBD:** Job 4  
**Gatilho:** conexão de amizade bilateral confirmada entre dois jogadores

### 7.1 Anatomia

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [🤝 40px]  Lucas Silva e Pedro Henrique            │
│             agora são amigos                        │
│             @lucas · há 1 dia                       │
│                                                     │
│  ┌──────────────────┐   ┌──────────────────────┐   │
│  │   [avt 40px]     │   │    [avt 40px]         │   │
│  │   Lucas Silva    │   │    Pedro Henrique      │   │
│  │   @lucas         │   │    @pedro              │   │
│  └──────────────────┘   └──────────────────────┘   │
│                                                     │
│  [+ Adicionar Pedro]                                │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ♡ Curtir   💬 Comentar   ↗ Compartilhar            │
└─────────────────────────────────────────────────────┘
```

### 7.2 Especificações de elementos

**Cabeçalho:**
- Ícone de handshake: 40px, `--color-foreground-secondary` — substitui o avatar
- Texto: `--text-body-md`, `--color-foreground-primary` — "[Nome1] e [Nome2] agora são amigos"
- Padrão: "@username · há X tempo" — consistente com todos os outros cards

**Mini-cards de perfil:**
- Background: `--color-background-secondary` — sem foto de capa no MVP
- Border radius: `--radius-md`
- Largura: ~45% da viewport cada, gap de `--spacing-150`
- Avatar: circular, 40px, centralizado
- Nome: `--text-body-md`, `font-weight-bold`, `--color-foreground-primary`
- @username: `--text-label-md`, `--color-foreground-secondary`
- Tap: navega para perfil do jogador

**Botão "Adicionar":**
- Variante: **primary** — conexão social é ação-chave, mantém destaque visual
- Label: "+ Adicionar [PrimeiroNome]" — personalizado com o nome do jogador que o usuário não conhece
- Largura: fullwidth dentro do padding do card
- **Lógica de exibição:**
  - Usuário não é amigo de nenhum dos dois → botão referencia o jogador mais distante socialmente
  - Usuário já é amigo de um → botão referencia apenas o outro
  - Usuário já é amigo dos dois → botão ausente

---

## 8. Card — Movimentação no ranking

**JTBD:** Job 2  
**Gatilho:** atualização de classificação após rodada processada  
**Variações:** subiu, desceu, marco (1ª posição / Top 10 / Finals)  
**Observação:** feature nova — não existe no LetzPlay atual

### 8.1 Princípios de design

Derivados da análise de referências (Strava, Bump, Zigzag, Revolut, Azar):

- **Layout hero centralizado** para todos os três estados — posição atual domina visualmente
- **Cor substitui label** dentro do bloco de dados — verde = subida, vermelho = queda. O texto descritivo fica no cabeçalho ("Lucas subiu no ranking"), não dentro do bloco
- **Delta abaixo da posição** como unidade vertical: você lê "3ª" e imediatamente "▲ 2 posições" de cima para baixo
- **Fundo diferenciado apenas para marcos** — quedas usam fundo branco neutro

### 8.2 Anatomia — Subiu no ranking

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [avt 40px]  Lucas Silva subiu no ranking           │
│              @lucas · há 2h                         │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Ranking BH — Masculino B                  │   │
│  │                                             │   │
│  │               3ª                            │   │
│  │                                             │   │
│  │          ▲ 2 posições                       │   │
│  │                                             │   │
│  │          🏆 520 pontos                      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ♡ Curtir   💬 Comentar   ↗ Compartilhar            │
└─────────────────────────────────────────────────────┘
```

### 8.3 Anatomia — Desceu no ranking

Mesma estrutura. Diferenças:
- Cabeçalho: "Lucas Silva caiu no ranking"
- Delta: "▼ 2 posições" em `--color-foreground-attention`
- Fundo do bloco: `--color-background-primary` — sem cor de fundo para quedas

### 8.4 Anatomia — Marco

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [avt 40px]  Lucas Silva subiu no ranking           │
│              @lucas · há 2h                         │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  fundo: --color-background-accent-subtle    │   │
│  │                                             │   │
│  │  Ranking BH — Masculino B                  │   │
│  │                                             │   │
│  │               1ª                            │   │
│  │                                             │   │
│  │          ▲ 1 posição                        │   │
│  │                                             │   │
│  │          🏆 520 pontos                      │   │
│  │                                             │   │
│  │          [★ Assumiu a liderança]            │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ♡ Curtir   💬 Comentar   ↗ Compartilhar            │
└─────────────────────────────────────────────────────┘
```

### 8.5 Tipografia do bloco de posição

| Elemento | Token | Cor — subiu | Cor — desceu |
|---|---|---|---|
| Posição atual ("3ª") | `--text-display-sm`, bold | `--color-foreground-primary` | `--color-foreground-primary` |
| Delta ("▲ 2 posições") | `--text-label-lg` | `--color-foreground-success` | `--color-foreground-attention` |
| Pontos ("520 pontos") | `--text-label-md` | `--color-foreground-secondary` | `--color-foreground-secondary` |
| Nome do ranking | `--text-label-md`, bold | `--color-foreground-primary` | `--color-foreground-primary` |

**Alinhamento dentro do bloco:** todos os elementos centralizados horizontalmente.

### 8.6 Marcos especiais

| Marco | Badge | Fundo do bloco |
|---|---|---|
| 1ª posição | "★ Assumiu a liderança" | `--color-background-accent-subtle` |
| Entrou no Top 10 | "Top 10" | `--color-background-accent-subtle` |
| Garantiu vaga nas Finals | "Finals" | `--color-background-accent-subtle` |

**Badge de marco:**
- Tipografia: `--text-label-md`, `font-weight-bold`
- Cor do texto: `--color-foreground-accent`
- Background: `--color-background-accent-subtle`
- Border radius: `--radius-sm`
- Posicionamento: centralizado, abaixo dos pontos

**Variação zero não gera card:** se o jogador manteve a mesma posição após atualização do ranking, nenhum evento é gerado no feed.

---

## 9. Estrutura de componentes React

### 9.1 Hierarquia de componentes

```
FeedPage
  └── FeedList (infinite scroll)
        └── ActivityCard (switch por type)
              ├── CardHeader (padrão A ou B)
              ├── ResultCard
              │     ├── ScoreBlock (1set | 2sets | 3sets | wo | retired)
              │     └── H2HButton (condicional)
              ├── MatchCard
              │     ├── VsBlock
              │     ├── CheerButton (×2)
              │     ├── CheerBar
              │     └── H2HButton (condicional)
              ├── EnrollmentCard
              │     └── CompetitionBlock
              ├── FriendshipCard
              │     ├── ProfileMiniCard (×2)
              │     └── AddFriendButton (condicional)
              ├── RankingCard
              │     └── RankingBlock (subiu | desceu | marco)
              └── CardFooter (idêntico em todos)
```

### 9.2 Convenções de implementação

Seguir todas as convenções definidas no `CLAUDE.md`:

- Componentes: PascalCase, cada um com seu `.module.css`
- Estilização: CSS Modules + CSS Custom Properties (tokens do DS)
- Sem CSS inline, sem Tailwind, sem CSS global para componentes
- Ícones: sempre via wrapper `<Icon />` com `@phosphor-icons/react`
- Mobile-first: largura base 430px
- Elementos interativos: altura mínima `--dimension-tap-target-minimum` (48px)
- State layers via `::after` para hover/press
- `:hover` sempre dentro de `@media (hover: hover)`

### 9.3 Página de desenvolvimento

Criar rota `/dev/cards` temporária para desenvolvimento e teste isolado de cada variação de card, antes de integrar ao feed real. Essa rota deve ser removida antes do deploy de produção.

---

## 10. Checklist de validação por card

Antes de marcar qualquer card como implementado, verificar:

**Estrutura**
- [ ] Três zonas presentes: cabeçalho / corpo / rodapé
- [ ] Rodapé idêntico ao dos outros cards (Curtir, Comentar, Compartilhar)
- [ ] Padding interno: 16px
- [ ] Border radius do card: 16px

**Hierarquia**
- [ ] Elemento principal do card lido em menos de 2 segundos
- [ ] Vencedor sempre na linha superior (cards de resultado)
- [ ] Labels VITÓRIA/DERROTA/W.O./Desistência visíveis e com cor correta

**Placar (cards de resultado)**
- [ ] Mesma tipografia (`--text-display-sm`) independente do formato
- [ ] Cor dos números reflete quem venceu cada set (não o resultado final)
- [ ] WO: placar em `--color-foreground-secondary`
- [ ] Labels de coluna presentes apenas em 2+ sets

**H2H**
- [ ] Botão ausente quando `h2h_count === 0`
- [ ] Botão ausente no card de WO
- [ ] Estilo ghost button centralizado

**Interatividade**
- [ ] Todos os elementos tocáveis com altura mínima de 48px
- [ ] `:hover` dentro de `@media (hover: hover)`
- [ ] State layers via `::after`

**Acessibilidade**
- [ ] `:focus-visible` implementado em todos os elementos interativos
- [ ] Ícones decorativos com `aria-hidden={true}`
- [ ] Botões sem texto visível têm `aria-label` no `<button>`

---

## 11. Decisões de dados

Decisões de schema e de semântica que os cards assumem. Hoje os cards rodam com mocks (`src/mocks/feed.ts`); quando o Supabase entrar, estas decisões valem para as tabelas e para a geração das activities.

### 11.1 `total_matches` em `profiles`

Coluna desnormalizada em `profiles`, atualizada por trigger a cada partida confirmada. Aparece nos cards de confronto ("274 jogos"), na lista de amigos e no perfil do jogador. Por isso mora em `PlayerInfo`, e não no lado da partida (`MatchSide`): cada contexto recebe o dado junto com o jogador, sem buscar separado.

### 11.2 Organizações no feed: vínculo implícito, sem "Seguir" no MVP

O jogador vê no feed o conteúdo das organizações dos rankings e torneios em que está ou esteve inscrito. O vínculo é derivado das inscrições e não exige ação do jogador. Por isso `OrgCardHeader` não tem `is_following` e o `CardHeader` não renderiza o botão "Seguir".

**Por quê:** um feed que depende de o usuário escolher quem seguir nasce vazio (*cold start*), e a maioria das pessoas não muda o padrão (efeito padrão; Johnson & Goldstein, "Do Defaults Save Lives?", *Science*, 2003). A inscrição já é um sinal forte e gratuito de interesse.

**Consequência:** o jogador competitivo circula por 3 ou mais organizações por semestre, então descobrir organizações novas importa. Esse papel fica com a **tela de competições com filtros por nível e região**, e não com o feed.

**Evolução prevista:** híbrido. O vínculo implícito continua como padrão, com "Seguir" (alcançar organizações sem inscrição) e "Deixar de seguir" (silenciar). A tabela `follows (follower_id → profiles, followee_id → organizations)` só entra nesse momento.

### 11.3 Torcida: `match_cheers`

`cheer_a`, `cheer_b` e `user_cheer` em `MatchCard` vêm da tabela `match_cheers (match_id, player_id, side, created_at)`.

- `PRIMARY KEY (match_id, player_id)`: um voto por usuário por partida
- Torcida reversível: trocar de lado é `UPDATE`, desfazer é `DELETE`
- Contagem no MVP: `COUNT … GROUP BY side`. Se a escala pedir, migrar para colunas desnormalizadas mantidas por trigger

### 11.4 `enrollment_count` conta a unidade competidora

O número de inscritos de uma categoria conta **quem compete**: duplas numa categoria de duplas, jogadores numa categoria de simples. É assim que o esporte fala: "categorias com mais de 40 duplas" (regulamento do Rankin), "as 16 melhores duplas".

- Exibição: "16 duplas inscritas", "24 jogadores inscritos"
- Cálculo: `COUNT(enrollments)` da categoria, com o rótulo vindo da modalidade
- O total de um evento com categorias de simples e de duplas, quando existir, é em **jogadores** (a única unidade que soma)
- Calculado ao gerar o `metadata` da activity, não guardado como contador em `categories`

### 11.5 Categorias

- **Faixa de nível:** `level_min` / `level_max` no lugar de um `level` único. Representa categorias como "Feminino A/B" (`level_min = 'A'`, `level_max = 'B'`). Categoria de um nível só tem os dois iguais
- **Nível e faixa etária são opcionais e independentes:** o comum é gênero + nível ("Masculino B") ou gênero + faixa etária ("Feminino 40+"), mas os dois podem coexistir ("Mista C 40+"). A categoria precisa ter pelo menos um dos dois
- **Nome exibido:** gênero + nível + idade, nessa ordem ("Masculino B", "Feminino 40+", "Mista C 40+"). É como as arenas escrevem nas inscrições. A modalidade só aparece em simples ("Masculino B · Simples"), porque duplas é o padrão do esporte. Formatado por `formatCategoryLabel` (`src/lib/formatters.ts`)
- **Mista implica duplas:** constraint no banco bloqueia `gender = 'mixed' AND modality = 'singles'`
