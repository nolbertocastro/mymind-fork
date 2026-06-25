#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# mymind (Karakeep fork) — one-shot deploy script for KryptoVault
# ──────────────────────────────────────────────────────────────────────────
# Idempotent. Safe to re-run after pulling fork updates.
#
# Usage on the NAS (after cloning the fork to /mnt/dockerdata/mymind/repo):
#     cd /mnt/dockerdata/mymind/repo/deploy/kryptovault
#     ./deploy.sh
# ──────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

DATA_ROOT="${DATA_ROOT:-/mnt/dockerdata/mymind}"

echo "==> Ensuring data directories exist under $DATA_ROOT"
sudo mkdir -p "$DATA_ROOT/data" "$DATA_ROOT/meili"
sudo chown -R "$(id -u)":"$(id -g)" "$DATA_ROOT"

if [ ! -f .env ]; then
  echo "==> No .env found; copying template. EDIT IT before continuing."
  cp .env.example .env
  echo "    Generated NEXTAUTH_SECRET and MEILI_MASTER_KEY for you:"
  NEXTAUTH_SECRET="$(openssl rand -base64 36)"
  MEILI_MASTER_KEY="$(openssl rand -base64 36)"
  sed -i.bak \
    -e "s|CHANGE_ME_GENERATE_WITH_openssl_rand_base64_36|__PLACEHOLDER__|g" .env
  # Replace first placeholder (NEXTAUTH_SECRET), then second (MEILI_MASTER_KEY).
  awk -v ns="$NEXTAUTH_SECRET" -v mk="$MEILI_MASTER_KEY" '
    BEGIN { n=0 }
    /__PLACEHOLDER__/ {
      n++
      if (n==1) sub("__PLACEHOLDER__", ns)
      else      sub("__PLACEHOLDER__", mk)
    }
    { print }' .env > .env.tmp && mv .env.tmp .env
  rm -f .env.bak
  echo
  echo "    Open .env now and set:"
  echo "      - NEXTAUTH_URL  (Tailscale MagicDNS hostname recommended)"
  echo "      - ANTHROPIC_API_KEY  (reuse your OpenClaw key)"
  echo "    Then re-run ./deploy.sh"
  exit 0
fi

echo "==> Pulling the latest fork code"
git -C "$SCRIPT_DIR/../.." pull --ff-only || true

echo "==> Building the fork image (takes ~5-10 min the first time)"
docker compose build

echo "==> Starting the stack"
docker compose up -d

echo
echo "==> Waiting for health check…"
for i in {1..30}; do
  if curl -fsS http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "    ✓ mymind is up at http://localhost:3000"
    exit 0
  fi
  sleep 2
done

echo "    ! Health check did not pass within 60s. Tail logs:"
docker compose logs --tail=50 web
exit 1
