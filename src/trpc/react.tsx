"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { httpLink, TRPCClientError } from "@trpc/client";
import { createTRPCClient } from "@trpc/client";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "~/server/api/root";
import { createQueryClient } from "./query-client";
import { TRPCProvider } from "~/trpc/utils";

let browserQueryClient: QueryClient | undefined = undefined;
const getQueryClient = () => {
  // SSR
  if (typeof window === "undefined") {
    return createQueryClient();
  }

  // Client
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
    browserQueryClient.setDefaultOptions({
      queries: {
        staleTime: 1000,
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
  }

  return browserQueryClient;
};

const createApi = () =>
  createTRPCClient<AppRouter>({
    links: [
      httpLink({
        transformer: SuperJSON,
        url: getBaseUrl() + "/api/trpc",
        headers: () => {
          const headers = new Headers();
          headers.set("x-trpc-source", "nextjs-react");
          return headers;
        },
      }),
    ],
  });

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

  const [trpcClient] = useState(() => createApi());

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
