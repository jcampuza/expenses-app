import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { getClients } from "@/lib/queryClient";
import { useConvexAuth } from "convex/react";
import { Loader2 } from "lucide-react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import "@/styles/globals.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
const clients = getClients();
const router = createRouter({
  routeTree,
  context: { auth: undefined!, clients },
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function RootProviders({ children }: { children: ReactNode }) {
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

function App() {
  const auth = useConvexAuth();
  if (auth.isLoading) {
    return (
      <div className="relative container mx-auto flex grow flex-col items-center p-12">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
      </div>
    );
  }

  return <RouterProvider router={router} context={{ auth }} />;
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

createRoot(container).render(
  <StrictMode>
    <RootProviders>
      <App />
    </RootProviders>
  </StrictMode>,
);
