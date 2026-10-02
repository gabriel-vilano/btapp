# Forks de design mobile

Decisões **sem resposta única**: a certa depende do produto, do conteúdo e da intenção de quem usa. Quando a skill encontra uma, apresenta as opções com trade-offs e o Gabriel escolhe. Não decide em silêncio.

A maioria das falhas de design mobile não é resposta errada; é pergunta que ninguém fez.

## Como usar

Para cada fork encontrado:

1. **Confira se a spec já decidiu** (`SKILL.md`, "Regra central"). Se decidiu, não é fork: é "Já decidido" ou "Observação com fonte".
2. Nomeie a situação e por que a ambiguidade é real.
3. Mostre 2 ou 3 opções com trade-offs honestos.
4. Dê os **sinais** que apontam para uma delas no LetzPlay.
5. Escreva no formato Needs Decision do `SKILL.md`.

Numa conversa, um ou dois forks por vez.

---

## Fork 1: padrão de navegação principal

**Situação:** vários destinos de primeiro nível precisam de um modelo de navegação.

- **A — Tab bar.** Destinos visíveis e ao alcance. Teto de ~5; não expressa profundidade.
- **B — Hambúrguer ou drawer.** Cabe muita coisa. Escondido, pouco achado; o Material 3 o descontinuou.
- **C — Guiada pelo conteúdo, sem cromo.** Imersiva. Depende de gesto, custa descoberta.

**Pergunta:** quantos destinos são de fato de primeiro nível, e quão independentes?
**Sinais:** 3 a 5 seções iguais e independentes → A. Hierarquia funda ou 6+ → arrumar a arquitetura primeiro. App de propósito único (câmera, leitor) → C.
**No LetzPlay:** decidido. 5 abas com rótulo, sem menu lateral nem "Mais" (`NAVIGATION.md`, N1 e N5). Destino novo entra numa aba existente.

## Fork 2: sheet × modal × tela cheia × tela nova

**Situação:** uma tarefa ou conteúdo secundário precisa aparecer sobre ou depois da tela atual.

- **A — Bottom sheet.** Curto, delimitado, dispensável. Não modal se o fundo segue relevante.
- **B — Modal de tela cheia.** Tarefa autocontida que se termina ou cancela.
- **C — Tela nova empilhada.** Parte do fluxo de navegação; a pessoa desceu um nível.
- **D — Expansão no lugar ou mudança de estado.** Nenhuma superfície nova.

**Pergunta:** é um desvio passageiro ou um destino de verdade? A pessoa precisa do fundo?
**Sinais:** tarefa curta com fundo relevante → A não modal. Curta, fundo irrelevante → A modal. Tarefa substancial → B. Parte da hierarquia → C. Só revela mais do que já está ali → D. **Fluxo de vários passos nunca é pilha de sheets**: é B ou C.
**No LetzPlay:** os fluxos de tarefa (lançar resultado, registrar amistoso, propor horários, editar perfil, decisões do admin) já são modais de tela cheia com "Fechar" (N4, N18); toda entidade é tela com rota (N10).

## Fork 3: gesto × controle visível

**Situação:** uma ação pode ser swipe, toque longo ou arrastar, ou um botão visível.

- **A — Só gesto.** Rápido, limpo. Invisível: só para especialistas.
- **B — Só controle visível.** Todos acham. Mais cromo, menos expressivo.
- **C — Os dois.** Gesto como atalho, controle como caminho descobrível.

**Pergunta:** é ação principal (todos precisam achar) ou atalho (quem usa muito vai procurar)?
**Sinais:** ação principal → B ou C, nunca A sozinho. Frequente para quem volta → C. Atalho secundário sobre convenção conhecida (swipe para excluir) → A aceitável. Gesto novo → nunca A sozinho.

## Fork 4: posição da ação primária

**Situação:** a tela tem uma ação primária clara. Onde ela mora?

- **A — Barra do topo** ("Salvar" no canto). Convenção do iOS; fora do alcance fácil.
- **B — Botão ancorado embaixo.** Zona natural; custa altura; pode cobrir conteúdo ou ficar sob o teclado.
- **C — Botão flutuante (FAB).** Persistente e alcançável; pode tapar conteúdo; idioma forte do Material, menos do iOS.

