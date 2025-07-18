// dev.ts
import { spawn } from "bun";

// simple ANSI color codes
const COLORS: Record<string, string> = {
  "convex:stdout": "\x1b[34m", // blue
  "convex:stderr": "\x1b[34m",
  "vite:stdout": "\x1b[32m", // green
  "vite:stderr": "\x1b[32m",
};
const RESET = "\x1b[0m";

// a TransformStream that splits incoming strings into lines
function makeLineSplitter() {
  let buffer = "";
  return new TransformStream<string, string>({
    transform(chunk, ctrl) {
      buffer += chunk;
      const parts = buffer.split("\n");
      buffer = parts.pop() ?? "";
      for (const line of parts) {
        ctrl.enqueue(line);
      }
    },
    flush(ctrl) {
      if (buffer.length) ctrl.enqueue(buffer);
    },
  });
}

// given a Uint8Array stream, turn it into an async-iterable of lines
function lines(
  stream: ReadableStream<Uint8Array>,
  prefix: string,
): AsyncIterable<string> {
  return (async function* () {
    const textStream = stream.pipeThrough(new TextDecoderStream());
    const lineStream = textStream.pipeThrough(makeLineSplitter());
    for await (const line of lineStream) {
      yield `[${prefix}] ${line}`;
    }
  })();
}

async function run() {
  const convex = spawn(["bun", "run", "dev:convex"], {
    // make sure we get pipe-style streams
    stdout: "pipe",
    stderr: "pipe",
  });
  const next = spawn(["bun", "run", "dev:vite"], {
    stdout: "pipe",
    stderr: "pipe",
  });

  // set up four log-tasks (stdout+stderr for each process)
  const streams = [
    { prefix: "convex:stdout", stream: convex.stdout },
    { prefix: "convex:stderr", stream: convex.stderr },
    { prefix: "vite:stdout", stream: next.stdout },
    { prefix: "vite:stderr", stream: next.stderr },
  ].filter(
    (s): s is { prefix: string; stream: ReadableStream<Uint8Array> } =>
      s.stream !== undefined,
  );

  const tasks = streams.map(({ prefix, stream }) => {
    const color = COLORS[prefix] || "";
    return (async () => {
      for await (const line of lines(stream, prefix)) {
        console.log(`${color}${line}${RESET}`);
      }
    })();
  });

  // clean up on Ctrl-C
  const cleanup = () => {
    convex.kill();
    next.kill();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  await Promise.all(tasks);
}

run();
