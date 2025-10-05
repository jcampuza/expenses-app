"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ThemeProvider } from "@/hooks/use-theme";

interface ClientSet {
  convexClient: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
  queryClient: QueryClient;
}

let browserClients: ClientSet | undefined = undefined;

function createClients(): ClientSet {
  // Create the Convex client
  const convexClient = new ConvexReactClient(
    process.env.NEXT_PUBLIC_CONVEX_URL!,
  );

  // Create the Convex Query client
  const convexQueryClient = new ConvexQueryClient(convexClient);

  // Create the React Query client with Convex integration
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });

  // Connect them together
  convexQueryClient.connect(queryClient);

  return {
    convexClient,
    convexQueryClient,
    queryClient,
  };
}

function getClients(): ClientSet {
  if (typeof window === "undefined") {
    // Server: always make new clients
    return createClients();
  } else {
    // Browser: make new clients if we don't already have them
    // This is to avoid creating new clients on every component unmount/remount
    if (!browserClients) {
      browserClients = createClients();
    }
    return browserClients;
  }
}

export function RootProviders({ children }: { children: ReactNode }) {
  const clients = getClients();

  return (
    <QueryClientProvider client={clients.queryClient}>
      <ClerkProvider>
        <ConvexProviderWithClerk
          client={clients.convexClient}
          useAuth={useAuth}
        >
          <ThemeProvider>{children}</ThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </QueryClientProvider>
  );
}
