#!/usr/bin/env bash
# mymind bootstrap for KryptoVault
# Run from your open SSH session on the NAS:
#   bash ~/bootstrap-mymind.sh
set -euo pipefail

echo "==> mymind bootstrap starting on $(hostname)"
echo "==> user=$(whoami) uid=$(id -u) gid=$(id -g)"

TARGET=/mnt/dockerdata/mymind
REPO_URL=https://github.com/nolbertocastro/mymind-fork.git

echo "==> Preparing $TARGET"
sudo mkdir -p "$TARGET"
sudo chown "$(id -u):$(id -g)" "$TARGET"

cd "$TARGET"

if [ ! -d repo/.git ]; then
  echo "==> Cloning $REPO_URL"
  git clone "$REPO_URL" repo
else
  echo "==> repo/ already exists; pulling latest main"
  cd repo && git fetch origin && git checkout main && git pull --ff-only origin main && cd ..
fi

cd repo/deploy/kryptovault

echo "==> First deploy.sh run (generates .env, exits)"
./deploy.sh || true

echo ""
echo "==> NEXT STEPS:"
echo "    1. Edit $TARGET/repo/deploy/kryptovault/.env"
echo "       - Set NEXTAUTH_URL"
echo "       - Set ANTHROPIC_API_KEY"
echo "    2. Run: cd $TARGET/repo/deploy/kryptovault && ./deploy.sh"
echo ""
echo "==> Files in deploy dir:"
ls -la
