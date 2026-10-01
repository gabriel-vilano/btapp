# Toque, gesto e movimento

A camada de interação: como a pessoa toca a interface e como ela se move em resposta. Lentes: **Clark**, **ofício moderno (Allen / de With / Nelson)**, **HIG/M3**.

## Alvos de toque

| Fonte | Alvo mínimo | Espaço |
| --- | --- | --- |
| **LetzPlay (DS)** | **48 × 48px** em todo elemento interativo, inclusive botão só de ícone | ver abaixo |
| Apple HIG | 44 × 44pt | "não arriscar ativar o controle vizinho" (sem número) |
| Material 3 | 48 × 48dp | 8dp entre alvos |
| WCAG 2.5.8 (AA) | 24 × 24px (piso) | — |
| WCAG 2.5.5 (AAA) | 44 × 44px | — |

**No LetzPlay, o piso é 48px** (`--dimension-tap-target-minimum`, `docs/TOKENS.md` > "Acessibilidade — tap target"). É mais rígido que a Apple; a skill nunca recomenda menos.

**Tamanho visual e área de toque são coisas separadas.** Um ícone de 16 ou 24px está bem visualmente; a área de toque precisa ter 48px, completada com padding ou `::before`.

**Espaço importa tanto quanto tamanho.** Dois alvos de 48px colados ainda causam toque errado. Deixe espaço entre vizinhos (8dp é a referência do Material), e mais entre uma ação frequente e uma destrutiva.

## Gesto e a tensão da descoberta

A posição mais honesta do Clark, que a skill nunca deve esconder: **gestos são os atalhos de teclado do toque.** Mais rápidos para quem conhece, invisíveis para quem não conhece. A tensão não se resolve; se administra.

**A regra:** todo gesto tem pelo menos um destes, ou não pode ser o único caminho:

1. É **convenção quase universal** (voltar, puxar para atualizar, deslizar uma linha para excluir, tocar, rolar);
2. Tem **pista visível** (um pedaço aparecendo, uma alça, um indício da ação embaixo);
3. Tem **alternativa sem gesto** (a mesma ação num controle visível).

Gesto novo sem nenhum dos três é recurso de especialista: aceitável como atalho secundário, nunca para ação principal.

**Ensinar no momento de uso**, não num tutorial inicial que todos pulam.

### Gestos reservados: não tocar

| Gesto | iOS | Android |
| --- | --- | --- |
| Swipe para cima da borda de baixo | Início / troca de app | Início; segurar = Recentes |
| Swipe para baixo da borda de cima | Notificações / Central de Controle | Painel de notificações |
| Swipe da borda lateral | Voltar (iOS 26: de qualquer ponto) | Predictive Back do sistema |

Na web, somam-se os do navegador (puxar para recarregar, voltar pela borda no Safari). Não amarre ação do app a eles; gesto do app perto de borda vai conflitar.

### Swipe em linha de lista

Borda inicial → ação positiva ou neutra (arquivar). Borda final → negativa ou destrutiva (excluir). Siga a convenção e sempre ofereça um caminho sem swipe (o detalhe com as mesmas ações).

## Movimento como comunicação

A posição central do ofício moderno (o Allen, sobretudo): **movimento não é acabamento posto no fim; é como a interface comunica estado, hierarquia e causa.** Projete as transições junto com o layout.

**Para que serve (os testes):**

- **Origem e destino:** de onde veio, para onde foi? Um sheet que sobe do botão liga os dois. Uma tela que entra pela direita diz "mais fundo"; voltando, "você retornou".
- **Continuidade:** anime a mudança entre estados, não corte.
- **Causa:** o movimento confirma "seu toque fez isto". Resposta imediata ao toque passa confiança.
- **Status:** carregando, progresso, sucesso.

**Para que não serve:** decoração. Se não dá para nomear o que a transição comunica, corte.

**Critérios de qualidade:**

- **Velocidade é propriedade de design** (de With, "leve, nativo, rápido"). Transições de interface abaixo de 300ms, com os tokens `--motion-*` do DS; lento é falha de design, não só de engenharia.
- **Interrompível:** um toque no meio da animação é obedecido na hora.
- **Honre a metáfora física (Clark):** se parece arrastável, arrasta.
- **Movimento reduzido:** quando o sistema pede, troque o movimento grande de posição ou escala por um fade ou uma mudança instantânea. A *informação* que o movimento carregava continua chegando.

O "como" do movimento (curvas, durações, quando animar) é da skill de movimento do repo, quando existir, e dos tokens em `docs/TOKENS.md`. Aqui o critério é se a transição comunica algo.

**Vibração (háptico):** na web, o suporte é parcial (a Vibration API não existe no Safari do iOS). Não conte com ela como único sinal; todo feedback tátil vem com mudança visível.

## Checklist

- [ ] Todo alvo com **48px**, com a área ampliada além do ícone?
- [ ] **Espaço** entre alvos vizinhos, maior em volta dos destrutivos?
- [ ] Todo gesto tem **convenção, pista ou alternativa**?
- [ ] Gestos ensinados **no momento de uso**?
- [ ] Algum gesto do app **colide** com borda reservada do sistema ou do navegador?
- [ ] Swipe de linha segue **início = positivo, fim = destrutivo** e tem caminho sem swipe?
- [ ] Cada transição **comunica** algo nomeável?
- [ ] Transições **rápidas e interrompíveis**?
- [ ] Há caminho de **movimento reduzido** que entrega a mesma informação?
