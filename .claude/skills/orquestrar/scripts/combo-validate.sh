#!/usr/bin/env bash
# Simula o master com as branches dos PRs prontos, na ordem dada, e roda lint,
# typecheck, testes, build e a varredura de variáveis CSS sem definição.
# Nada é enviado ao GitHub: os merges ficam num worktree local e descartável.
#
# Uso: SP=<scratchpad> combo-validate.sh <nome-do-log> [<branch>...]
#   sem branch, valida o próprio master
#   resultado em $SP/<nome>.log; saída de cada etapa em $SP/<nome>-<etapa>.out
#   código de saída: 0 tudo verde, 1 alguma etapa falhou, 2 conflito ou worktree sujo
set -u
SP="${SP:?defina SP com o caminho do scratchpad da sessão}"
NAME="${1:?uso: combo-validate.sh <nome-do-log> [<branch>...]}"
shift
REPO="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
COMBO="$SP/combo"
LOG="$SP/$NAME.log"
# Definidas fora do CSS: o useSheetDrag escreve a primeira em runtime,
# e o next/font injeta a segunda. Qualquer outra é contrato quebrado entre PRs.
EXPECTED_UNDEFINED_CSS="--dialog-drag-offset --font-arimo"

exec >"$LOG" 2>&1
echo "=== combo $NAME: $(date -u +%FT%TZ)"

git -C "$REPO" fetch -q origin master "$@" || { echo "FALHOU o fetch de master $*"; echo DONE; exit 2; }

if [ ! -d "$COMBO" ]; then
  echo "=== criando o worktree $COMBO"
  git -C "$REPO" worktree add -q --detach "$COMBO" origin/master || { echo DONE; exit 2; }
fi
cd "$COMBO" || exit 2

# O worktree deve estar limpo: merges anteriores viram commits, e build e
# node_modules são ignorados pelo .gitignore. Sujeira aqui é edição manual,
# então o script para em vez de descartá-la.
if [ -n "$(git status --porcelain)" ]; then
  echo "WORKTREE SUJO em $COMBO: confira com git status antes de repetir"
  git status --short
  echo DONE
  exit 2
fi
git checkout -q --detach origin/master
echo "master: $(git rev-parse --short HEAD)"

for b in "$@"; do
  echo "=== merge $b ($(git rev-parse --short "origin/$b"))"
  if ! git -c user.name=combo -c user.email=combo@local merge -q --no-edit "origin/$b"; then
    echo "CONFLITO em $b:"
    git diff --name-only --diff-filter=U
    git merge --abort
    echo DONE
    exit 2
  fi
done

# npm ci só quando o lockfile mudou desde a última instalação neste worktree.
LOCK_HASH="$(sha1sum package-lock.json | cut -d' ' -f1)"
if [ "$(cat node_modules/.combo-lock-hash 2>/dev/null)" != "$LOCK_HASH" ]; then
  echo "=== npm ci (lockfile mudou)"
  npm ci >"$SP/$NAME-npm-ci.out" 2>&1 || { echo "FALHOU o npm ci"; echo DONE; exit 1; }
  echo "$LOCK_HASH" >node_modules/.combo-lock-hash
fi

# Os tipos gerados por uma combinação anterior dão falso TS2307 no typecheck.
rm -rf .next

FAILED=""
for step in lint typecheck test build; do
  npm run "$step" >"$SP/$NAME-$step.out" 2>&1
  code=$?
  echo "=== npm run $step: exit $code"
  [ "$code" -ne 0 ] && FAILED="$FAILED $step"
done
grep -E 'Tests +[0-9]+' "$SP/$NAME-test.out" | tail -1

echo "=== variáveis CSS sem definição"
grep -rhoE 'var\(--[a-zA-Z0-9-]+' app src styles .storybook --include='*.css' \
  | sed 's/var(//' | sort -u >"$SP/$NAME-css-used"
grep -rhoE '(^|[;{[:space:]])--[a-zA-Z0-9-]+[[:space:]]*:' app src styles .storybook --include='*.css' \
  | grep -oE -- '--[a-zA-Z0-9-]+' | sort -u >"$SP/$NAME-css-defined"
UNEXPECTED=""
for v in $(comm -23 "$SP/$NAME-css-used" "$SP/$NAME-css-defined"); do
  case " $EXPECTED_UNDEFINED_CSS " in
    *" $v "*) echo "$v (esperada)" ;;
    *) echo "$v INESPERADA"; UNEXPECTED="$UNEXPECTED $v" ;;
  esac
done
[ -n "$UNEXPECTED" ] && FAILED="$FAILED css"

if [ -z "$FAILED" ]; then
  echo "RESULTADO: verde"
  echo DONE
  exit 0
fi
echo "RESULTADO: falhou em$FAILED"
echo DONE
exit 1
