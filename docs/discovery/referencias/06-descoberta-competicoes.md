# 06 — Descoberta de competições

Como o jogador encontra torneios e rankings compatíveis com a categoria e a região, e chega à inscrição.

**JTBDs:** 1 (encontrar competição) principal.
**Oportunidades relacionadas (`DISCOVERY.md`):** 1.1 notificação confiável de chave e horário, 1.2 descoberta por nível e região num lugar só, 1.3 categoria certa na inscrição (nomenclatura sem padrão: "Masculino B", "MASC B", "C Mista").
**Escopo:** o `docs/PRODUCT.md` deixa **torneios completos** e **pagamentos** fora do MVP. Este arquivo cobre a descoberta e a porta de entrada da inscrição, não o checkout.

---

## Resumo

- **O análogo mais próximo é "encontrar uma prova" em apps de corrida** (Runna, Garmin Connect, Strava, adidas Running): busca + chips de filtro removíveis + lista com data em destaque + "não achou? adicione". O vocabulário transfere quase direto (distância → categoria, cidade → região).
- **Chips de filtro removíveis no topo da lista** aparecem em 7 de 10 apps de eventos. A **folha de filtros** (bottom sheet) entra quando há mais de 3 eixos.
- **O botão de aplicar mostra quantos resultados** vão aparecer ("Show 5 results", Tripadvisor; "386 results", eBay; "Apply (3)", Beli, contando filtros). Evita a aplicação às cegas que termina em lista vazia.
- **Nenhuma referência resolve elegibilidade por categoria.** O mais perto é o adidas Running ("você precisa entrar nesta comunidade para participar"). "Este torneio tem a sua categoria" é uma lacuna de mercado e o ponto da oportunidade 1.3.

---

## Padrões recorrentes

### 1. Busca + chips removíveis

**Observado em 7 apps:** Runna, Garmin Connect, Spotify (Live Events), DICE, OKX, MLS, Apple Sports.

- Chips **ativos** mostram o valor escolhido e um "×" para remover (Runna: "15/09/25 – 16/11/25 ×", "5km ×"; Garmin: "Within 50 miles ×", "Official event ×").
- Chips **inativos** mostram o nome do eixo e abrem um seletor (Runna: "Country"; DICE: "DATE"; OKX: "Location ▾ Topic ▾ Type ▾ Date ▾").
- Resumo textual do período ativo (Garmin: "Resultados entre 16 jul 2026 e 16 jul 2027").

### 2. Lista agrupada por data

- **Bloco de data à esquerda** (Garmin: "Jul / 25"; Spotify: badge "Dec 12" sobre a imagem).
- **Cabeçalhos de dia** ("Fri 17 May", DICE; "Thursday, Apr 03", MLS; "Sat 26 Jul", DAZN).
- **Faixa de datas horizontal** para navegar por dia (FotMob: "Yesterday · Today · Tomorrow"; theScore; Peacock).
- **Card com foto** (Runna: foto da cidade, "Oct 4, 2025 · 5km", local e "4,852 Runnas", isto é, quantos usuários vão). Prova social equivalente ao "14 inscritos" do card de inscrição da spec do feed.

### 3. Entrada manual como saída do vazio

Runna ("Não achou sua prova? Adicione manualmente") e Garmin ("Não encontrou seu evento? Crie um evento") colocam a saída **dentro da lista**, não só no estado vazio. No BT, o equivalente seria "Não achou? Peça ao organizador para publicar", já que o jogador não cria torneio.

### 4. Folha de filtros

**Observado em 8 apps:** Tripadvisor, Fresha, eBay, Beli, Airwallex, Tinder, Mercury, Agoda.

| Elemento | Quem usa | Relevância |
| --- | --- | --- |
| **Contagem no CTA** ("Show 5 results") | Tripadvisor, eBay (no título) | Evita lista vazia |
| **Contagem de filtros ativos** ("Apply (3)", "City (1)") | Beli, Mercury ("Clear filters (4)") | Mostra o que está ligado sem abrir cada grupo |
| **Chips em grupos** | eBay, Airwallex, Tinder, Tripadvisor | Categoria, gênero e formato cabem como chips |
| **Slider de distância** | Tripadvisor ("25 km"), Fresha (preço) | Região por raio |
| **Acordeão por grupo** | Beli, Mercury | Muitos eixos sem rolar demais |
| **Limpar por seção** ("Reset") | Agoda | Útil quando há 5+ grupos |
| **Ordenação como segmented ou cards** | Beli ("Score / Distance / Date added"), Fresha | Separar "ordenar" de "filtrar" |

