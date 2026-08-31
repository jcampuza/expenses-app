import { describe, expect, it } from "bun:test";
import {
  createEffect,
  createRoot,
  createSignal,
  flush,
  isPending,
  NotReadyError,
} from "solid-js";
import type { ConvexClient } from "convex/browser";
import type { FunctionReference } from "convex/server";
import {
  ConvexProvider,
  createAction,
  createMutation,
  createQueryFromClient,
  createQueryStream,
  useConvexAuth,
  useConvexAuthStatus,
} from "./convex";

type QueryRef = FunctionReference<"query">;
type MutationRef = FunctionReference<"mutation">;
type ActionRef = FunctionReference<"action">;

const listQuery = { name: "list" } as unknown as QueryRef;
const otherQuery = { name: "other" } as unknown as QueryRef;
const saveMutation = { name: "save" } as unknown as MutationRef;
const runAction = { name: "run" } as unknown as ActionRef;

type Listener = {
  query: unknown;
  args: unknown;
  callback: (value: unknown) => void;
  onError?: (error: Error) => void;
  current?: unknown;
};

class FakeConvexClient {
  listeners: Listener[] = [];
  mutations: Array<{ fn: unknown; args: unknown }> = [];
  actions: Array<{ fn: unknown; args: unknown }> = [];
  store = new Map<string, unknown>();
  dropStoreOnUnsubscribe = false;

  private key(query: unknown, args: unknown) {
    return JSON.stringify([query, args]);
  }

  seed(query: unknown, args: unknown, value: unknown) {
    this.store.set(this.key(query, args), value);
  }

  onUpdate(
    query: unknown,
    args: unknown,
    callback: (value: unknown) => void,
    onError?: (error: Error) => void,
  ) {
    const listener: Listener = {
      query,
      args,
      callback,
      onError,
      current: this.store.get(this.key(query, args)),
    };
    this.listeners.push(listener);
    const unsubscribe = () => {
      this.listeners = this.listeners.filter((item) => item !== listener);
      if (this.dropStoreOnUnsubscribe) {
        this.store.delete(this.key(query, args));
      }
    };
    return Object.assign(unsubscribe, {
      unsubscribe,
      getCurrentValue: () => listener.current,
    });
  }

  push(query: unknown, args: unknown, value: unknown) {
    this.store.set(this.key(query, args), value);
    for (const listener of this.listeners) {
      if (
        listener.query === query &&
        JSON.stringify(listener.args) === JSON.stringify(args)
      ) {
        listener.current = value;
        listener.callback(value);
      }
    }
  }

  error(query: unknown, args: unknown, error: Error) {
    for (const listener of this.listeners) {
      if (
        listener.query === query &&
        JSON.stringify(listener.args) === JSON.stringify(args)
      ) {
        listener.onError?.(error);
      }
    }
  }

  mutation(fn: unknown, args: unknown) {
    this.mutations.push({ fn, args });
    return Promise.resolve({ saved: true, args });
  }

  action(fn: unknown, args: unknown) {
    this.actions.push({ fn, args });
    return Promise.resolve({ ran: true, args });
  }
}

async function tick() {
  flush();
  await Promise.resolve();
  flush();
  await new Promise((resolve) => setTimeout(resolve, 0));
  flush();
}

function readQuery<T>(query: () => T) {
  try {
    return { ready: true as const, value: query() };
  } catch (error) {
    if (error instanceof NotReadyError) {
      return { ready: false as const, value: undefined };
    }
    throw error;
  }
}

async function waitForQuery<T>(query: () => T, expected?: T, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    const pending = (() => {
      try {
        return isPending(() => query());
      } catch (error) {
        if (!(error instanceof NotReadyError)) throw error;
        return true;
      }
    })();
    const result = readQuery(query);
    if (
      result.ready &&
      !pending &&
      (expected === undefined ||
        JSON.stringify(result.value) === JSON.stringify(expected))
    ) {
      return result.value;
    }
    await tick();
  }
  throw new Error("Query did not become ready");
}

function withConvex<T>(client: FakeConvexClient, run: () => T) {
  let result!: T;
  const dispose = createRoot((disposeRoot) => {
    const view = ConvexProvider({
      client: client as unknown as ConvexClient,
      get children() {
        result = run();
        return null;
      },
    });
    if (typeof view === "function") {
      (view as () => unknown)();
    }
    return disposeRoot;
  });
  return { result, dispose };
}

