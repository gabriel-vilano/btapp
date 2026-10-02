# Alcance e ergonomia

Como as pessoas seguram e tocam o celular, e o que isso diz sobre onde as coisas ficam. Lentes: **Hoober** e **Hurff**.

## Como as pessoas seguram o celular

Pesquisa de observação do Hoober (1.333 pessoas, em lugares públicos), **de 2013**:

| Pega | Parcela | Notas |
| --- | --- | --- |
| Uma mão | 49% | 67% polegar direito, 33% esquerdo |
| Apoiado (duas mãos, uma toca) | 36% | 72% tocam com o polegar, 28% com o indicador |
| Duas mãos (dois polegares) | 15% | sobretudo digitação e jogo |

- **75% das interações pelo polegar**, em todas as pegas. Retrato em 90% do tempo.
- Em telas de 6"+, o uso com as duas mãos sobe para ~70%, mas ~60% das interações seguem pelo polegar.

> **Dado de 2013, anterior aos celulares grandes de hoje.** A fonte o chama de "directional, not current". Use como direção, não como número atual.

**A correção que importa:** são médias de uma população num instante, não estados estáveis de cada pessoa. A mesma pessoa troca de pega o tempo todo: pega um copo, segura a raquete, carrega a bolsa. **Nunca projete para uma pega só.**

## O mapa do polegar (Hurff)

O polegar varre um arco que divide a tela em três zonas:

```
┌─────────────────────────┐
│  Ai         Esticada    │   ← topo: o mais difícil
│                         │
│  Esticada     Natural   │
│                         │
│  Natural     Natural    │   ← pé: o mais fácil (nesta pega)
└─────────────────────────┘
   (destro, uma mão)
```

| Zona | Custo | O que mora ali |
| --- | --- | --- |
| **Natural** | sem esforço | ação primária, navegação, controles frequentes |
| **Esticada** | esforço consciente, a pega pode mudar | ações secundárias, ajustes |
| **"Ai"** | muda a pega ou usa a outra mão | ações destrutivas e raras, ou nada importante |

**É mapa de custo.** Um custo alto às vezes é exatamente o que se quer: "Excluir conta" na zona "Ai" é bom design. O erro é a ação **principal** ali.

**O alcance não é linear com o tamanho da tela.** Em celular pequeno o polegar alcança quase tudo; num de ~6" a zona "Ai" toma o topo inteiro; num de 6,7"+ ela é enorme, e a pessoa escorrega o aparelho na mão para compensar, o que desestabiliza a pega. Confira o alcance no maior aparelho, não só no de 393px.

## Regras de posição

1. **Ação primária → faixa de baixo.** A ação mais frequente e importante fica no terço inferior, não no topo. "Salvar" no canto de cima é hábito de desktop (ver o fork 4 em `design-forks.md`).
2. **Ação destrutiva → zona cara ou atrás de confirmação.** Nunca ao lado de uma frequente.
3. **Não encostar no pé da tela.** A faixa mais baixa colide com o indicador de início e o gesto do sistema. A área segura é limite de design, não só técnico (N26).
4. **Alcance é preferência, não garantia (Hoober).** Para uma ação crítica, confira também com o aparelho apoiado ou nas duas mãos: costuma dar certo se está ancorada embaixo e fora do canto.
5. **Topo é para status e identidade, não para ação.** Título, contexto e estado de leitura cabem no topo; interação frequente ali briga com a mão.
6. **Lateralidade.** Um controle embaixo à direita é fácil para o polegar direito e esticado para os outros. Centro-baixo ou largura total é o mais neutro. Cantos para o secundário.

## Uma mão em celular grande

- Usar a tela **inteira** com uma mão não é mais realista em aparelho grande. Aceite.
- As plataformas responderam: Reachability no iOS, busca descendo para baixo no iOS 26, teclado de uma mão no Android.
- **A resposta de design:** manter a **superfície de interação** baixa. O conteúdo pode ocupar a tela (ele rola); controles, navegação e ação primária ficam na faixa de baixo.

## Checklist

- [ ] A ação **primária** está na faixa de baixo, alcançável nas pegas comuns?
- [ ] As **destrutivas** estão em zona cara ou atrás de confirmação, longe das frequentes?
- [ ] Funciona **apoiado ou com as duas mãos**, não só com uma mão confortável?
- [ ] O alcance foi pensado no **maior** aparelho?
- [ ] A superfície de interação está **baixa**, com o topo para conteúdo e status?
- [ ] Os alvos ficam fora da faixa do **indicador de início** e da área segura?
