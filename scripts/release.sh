#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:?Uso: $0 <version> [descripcion]}"
DESC="${2:-}"
BRANCH="release/${VERSION}"

echo "→ Actualizando develop..."
git checkout develop
git pull origin develop

echo "→ Creando ${BRANCH}..."
git checkout -b "${BRANCH}"
git push origin "${BRANCH}"

echo "→ Abriendo PR a main..."
BODY="Release ${VERSION}"
[ -n "${DESC}" ] && BODY="${BODY} — ${DESC}"

PR_URL=$(gh pr create \
  --base main \
  --head "${BRANCH}" \
  --title "release: ${VERSION} — ${DESC}" \
  --body "${BODY}")

echo "→ PR creado: ${PR_URL}"
PR_NUMBER=$(echo "${PR_URL}" | grep -oE '[0-9]+$')

echo "→ Esperando CI..."
gh pr checks "${PR_NUMBER}" --watch --interval 10

echo "→ CI verde — mergeando..."
gh pr merge "${PR_NUMBER}" --merge

echo "→ Esperando deploy..."
sleep 5
RUN_ID=$(gh run list --repo redflox/progresapp-flacow --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "${RUN_ID}" --exit-status

echo ""
echo "✓ Release ${VERSION} deployado en prod."
