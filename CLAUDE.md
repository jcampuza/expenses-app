# Expenses App Agent Notes

## Commands

```bash
bun install
bun run dev          # web + convex together
bun run dev:web      # Vite app only
bun run dev:convex   # Convex functions only
bun run test
bun run lint
bun run typecheck
bun run check        # lint + typecheck + format check
bun run build
bun run start
```

## Directory

- `convex/` - Convex api/dabatase
- `src/` - Tanstack Router application

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
