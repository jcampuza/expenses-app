import {
  createContext,
  createMemo,
  createSignal,
  useContext,
  type Accessor,
  type ParentProps,
} from "solid-js";
import { ConvexClient } from "convex/browser";
import { getFunctionName } from "convex/server";
import { convexToJson, type Value } from "convex/values";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";

/* `{} extends FunctionArgs<...>` is Convex's optional-args check. */
/* eslint-disable @typescript-eslint/no-empty-object-type */

const ConvexContext = createContext<{
  client: ConvexClient;
  isLoading: Accessor<boolean>;
  isAuthenticated: Accessor<boolean>;
  isRefreshing: Accessor<boolean>;
  setAuthenticated: (value: boolean | null) => void;
  setRefreshing: (value: boolean) => void;
}>();

export function getConvexClient(): ConvexClient {
  const convexUrl = import.meta.env.VITE_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("Missing VITE_CONVEX_URL for Convex client");
  }
  return new ConvexClient(convexUrl);
}

export function ConvexProvider(
  props: ParentProps<{
    client?: ConvexClient;
  }>,
) {
  // eslint-disable-next-line solid/reactivity -- ConvexClient is created once
  const client = props.client ?? getConvexClient();
  // null = Convex has not confirmed a token yet (initial bootstrap only).
  const [authConfirmed, setAuthConfirmed] = createSignal<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = createSignal(false);

  const value = {
    client,
    isLoading: () => authConfirmed() === null,
    isAuthenticated: () => authConfirmed() === true,
    isRefreshing: () => isRefreshing() && authConfirmed() === true,
    setAuthenticated: (next: boolean | null) => {
      setAuthConfirmed(next);
      if (next !== true) setIsRefreshing(false);
    },
    setRefreshing: setIsRefreshing,
  };

  return ConvexContext({
    value,
    get children() {
      return props.children;
    },
  });
}

export function useConvex() {
  return useContext(ConvexContext).client;
}

export function useConvexAuth() {
  const ctx = useContext(ConvexContext);
  return {
    isLoading: ctx.isLoading,
    isAuthenticated: ctx.isAuthenticated,
    isRefreshing: ctx.isRefreshing,
  };
}

export function useConvexAuthStatus() {
  const ctx = useContext(ConvexContext);
  return {
    setAuthenticated: ctx.setAuthenticated,
    setRefreshing: ctx.setRefreshing,
  };
}

const querySnapshots = new WeakMap<ConvexClient, Map<string, unknown>>();

function queryCacheKey(
  query: FunctionReference<"query">,
  args: Record<string, Value>,
) {
  return JSON.stringify([getFunctionName(query), convexToJson(args)]);
}

function snapshotCache(client: ConvexClient) {
  let cache = querySnapshots.get(client);
  if (!cache) {
    cache = new Map();
    querySnapshots.set(client, cache);
  }
  return cache;
}

type Skip = "skip";

type QueryArgs<Query extends FunctionReference<"query">> =
  FunctionArgs<Query> | Skip | Accessor<FunctionArgs<Query> | Skip>;

function resolveQueryArgs<Query extends FunctionReference<"query">>(
  args: QueryArgs<Query> | undefined,
): FunctionArgs<Query> | Skip {
  if (args === undefined) {
    return {} as FunctionArgs<Query>;
  }
  if (args === "skip") {
    return "skip";
  }
  if (typeof args === "function") {
    return (args as Accessor<FunctionArgs<Query> | Skip>)();
  }
  return args;
}