describe("createQueryStream", () => {
  it("stays pending until the first live value arrives", async () => {
    const client = new FakeConvexClient();
    const stream = createQueryStream(
      client as unknown as ConvexClient,
      listQuery,
      {},
    );
    const iterator = stream[Symbol.asyncIterator]();
    let resolved = false;
    const pending = iterator.next().then((result) => {
      resolved = true;
      return result;
    });
    await tick();
    expect(resolved).toBe(false);
    client.push(listQuery, {}, { items: [1] });
    const first = await pending;
    expect(first.value).toEqual({ items: [1] });
    await iterator.return?.();
  });

  it("emits live updates after the first snapshot", async () => {
    const client = new FakeConvexClient();
    const stream = createQueryStream(
      client as unknown as ConvexClient,
      listQuery,
      {},
    );
    const iterator = stream[Symbol.asyncIterator]();
    client.push(listQuery, {}, { n: 1 });
    expect((await iterator.next()).value).toEqual({ n: 1 });
    client.push(listQuery, {}, { n: 2 });
    expect((await iterator.next()).value).toEqual({ n: 2 });
    await iterator.return?.();
  });

  it("enqueues getCurrentValue immediately when one is already in memory", async () => {
    const client = new FakeConvexClient();
    client.seed(listQuery, {}, { cached: true });
    const stream = createQueryStream(
      client as unknown as ConvexClient,
      listQuery,
      {},
    );
    const iterator = stream[Symbol.asyncIterator]();
    expect((await iterator.next()).value).toEqual({ cached: true });
    await iterator.return?.();
  });

  it("yields a cached snapshot after Convex drops getCurrentValue", async () => {
    const client = new FakeConvexClient();
    client.dropStoreOnUnsubscribe = true;
    const first = createQueryStream(
      client as unknown as ConvexClient,
      listQuery,
      {},
    );
    const firstIterator = first[Symbol.asyncIterator]();
    client.push(listQuery, {}, { items: ["cached"] });
    expect((await firstIterator.next()).value).toEqual({ items: ["cached"] });
    await firstIterator.return?.();
    expect(client.listeners).toHaveLength(0);

    const second = createQueryStream(
      client as unknown as ConvexClient,
      listQuery,
      {},
    );
    const secondIterator = second[Symbol.asyncIterator]();
    expect((await secondIterator.next()).value).toEqual({ items: ["cached"] });
    await secondIterator.return?.();
  });

  it("unsubscribes when the stream is cancelled", async () => {
    const client = new FakeConvexClient();
    const stream = createQueryStream(
      client as unknown as ConvexClient,
      listQuery,
      {},
    );
    const iterator = stream[Symbol.asyncIterator]();
    expect(client.listeners).toHaveLength(1);
    await iterator.return?.();
    expect(client.listeners).toHaveLength(0);
  });

  it("surfaces subscription errors", async () => {
    const client = new FakeConvexClient();
    const stream = createQueryStream(
      client as unknown as ConvexClient,
      listQuery,
      {},
    );
    const iterator = stream[Symbol.asyncIterator]();
    client.error(listQuery, {}, new Error("boom"));
    await expect(iterator.next()).rejects.toThrow("boom");
  });
});

describe("createQuery", () => {
  it("is not ready until the first snapshot", async () => {
    const client = new FakeConvexClient();
    const dispose = createRoot((disposeRoot) => {
      const query = createQueryFromClient(
        client as unknown as ConvexClient,
        listQuery,
        {},
      );
      createEffect(
        () => query(),
        () => {},
      );
      expect(readQuery(query).ready).toBe(false);
      expect(client.listeners).toHaveLength(1);
      return disposeRoot;
    });
    dispose();
  });

  it("receives live updates", async () => {
    const client = new FakeConvexClient();
    let query!: () => unknown;
    const dispose = createRoot((disposeRoot) => {
      query = createQueryFromClient(
        client as unknown as ConvexClient,
        listQuery,
        {},
      );
      createEffect(
        () => query(),
        () => {},
      );
      return disposeRoot;
    });
    expect(readQuery(query).ready).toBe(false);
    client.push(listQuery, {}, { items: ["a"] });
    expect(await waitForQuery(query, { items: ["a"] })).toEqual({
      items: ["a"],
    });
    client.push(listQuery, {}, { items: ["a", "b"] });
    expect(await waitForQuery(query, { items: ["a", "b"] })).toEqual({
      items: ["a", "b"],
    });
    dispose();
  });

  it("unsubscribes and resubscribes when args change", async () => {
    const client = new FakeConvexClient();
    let query!: () => unknown;
    let setArgs!: (value: { id: string }) => void;
    const dispose = createRoot((disposeRoot) => {
      const [args, set] = createSignal({ id: "one" });
      setArgs = set;
      query = createQueryFromClient(
        client as unknown as ConvexClient,
        listQuery,
        args,
      );
      createEffect(
        () => query(),
        () => {},
      );
      return disposeRoot;
    });
    expect(client.listeners).toHaveLength(1);
    expect(client.listeners[0]?.args).toEqual({ id: "one" });
    client.push(listQuery, { id: "one" }, { id: "one" });
    expect(await waitForQuery(query)).toEqual({ id: "one" });

    setArgs({ id: "two" });
    await tick();
    expect(client.listeners).toHaveLength(1);
    expect(client.listeners[0]?.args).toEqual({ id: "two" });
    client.push(listQuery, { id: "two" }, { id: "two" });
    expect(await waitForQuery(query)).toEqual({ id: "two" });
    dispose();
  });

  it("does not subscribe while args are skip", async () => {
    const client = new FakeConvexClient();
    let query!: () => unknown;
    let setArgs!: (value: { id: string } | "skip") => void;
    const dispose = createRoot((disposeRoot) => {
      const [args, set] = createSignal<{ id: string } | "skip">("skip");
      setArgs = set;
      query = createQueryFromClient(
        client as unknown as ConvexClient,
        listQuery,
        args,
      );
      createEffect(
        () => query(),
        () => {},
      );
      return disposeRoot;
    });
    expect(client.listeners).toHaveLength(0);
    expect(query()).toBeUndefined();
    setArgs({ id: "ready" });
    await tick();
    expect(client.listeners).toHaveLength(1);
    client.push(listQuery, { id: "ready" }, { id: "ready" });
    expect(await waitForQuery(query)).toEqual({ id: "ready" });
    dispose();
  });

  it("unsubscribes when the owner is disposed", async () => {
    const client = new FakeConvexClient();
    const dispose = createRoot((disposeRoot) => {
      const query = createQueryFromClient(
        client as unknown as ConvexClient,
        listQuery,
        {},
      );
      createEffect(
        () => query(),
        () => {},
      );
      return disposeRoot;
    });
    expect(client.listeners).toHaveLength(1);
    dispose();
    await tick();
    expect(client.listeners).toHaveLength(0);
  });

  it("replays the last snapshot when remounting after Convex drops the live value", async () => {
    const client = new FakeConvexClient();
    client.dropStoreOnUnsubscribe = true;
    let query!: () => unknown;
    const disposeFirst = createRoot((disposeRoot) => {
      query = createQueryFromClient(
        client as unknown as ConvexClient,
        listQuery,
        {},
      );
      createEffect(
        () => query(),
        () => {},
      );
      return disposeRoot;
    });
    client.push(listQuery, {}, { items: ["cached"] });
    expect(await waitForQuery(query, { items: ["cached"] })).toEqual({
      items: ["cached"],
    });
    disposeFirst();
    await tick();
    expect(client.listeners).toHaveLength(0);

    const disposeSecond = createRoot((disposeRoot) => {
      query = createQueryFromClient(
        client as unknown as ConvexClient,
        listQuery,
        {},
      );
      createEffect(
        () => query(),
        () => {},
      );
      return disposeRoot;
    });
    expect(await waitForQuery(query, { items: ["cached"] })).toEqual({
      items: ["cached"],
    });
    disposeSecond();
  });
});

