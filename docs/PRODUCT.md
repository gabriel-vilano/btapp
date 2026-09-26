# PRODUCT.md — LetzPlay

Visão de produto e decisões duráveis. Para JTBDs, insights estratégicos sobre Beach Tennis e problemas do app atual, ver `CLAUDE.md`.

> Tracking de execução (status, próximos passos, priorização concreta) fica no Linear, não aqui.

---

## Visão

LetzPlay é uma plataforma de gestão de rankings, torneios e comunidade de esportes de raquete. O redesign foca exclusivamente no **jogador competitivo de Beach Tennis** — reconstruindo a experiência com uma interface mais intuitiva e arquitetura moderna.

Três objetivos simultâneos: portfolio de Design Engineer, produto real para lançamento, aprendizado técnico prático.

---

## Princípios de design

- **Mobile-first.** Largura base 393px ou 430px. Responsivo depois.
- **Resolver os 4 problemas do audit:** consistência visual/semântica, arquitetura de informação, feedback de estados, qualidade de componentes.
- **Perfil com duas leituras** — social (acompanhar amigo) e competitiva (avaliar adversário).
- **Ranking como momento emocional**, não como tabela de dados. Subir motiva, descer frustra — a UI precisa sustentar essa carga.
- **Feed é Activity Stream** (modelo Strava), não rede social. Conteúdo automático (resultados, inscrições, amizades) prevalece sobre UGC.

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

### Fora do MVP

- Torneios completos (gestão de chaves)
- Login social (Google, Apple)
- Aulas e reserva de quadras
- Chat entre jogadores (a marcação de jogos usa propostas estruturadas, não conversa)
- Pagamentos
- Visão do organizador/gestor (o MVP tem só o papel de admin do ranking, para arbitrar placar contestado e sortear confrontos)

---

## Decisões de produto consolidadas

- **Foco exclusivo no jogador competitivo de Beach Tennis.** Não é app multi-esporte, não é app para casual.
- **Auth com email + senha apenas** — sem login social no MVP.
- **Signup multi-step:** Step 1 (nome + email + senha) → Step 2 (foto + @username).
- **Sempre redirecionar para o feed após login.**
- **Recuperar senha:** fluxo inteiro dentro do app.
- **@username:** validação de unicidade em tempo real, opcional.

---

## Métricas de sucesso (validação no beta)

- Jogadores completam fluxos críticos sem ajuda?
- Os 4 problemas do audit foram resolvidos?
- Os JTBDs (ver `CLAUDE.md`) estão sendo atendidos?
- Quais bugs aparecem em campo que não apareceram em dev?
