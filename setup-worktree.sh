#!/bin/sh

set -e

bun ci

cp "$ROOT_WORKTREE_PATH/.env.local" .env.local
cp "$ROOT_WORKTREE_PATH/.env" .env

echo "Worktree setup complete!"