describe("createMutation and createAction", () => {
  it("forwards mutations to ConvexClient.mutation", async () => {
    const client = new FakeConvexClient();
    const { result: mutate, dispose } = withConvex(client, () =>
      createMutation(saveMutation),
    );
    const result = await mutate({ name: "coffee" } as never);
    expect(result).toEqual({ saved: true, args: { name: "coffee" } });
    expect(client.mutations).toEqual([
      { fn: saveMutation, args: { name: "coffee" } },
    ]);
    dispose();
  });

  it("forwards actions to ConvexClient.action", async () => {
    const client = new FakeConvexClient();
    const { result: act, dispose } = withConvex(client, () =>
      createAction(runAction),
    );
    const result = await act({ kind: "refresh" } as never);
    expect(result).toEqual({ ran: true, args: { kind: "refresh" } });
    expect(client.actions).toEqual([
      { fn: runAction, args: { kind: "refresh" } },
    ]);
    dispose();
  });
});

describe("createQuery isolation", () => {
  it("does not mix results across different query references", async () => {
    const client = new FakeConvexClient();
    let first!: () => unknown;
    let second!: () => unknown;
    const dispose = createRoot((disposeRoot) => {
      first = createQueryFromClient(
        client as unknown as ConvexClient,
        listQuery,
        {},
      );
      second = createQueryFromClient(
        client as unknown as ConvexClient,
        otherQuery,
        {},
      );
      createEffect(
        () => {
          first();
          second();
        },
        () => {},
      );
      return disposeRoot;
    });
    expect(readQuery(first).ready).toBe(false);
    expect(readQuery(second).ready).toBe(false);
    client.push(listQuery, {}, { from: "list" });
    client.push(otherQuery, {}, { from: "other" });
    expect(await waitForQuery(first)).toEqual({ from: "list" });
    expect(await waitForQuery(second)).toEqual({ from: "other" });
    dispose();
  });
});

describe("ConvexProvider auth confirmation", () => {
  it("is loading only until Convex confirms a token", () => {
    const client = new FakeConvexClient();
    const { result, dispose } = withConvex(client, () => ({
      auth: useConvexAuth(),
      status: useConvexAuthStatus(),
    }));
    expect(result.auth.isLoading()).toBe(true);
    expect(result.auth.isAuthenticated()).toBe(false);

    result.status.setAuthenticated(true);
    flush();
    expect(result.auth.isLoading()).toBe(false);
    expect(result.auth.isAuthenticated()).toBe(true);

    result.status.setRefreshing(true);
    flush();
    expect(result.auth.isLoading()).toBe(false);
    expect(result.auth.isAuthenticated()).toBe(true);
    expect(result.auth.isRefreshing()).toBe(true);

    result.status.setAuthenticated(null);
    flush();
    expect(result.auth.isLoading()).toBe(true);
    expect(result.auth.isAuthenticated()).toBe(false);
    expect(result.auth.isRefreshing()).toBe(false);
    dispose();
  });
});
