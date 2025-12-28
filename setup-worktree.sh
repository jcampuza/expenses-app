set -e

# Provided by root script
worktree_root=$ROOT_WORKTREE_PATH

bun ci

cp $ROOT_WORKTREE_PATH/.env.local .env.local
cp $ROOT_WORKTREE_PATH/.env .env

echo "Worktree setup complete!"
