"use client";

import { ConvexReactClient } from "convex/react";
import { QueryClient } from "@tanstack/react-query";
import { ConvexQueryClient } from "@convex-dev/react-query";

export interface ClientSet {
  convexClient: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
  queryClient: QueryClient;
}

let browserClients: ClientSet | undefined = undefined;

function createClients(): ClientSet {
  const convexUrl = import.meta.env.VITE_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("Missing VITE_CONVEX_URL for Convex client");
  }

  const convexClient = new ConvexReactClient(convexUrl);
  const convexQueryClient = new ConvexQueryClient(convexClient);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });

  convexQueryClient.connect(queryClient);

  return {
    convexClient,
    convexQueryClient,
    queryClient,
  };
}

export function getClients(): ClientSet {
  if (typeof window === "undefined") {
    return createClients();
  } else {
    if (!browserClients) {
      browserClients = createClients();
    }
    return browserClients;
  }
}
