"use client";

import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexQueryClient } from "@convex-dev/react-query";

interface ClientSet {
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

function getClients(): ClientSet {
  if (typeof window === "undefined") {
    return createClients();
  } else {
    if (!browserClients) {
      browserClients = createClients();
    }
    return browserClients;
  }
}

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";

export function RootProviders({ children }: { children: ReactNode }) {
  const clients = getClients();

  return (
    <QueryClientProvider client={clients.queryClient}>
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <ConvexProviderWithClerk
          client={clients.convexClient}
          useAuth={useAuth}
        >
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </QueryClientProvider>
  );
}
