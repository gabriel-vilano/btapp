# Formulários e entrada de dados

Qualquer tela que pede dados: cadastro, login, lançar placar, propor horário, editar perfil, busca. Lente: **Wroblewski**, com **Clark** e **HIG/M3**.

## A posição central

**Formulário é um custo que se pede à pessoa pagar.** O celular deixa o custo visível: cada campo é um toque, um teclado, um atrito numa tela pequena. Projete o formulário **tirando** custo, não arrumando campos.

Nota atual (Budiu / NN/g): o atrito de autenticação caiu muito (passkeys, biometria, preenchimento automático). Formulário deixou de ser a maior dor do mobile **porque** estes princípios viraram o mínimo esperado.

## Regras de estrutura

1. **Coluna única, sempre.** Nem "Cidade" e "CEP" lado a lado. A única exceção é um valor só em micro-campos (validade do cartão MM/AA), e mesmo assim um campo costuma ser melhor.
2. **Rótulo visível, acima do campo.** O olho pega rótulo e campo numa fixação, e o rótulo continua visível quando o teclado empurra o layout. O `FormInput` do DS já segue isso.
3. **Placeholder como rótulo é antipadrão.** Some quando a pessoa digita, justo quando ela quer conferir o campo. Placeholder é exemplo ("ex.: nome@email.com").
4. **Tipo de campo igual ao tipo de dado.** E-mail → teclado de e-mail; telefone → teclado numérico; código → numérico com `autocomplete="one-time-code"`. Junto: dicas de preenchimento automático, capitalização e o rótulo da tecla Enter (`enterkeyhint`).
5. **Corte campos sem dó.** Para cada um: "o que acontece se tirarmos?". Se nada quebra, sai. Pergunte depois, aos poucos, deduza do contexto, ou não pergunte.
6. **Valores padrão bons e editáveis.** Já preenchido mas editável (data de hoje, a opção óbvia) é mais rápido que vazio.
7. **Texto digitado com 16px.** Abaixo disso, o Safari do iOS dá zoom ao focar. Decisão do BT App: todo texto digitado e placeholder de `input`, `textarea` e `select` em 16px; rótulo, ajuda e erro em 12px.

## Interação e feedback

- **Validar no campo, na hora certa:** ao sair do campo, não a cada tecla e não só no envio. Sucesso e erro no campo, em linguagem simples, com como corrigir.
- **Nunca limpar o formulário no erro.** Redigitar por causa de um campo é uma das maiores causas de abandono.
- **Campo ativo e rótulo visíveis acima do teclado.** O teclado come ~40% da tela.
- **Botão de enviar onde o polegar está e onde o olho termina:** no fim da coluna, na zona natural. Num formulário longo, um botão fixo embaixo pode servir, desde que não cubra o campo em edição.
- **Progresso visível** em formulário de vários passos.

## Escolher o controle

| Dado | Prefira | Evite |
| --- | --- | --- |
| Uma escolha, 2 a 4 opções | controle segmentado ou rádios visíveis | dropdown (esconde as opções) |
| Uma escolha, 5 a 15 opções | select nativo | lista longa de rádios |
| Uma escolha entre muitas | tela de lista com busca | seletor de rolagem gigante |
| Várias escolhas | checkboxes ou chips visíveis | dropdown de seleção múltipla |
| Liga/desliga | switch | checkbox para um ajuste |
| Data | seletor de data nativo | três campos numéricos |
| Texto livre | do tamanho da resposta esperada | caixa pequena para resposta longa |

**O ângulo do Clark:** manipular o valor direto costuma vencer um campo com validação (stepper, slider, chip). Sem perder precisão: slider é errado para valor exato, como um placar.

Antes de propor controle novo, confira o que o DS já tem (`src/components/ui/`) e o MDX dele.

## Checklist

- [ ] **Coluna única**?
- [ ] Rótulos **visíveis e acima** (sem placeholder como rótulo)?
- [ ] Cada campo com o **tipo e o teclado certos** e a dica de preenchimento?
- [ ] Cada campo passou no **"e se tirarmos?"**?
- [ ] **Valores padrão** editáveis onde dá para deduzir?
- [ ] Texto digitado com **16px**?
- [ ] Campo, rótulo e erro **visíveis acima do teclado**?
- [ ] Validação **no campo, ao sair**, com a correção?
- [ ] Dados **preservados** no erro?
- [ ] Enviar **embaixo**, ao alcance?
- [ ] Cada **controle** é o de menor atrito para o dado?
