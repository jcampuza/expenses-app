"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  loggerLink,
  TRPCClientError,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "~/server/api/root";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    const serverQueryClient = createQueryClient();
    serverQueryClient.setDefaultOptions({
      queries: {
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        staleTime: 1000 * 60,
      },
    });

    return serverQueryClient;
  }
  // Browser: use singleton pattern to keep the same query client
  if (clientQueryClientSingleton) {
    return clientQueryClientSingleton;
  }

  clientQueryClientSingleton = createQueryClient();
  clientQueryClientSingleton.setDefaultOptions({
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 1000 * 60,
      retry: (failureCount, error) => {
        if (!(error instanceof TRPCClientError)) {
          return false;
        }

        // Do not retry the request if it doesn't fit into one of these. It doesn't make sense.
        const retryableCodes = new Set([
          "BAD_REQUEST",
          "TIMEOUT",
          "INTERNAL_SERVER_ERROR",
          "TOO_MANY_REQUESTS",
        ]);

        if (!retryableCodes.has(error.data.code)) {
          return false;
        }

        return failureCount < 3;
      },
    },
  });

  return clientQueryClientSingleton;
};

export const api = createTRPCReact<AppRouter>();
/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers: () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