**Pergunta:** com que frequência a ação é usada, e quanto a convenção pesa aqui?
**Sinais:** frequente → B ou C. Confirmação rara num formulário com convenção forte → A aceitável. Uma ação de criar dominante → C. Ação ligada a uma lista rolável → B como barra fixa. Destrutiva → nunca no lugar fácil (fork 8).
**No LetzPlay:** confira o cabeçalho da aba na `NAVIGATION.md` (seção 3) antes de abrir: "Registrar amistoso" no topo da aba Jogos já é decisão (N19).

## Fork 5: lista × grade × carrossel

**Situação:** uma coleção de itens precisa ser mostrada.

- **A — Lista vertical.** Melhor varredura de itens com texto; densidade variável.
- **B — Grade.** Itens visuais de peso igual; comparação visual; menos espaço para metadado.
- **C — Carrossel horizontal.** Compacto; o que fica fora da tela é facilmente ignorado.

**Pergunta:** a pessoa varre texto e metadado, compara imagens ou passeia por uma categoria periférica?
**Sinais:** texto e metadado importam → A. Imagem é o conteúdo → B. Categoria secundária ao lado de outro conteúdo → C, mas **nunca conteúdo principal em carrossel**.

## Fork 6: formulário longo, rolagem única × passos × seções

**Situação:** um formulário tem muitos campos.

- **A — Rolagem única.** Tudo visível; pode parecer sem fim.
- **B — Passo a passo.** Um grupo por tela; precisa de indicador de progresso.
- **C — Seções sanfonadas.** Bom para editar uma parte; risco de campo obrigatório escondido.

**Pergunta:** preenche-se uma vez (cadastro) ou edita-se sempre (configurações, perfil)?
**Sinais:** uma vez, 10+ campos ou etapas naturais → B. Uma vez e curto → A. Edição frequente de uma parte → C.
**No LetzPlay:** o cadastro já é em dois passos (`PRODUCT.md`).

## Fork 7: densidade, mostrar tudo × revelar aos poucos

**Situação:** a tela *poderia* mostrar muita informação.

- **A — Mostrar tudo.** Tudo de relance; risco de bagunça e de perder o foco.
- **B — Revelação progressiva.** O essencial, e o detalhe sob demanda; custa um toque e o risco de "não sabia que estava ali".

**Pergunta:** a pessoa precisa de tudo de uma vez, ou do resumo com detalhe sob demanda?
**Sinais:** acompanhamento de relance (status) → A, com hierarquia clara e um foco. Tarefa → B. Ferramenta de uso diário → A tende a servir melhor (familiaridade vence arrumação). Uso ocasional → B.

## Fork 8: ações destrutivas e raras, onde se escondem

**Situação:** a tela tem ações frequentes e ações destrutivas ou raras.

- **A — Zona cara.** A fricção de alcance é margem de segurança.
- **B — Atrás de swipe ou de menu.** Fora do caminho até ser procurada (tudo bem, é rara).
- **C — Atrás de confirmação.** Alcançável, mas protegida por um segundo gesto deliberado.

**Pergunta:** quanto estraga um toque errado, e dá para desfazer?
**Sinais:** irreversível e danosa → C, de preferência também A. Reversível mas chata → B com desfazer. Rara e inofensiva → B. **Nunca** destrutiva ao lado de uma frequente na mesma zona fácil.
**No LetzPlay:** "Corrigir placar" e "Anular resultado" ficam num menu visível só para o admin, nunca como botão primário (N31); "Sair" não pede confirmação (N8).

## Fork 9: ensinar a interface

**Situação:** há padrões ou gestos que a pessoa nova precisa aprender.

- **A — Tour inicial.** Carrossel ou marcações no primeiro acesso; as pessoas pulam e esquecem.
- **B — Revelação no contexto.** Ensina cada coisa quando ela fica relevante; retém melhor; mais trabalho de design.
- **C — Sem ensinar.** Só convenção e pista visível; só funciona se o design é evidente.

**Pergunta:** a interface se ensina pelas pistas, ou há momentos de fato não óbvios?
**Sinais:** só convenções e pistas → C (o objetivo). Alguns atalhos não óbvios → B. Tour (A) quase sempre é a resposta errada: se parece necessário, o design ainda não está evidente.
