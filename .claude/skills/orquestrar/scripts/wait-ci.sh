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
set -u
SHA="${1:-}"
MAX_MINUTES="${2:-40}"
SLUG="gabriel-vilano/letzplay"
INTERVAL=30

if ! [[ "$SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "SHA inválido: recebi '$SHA', esperado o SHA completo de 40 caracteres (git rev-parse)"
  exit 2
fi

deadline=$(( $(date +%s) + MAX_MINUTES * 60 ))
while :; do
  json="$(curl -fsS "https://api.github.com/repos/$SLUG/commits/$SHA/check-runs?per_page=100")"
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