### 5. Página do evento

**Observado em 7 apps:** Garmin, Runna, adidas Running, Strava, Box Box Club, Fixtured, Apple Sports.

- **Fatos em lista com ícone** (data, horário, local, tipo, dificuldade): Garmin, Runna, adidas, Strava, Fixtured.
- **Contagem regressiva** (Garmin: "14 w 3 d"). No BT, o prazo que importa é o **fim das inscrições**, não o evento.
- **Nível ou dificuldade com ⓘ** (Runna: "Moderate ⓘ"). Paralelo com categoria.
- **Condição de participação escrita** junto do CTA (adidas: "Você precisa entrar nesta comunidade para participar deste evento").
- **CTA principal** ("Join challenge", "Select race", "Join event & community") e secundário ("Add to calendar", "Visit website").
- **Programação por sessão** (Formula 1: "Practice 1 · Practice 2 · Qualifying · Race" com status "Finished"). No BT, as fases do torneio (grupos, oitavas, final) ou os dias.

### 6. Estado adiado ou cancelado

Fixtured desenha o evento **"Postponed" com borda tracejada**, cores apagadas. O mesmo tratamento usado para "Abandoned" no feed. Casa com a oportunidade 1.1 (programação que muda por chuva e atraso).

---

## Exemplos

| App | O que observar | Link |
| --- | --- | --- |
| Runna | "Find your race": busca, chips removíveis, cards com foto e contagem de usuários, "adicione manualmente" | [tela](https://mobbin.com/screens/563ee011-074e-4b8c-954b-3f436f0e673b) |
| Garmin Connect | Busca por local e palavra, chips de raio e fonte, bloco de data, "Crie um evento" | [tela](https://mobbin.com/screens/fe65d643-ad3d-49a6-8080-8a1f13930e79) |
| Garmin Connect | Detalhe com contagem regressiva, fatos em lista e "Add to calendar" | [tela](https://mobbin.com/screens/26e94ef7-758e-4a66-aa81-33337c3339aa) |
| Runna | Detalhe com foto, dificuldade com ⓘ, "Select race" | [tela](https://mobbin.com/screens/eed58d15-62ad-4887-a43f-24d156d73c55) |
| adidas Running | Detalhe com data em display e condição de participação junto do CTA | [tela](https://mobbin.com/screens/fdaf7dbf-34d1-4610-89ec-96de84bcbd3d) |
| Strava | Desafio: selo, "Join challenge", detalhes com ícones | [tela](https://mobbin.com/screens/65d12372-3e5b-4360-9843-b52c7e04f1b4) |
| DICE | Busca, chips de data/preço/local, categorias, lista por dia, salvar, "View map" | [tela](https://mobbin.com/screens/1b7630f4-6673-4cfb-97c9-2982a4bace47) |
| Spotify | Chips de cidade e data, grade com badge de data | [tela](https://mobbin.com/screens/5a19d958-26cd-4035-a58c-b7410b031981) |
| Fixtured | Card "Postponed" com borda tracejada | [tela](https://mobbin.com/screens/87d6e07a-eb58-4156-8b5f-3fcbeeab48fb) |
| Formula 1 | Programação por sessão com status | [tela](https://mobbin.com/screens/02427d88-0254-4726-b3ff-b8c2ad39beed) |
| Tripadvisor | Folha de filtros com slider, chips e "Show 5 results" | [tela](https://mobbin.com/screens/85bc9bfe-26f3-4ecc-aa6b-f05f96281f8b) |
| Beli | Ordenação em segmented, grupos em acordeão com contagem, "Apply (3)" | [tela](https://mobbin.com/screens/b8c7e8ab-c828-4e6c-9e70-df9044759a99) |
| eBay | Total de resultados no título da folha, grupos de chips | [tela](https://mobbin.com/screens/d55ba40e-351f-49c6-9b21-2325352b203c) |
| Agoda | "Reset" por seção | [tela](https://mobbin.com/screens/cf8e5454-ab81-4a22-9099-2ae4a8a1cc0c) |

Amostra: 34 telas em 4 buscas, 26 usadas, de 27 apps. Descartadas: grades de jogos de ligas profissionais sem inscrição (SiriusXM, parte do DAZN e NFL). **Lacuna:** o Mobbin não tem Playtomic nem apps de torneio de BT; a descoberta do concorrente principal não foi vista.

---

## Caminhos possíveis

### A. Lista cronológica com chips

Uma lista por data, com chips no topo: **categoria**, **região**, **período**, **tipo** (torneio × ranking). Cada item: data, nome, organizador, local, categorias abertas, prazo de inscrição.

- **A favor:** padrão mais comum e mais fácil de aprender. Serve bem à pergunta "o que tem nos próximos fins de semana?".
- **Contra:** o jogador precisa configurar os filtros toda vez (ou o app lembra). Com poucos torneios cadastrados no beta, a lista pode parecer vazia.
- **Referências:** Runna, Garmin, DICE.

### B. "Para você" + explorar

O topo mostra competições **compatíveis com a categoria e a região do jogador** (sem ele filtrar nada); abaixo, a lista completa com filtros.

- **A favor:** resolve a oportunidade 1.3 sem pedir que o jogador entenda a nomenclatura de cada organizador. É a leitura mais direta do JTBD 1 ("compatível com meu nível e região").
- **Contra:** depende de o jogador ter categoria e região no perfil, e de o sistema mapear categorias diferentes ("MASC B" = "Masculino B"). Recomendação errada destrói confiança.
- **Referências:** Luma ("Picked for you · Nearby", visto na busca do feed), Strava (desafios sugeridos).

### C. Mapa + lista

Alternância entre lista e mapa das arenas com competição aberta.

- **A favor:** região é um eixo forte no BT (arenas espalhadas, deslocamento importa).
- **Contra:** custo técnico alto (mapa, geolocalização, permissão). Com poucas competições, o mapa fica vazio.
- **Referências:** DICE ("View map" flutuante).

### Rankings × torneios

Rankings são contínuos (semestre) e torneios são discretos (fim de semana). Na lista, podem ser:

1. **Uma lista só**, com tag de tipo.
2. **Duas abas** ("Torneios · Rankings").
3. **Rankings fora da descoberta**, porque o jogador entra num ranking pela arena, não por busca (**inferência**, pergunta abaixo).

---

## O que funciona e o que evitar

- ✅ **Chip ativo com "×"**: o filtro ligado fica visível e removível sem abrir nada.
- ✅ **Contagem de resultados no CTA** da folha de filtros.
- ✅ **Prazo de inscrição em destaque** no card, não só a data do evento.
- ✅ **Estado "adiado" visualmente distinto** (borda tracejada), com o motivo.
- ❌ **Filtro de categoria com a nomenclatura do organizador.** Uma lista com "MASC B", "Masculino B" e "B Masc." como opções separadas é o problema que a oportunidade 1.3 descreve.
- ❌ **Mapa como tela padrão** antes de haver volume de competições.

## Acessibilidade

- Chips de filtro: cada chip é um `<button>` com `aria-pressed` (liga/desliga) ou, quando abre um seletor, `aria-haspopup` e `aria-expanded`. O "×" do chip ativo precisa de nome acessível ("Remover filtro 5 km").
- Folha de filtros: padrão **Dialog (Modal)** do APG: foco preso dentro, `Esc` fecha, foco volta ao botão que abriu (**documentado**).
- Anunciar a mudança da lista após filtrar (`aria-live="polite"` com "12 competições encontradas"). WCAG 4.1.3 (mensagens de status).

## Relação com o que já existe

`CompetitionBlock` e `MetaInfo` (branch do feed) já desenham a competição dentro do card de inscrição e podem servir de item de lista. Faltam: chips de filtro, folha de filtros (BottomSheet), barra de busca (SearchField), página de detalhe da competição, seletor de categoria, EmptyState, tag de status (inscrições abertas, encerradas, adiado). Ver o inventário.

## Perguntas para o Gabriel

1. A descoberta do MVP inclui **rankings** ou só **torneios**? O jogador "descobre" um ranking ou entra nele pela arena?
2. O jogador declara **categoria e região** no perfil para ativar o "Para você" (caminho B)?
3. Com inscrição e pagamento fora do MVP, o CTA do detalhe leva para **fora do app** (link do organizador), para uma **lista de interesse**, ou não existe?
4. O app normaliza a nomenclatura de categoria entre organizadores, ou mostra como cada um escreve?
