# PRODUCT.md — BT App

Visão de produto, contexto do esporte, JTBD e decisões duráveis. O nome do produto é provisório e mora em `src/lib/brand.ts`; os outros docs dizem "o produto".

> Tracking de execução (status, próximos passos, priorização concreta) fica no Linear, não aqui.

---

## Visão

Plataforma de gestão de rankings, torneios e comunidade de esportes de raquete, com foco exclusivo no **jogador competitivo de Beach Tennis**.

O produto é pensado a partir do que as plataformas de ranking e torneio já existentes fazem, e propõe três coisas: otimizações nos fluxos do jogador, funcionalidades novas e, potencialmente, objetivos de mercado novos. A experiência é construída com uma interface mais intuitiva e uma arquitetura moderna.

Três objetivos simultâneos: portfolio de Design Engineer, produto real para lançamento, aprendizado técnico prático.

---

## Princípios de design

- **Mobile-first.** Largura base 393px ou 430px. Responsivo depois.
- **Resolver os 4 problemas do incumbente** (ver "Problemas do incumbente que o produto resolve").
- **Perfil com duas leituras** — social (acompanhar amigo) e competitiva (avaliar adversário).
- **Ranking como momento emocional**, não como tabela de dados. Subir motiva, descer frustra — a UI precisa sustentar essa carga.
- **Feed é Activity Stream** (modelo Strava), não rede social. Conteúdo automático (resultados, inscrições, amizades) prevalece sobre UGC.

---

## Contexto do esporte

**Ecossistema do Beach Tennis.**

- Rankings são contínuos (semestre), culminando em "Finals" para as 8 melhores duplas.
- Torneios são eventos discretos (1 a 2 dias de fim de semana).
- A marcação de jogos de ranking acontece no WhatsApp, não no app.
- O produto é um app de competição: quem não compete não tem motivo para usá-lo.

**Feed.** Activity Stream (modelo Strava), não rede social. Conteúdo automático (resultados, inscrições, amizades) é o que engaja; publicação própria (UGC) é pouco usada; cards de resultado são o formato principal.

**Jogador competitivo.**

- Ranking é o coração emocional do produto: subir motiva, descer frustra.
- Dois tipos de consulta a perfil: social (acompanhar amigos) e competitiva (avaliar adversário).
- A frequência de uso é alta durante as competições e cai entre elas.

---

## Jobs-to-be-done (hipóteses)

Foco: jogador competitivo de Beach Tennis. O `docs/DISCOVERY.md` ranqueia as oportunidades de cada um por evidência.

1. **Encontrar competição:** "Quando estou sem torneio ou ranking no horizonte, quero encontrar competições compatíveis com meu nível e região, para manter uma agenda ativa."
2. **Saber onde estou no ranking:** "Quando um resultado é registrado, quero ver imediatamente como minha posição foi afetada, para decidir como agir."
3. **Preparar-me para um confronto:** "Quando descubro quem vou enfrentar, quero avaliar o nível e histórico desse jogador, para me preparar."
4. **Acompanhar amigos no BT:** "Quando abro o app no dia a dia, quero ver o que meus amigos estão fazendo, para me manter conectado e descobrir oportunidades."
5. **Sentir que estou evoluindo:** "Quando estou entre competições, quero ver evidências da minha evolução, para me manter motivado."

---

## Problemas do incumbente que o produto resolve

O audit heurístico do app do incumbente (a plataforma de referência) agrupa os problemas em quatro categorias, que guiam o design:

1. **Consistência visual e semântica:** cor sem lógica, tipografia irregular, componentes sem padrão.
2. **Arquitetura de informação:** a mesma ação em vários lugares, busca duplicada, perfil sobrecarregado.
3. **Feedback e estados:** mensagens que contradizem a ação, criação de conta sem retorno.
4. **Componentes e interações:** filtros sem rótulo, seletores quebrados, modais sem fechar.

O audit completo, com evidência por tela, é o documento "Auditoria do app atual" do Linear (projeto Discovery e estratégia).

---

## Escopo do MVP

### Must have

- Autenticação (login, signup multi-step, recuperar senha)
- Perfil do jogador (cadastro, foto, stats)
- Ranking por categoria/nível
- Registro de partidas e resultados
- Marcação de jogos por propostas estruturadas de horário: um lado propõe de 2 a 3 opções, o outro aceita. O histórico serve de evidência em disputa de W.O. Sem chat: a conversa continua no WhatsApp
- Agenda do jogador (aba "Jogos"): confrontos sorteados, próximos jogos, pendências, histórico e amistosos
- Head-to-head entre jogadores
- Feed de atividade (Activity Stream)
- Explorar v1 (aba "Explorar"): uma busca só, com escopos jogadores, competições e arenas; a vitrine das competições e arenas dos organizadores do beta; na página da competição, "Como se inscrever" (contato do organizador) e "Tenho interesse", que mede a demanda. Detalhe em `docs/NAVIGATION.md`

### Fora do MVP

- Torneios completos (gestão de chaves)
- O resto da descoberta de competições: filtros por nível e região, recomendação, mapa e inscrição pelo app
- Login social (Google, Apple)
- Aulas e reserva de quadras
- Chat entre jogadores (a marcação de jogos usa propostas estruturadas, não conversa)
- Pagamentos
- Visão do organizador/gestor (o MVP tem só o papel de admin da competição, numa área "Administrar" da página da competição, para sortear confrontos, arbitrar placar contestado, decidir partida não realizada, corrigir e anular placar e lançar o resultado do torneio)

---

## Decisões de produto consolidadas

- **Foco exclusivo no jogador competitivo de Beach Tennis.** Não é app multi-esporte, não é app para casual.
- **Auth com email + senha apenas** — sem login social no MVP.
- **Signup multi-step:** Step 1 (nome + sobrenome + email + senha, com nome e sobrenome em campos separados) → Step 2 (foto + @username).
- **Redirecionar para o feed após login**, salvo quando o login veio de um link: aí volta para a tela do link (`docs/NAVIGATION.md` N28, `docs/PROFILE.md` PF20).
- **Recuperar senha:** fluxo inteiro dentro do app.
- **@username:** gerado a partir do nome no cadastro, editável, com validação de unicidade em tempo real. Todo jogador tem um.

---

## Métricas de sucesso (validação no beta)

- Jogadores completam fluxos críticos sem ajuda?
- Os 4 problemas do incumbente foram resolvidos?
- Os JTBDs (ver "Jobs-to-be-done") estão sendo atendidos?
- Quais bugs aparecem em campo que não apareceram em dev?