export function createQueryStream<Query extends FunctionReference<"query">>(
  client: ConvexClient,
  query: Query,
  args: FunctionArgs<Query>,
): AsyncIterable<FunctionReturnType<Query>> {
  const values: FunctionReturnType<Query>[] = [];
  let pending:
    ((value: IteratorResult<FunctionReturnType<Query>>) => void) | undefined;
  let pendingError: ((error: Error) => void) | undefined;
  let closed = false;
  let failure: Error | undefined;

  const cache = snapshotCache(client);
  const cacheKey = queryCacheKey(query, args);

  const subscription = client.onUpdate(
    query,
    args,
    (value) => {
      const next = value as FunctionReturnType<Query>;
      cache.set(cacheKey, next);
      if (pending) {
        const resolve = pending;
        pending = undefined;
        pendingError = undefined;
        resolve({ value: next, done: false });
        return;
      }
      values.push(next);
    },
    (error) => {
      failure = error;
      if (pendingError) {
        const reject = pendingError;
        pending = undefined;
        pendingError = undefined;
        reject(error);
      }
    },
  );

  const liveValue = subscription.getCurrentValue();
  const current =
    liveValue !== undefined
      ? liveValue
      : (cache.get(cacheKey) as FunctionReturnType<Query> | undefined);
  if (current !== undefined) {
    cache.set(cacheKey, current);
    values.push(current as FunctionReturnType<Query>);
  }

  return {
    [Symbol.asyncIterator]() {
      return {
        next() {
          if (failure) return Promise.reject(failure);
          if (values.length > 0) {
            return Promise.resolve({
              value: values.shift() as FunctionReturnType<Query>,
              done: false,
            });
          }
          if (closed) {
            return Promise.resolve({
              value: undefined as unknown as FunctionReturnType<Query>,
              done: true,
            });
          }
          return new Promise((resolve, reject) => {
            pending = resolve;
            pendingError = reject;
          });
        },
        async return() {
          closed = true;
          subscription.unsubscribe();
          pending?.({
            value: undefined as unknown as FunctionReturnType<Query>,
            done: true,
          });
          pending = undefined;
          pendingError = undefined;
          return {
            value: undefined as unknown as FunctionReturnType<Query>,
            done: true,
          };
        },
      };
    },
  };
}

export function createQueryFromClient<Query extends FunctionReference<"query">>(
  client: ConvexClient,
  query: Query,
  ...rest: {} extends FunctionArgs<Query>
    ? [args?: QueryArgs<Query>]
    : [args: QueryArgs<Query>]
): Accessor<FunctionReturnType<Query> | undefined> {
  return createMemo(() => {
    const args = resolveQueryArgs(rest[0]);
    if (args === "skip") {
      return undefined;
    }
    return createQueryStream(client, query, args);
  });
}

export function createQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...rest: {} extends FunctionArgs<Query>
    ? [args?: QueryArgs<Query>]
    : [args: QueryArgs<Query>]
): Accessor<FunctionReturnType<Query> | undefined> {
  return createQueryFromClient(useConvex(), query, ...rest);
}

type MutationFn<Mutation extends FunctionReference<"mutation">> =
  {} extends FunctionArgs<Mutation>
    ? (args?: FunctionArgs<Mutation>) => Promise<FunctionReturnType<Mutation>>
    : (args: FunctionArgs<Mutation>) => Promise<FunctionReturnType<Mutation>>;

export function createMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
): MutationFn<Mutation> {
  const client = useConvex();
  return ((args?: FunctionArgs<Mutation>) =>
    client.mutation(
      mutation,
      (args ?? {}) as FunctionArgs<Mutation>,
    )) as MutationFn<Mutation>;
}

type ActionFn<Action extends FunctionReference<"action">> =
  {} extends FunctionArgs<Action>
    ? (args?: FunctionArgs<Action>) => Promise<FunctionReturnType<Action>>
    : (args: FunctionArgs<Action>) => Promise<FunctionReturnType<Action>>;

export function createAction<Action extends FunctionReference<"action">>(
  actionRef: Action,
): ActionFn<Action> {
  const client = useConvex();
  return ((args?: FunctionArgs<Action>) =>
    client.action(
      actionRef,
      (args ?? {}) as FunctionArgs<Action>,
    )) as ActionFn<Action>;
}
