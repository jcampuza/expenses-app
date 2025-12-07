import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { RootProviders } from "@/providers/RootProviders";
import { useConvexAuth } from "convex/react";
import { Loader2 } from "lucide-react";
import "@/styles/globals.css";

const router = createRouter({ routeTree, context: { auth: undefined! } });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
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

function App() {
  return (
    <RootProviders>
      <InnerApp />
    </RootProviders>
  );
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
