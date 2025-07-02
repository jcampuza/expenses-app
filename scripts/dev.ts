import { $ } from "bun";

const run = async () => {
  await Promise.all([$`bun run dev:convex`, $`bun run dev:next`]);
};

run();
