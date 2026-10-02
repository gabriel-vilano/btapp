#!/usr/bin/env bash
# Espera os 3 checks obrigatórios do ruleset num commit, pela API pública do GitHub.
# Rodar em segundo plano (run_in_background): a sessão é avisada quando ele sai.
#
# Uso: wait-ci.sh <sha-completo> [<minutos-máximos>]
#   código de saída: 0 os 3 verdes, 1 algum terminou sem sucesso, 2 uso errado, 3 tempo esgotado
#
# Lote 28: a versão antiga não saía com os checks já completos. Esta consulta
# antes de dormir e, quando um check roda de novo, usa a execução mais recente
# de cada nome (a de maior id), não a primeira que a API devolve.
#
# O repositório vem de REPO_SLUG (owner/repo) ou, na falta dele, do remote origin.
# Não é literal de propósito: o nome do repo vai mudar (rename), e um literal
# velho faria a API do GitHub responder com redirecionamento. O curl abaixo usa
# -L pelo mesmo motivo: sem ele, o 301 vira erro (-f) e o script ficaria no laço
# até o tempo esgotar, em vez de detectar a CI.
set -u
SHA="${1:-}"
MAX_MINUTES="${2:-40}"
INTERVAL=30
# Só os testes trocam a base da API (servidor local que responde 301).
API_BASE="${WAIT_CI_API_URL:-https://api.github.com}"

# Aceita https://host/owner/repo(.git), git@host:owner/repo.git e o remote de
# proxy da nuvem (http://usuario@127.0.0.1:porta/git/owner/repo): pega os dois
# últimos segmentos do caminho.
slug_from_remote() {
  local url="${1%/}"
  url="${url%.git}"
  printf '%s' "$url" | sed -n 's#.*[:/]\([^/:]\{1,\}/[^/:]\{1,\}\)$#\1#p'
}

SLUG="${REPO_SLUG:-}"
if [ -z "$SLUG" ]; then
  remote="$(git remote get-url origin 2>/dev/null || true)"
  SLUG="$(slug_from_remote "$remote")"
  source_desc="remote origin '$remote'"
else
  source_desc="REPO_SLUG '$SLUG'"
fi
if ! [[ "$SLUG" =~ ^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$ ]]; then
  echo "Repositório indefinido: li $source_desc, esperado owner/repo (defina REPO_SLUG ou rode dentro do clone com remote origin)"
  exit 2
fi

if ! [[ "$SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "SHA inválido: recebi '$SHA', esperado o SHA completo de 40 caracteres (git rev-parse)"
  exit 2
fi

deadline=$(( $(date +%s) + MAX_MINUTES * 60 ))
while :; do
  json="$(curl -fsSL "$API_BASE/repos/$SLUG/commits/$SHA/check-runs?per_page=100")"
  if [ -z "$json" ]; then
    echo "$(date -u +%T) falha ao consultar a API (rate limit de 60/h sem token?)"
  else
    verdict="$(printf '%s' "$json" | python3 -c '
import json, sys
REQUIRED = [
    "Lint, testes e build",
    "Stories (Storybook + a11y)",
    "E2E (Playwright + Supabase local)",
]
runs = json.load(sys.stdin)["check_runs"]
latest = {}
for run in runs:
    if run["name"] in REQUIRED and run["id"] > latest.get(run["name"], {"id": -1})["id"]:
        latest[run["name"]] = run
states = []
for name in REQUIRED:
    run = latest.get(name)
    states.append((name, run["status"] if run else "ausente", (run or {}).get("conclusion") or "-"))
for name, status, conclusion in states:
    print(f"  {name}: {status} {conclusion}", file=sys.stderr)
if any(status != "completed" for _, status, _ in states):
    print("pending")
elif all(conclusion == "success" for _, _, conclusion in states):
    print("success")
else:
    print("failure")
')"
    echo "$(date -u +%T) ${SHA:0:7}: $verdict"
    case "$verdict" in
      success) exit 0 ;;
      failure) exit 1 ;;
    esac
  fi
  if [ "$(date +%s)" -ge "$deadline" ]; then
    echo "TEMPO ESGOTADO depois de $MAX_MINUTES min: conferir o PR direto na API"
    exit 3
  fi
  sleep "$INTERVAL"
done
