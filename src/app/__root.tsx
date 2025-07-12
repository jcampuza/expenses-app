import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
} from "@tanstack/react-router";
import Footer from "~/app/-components/Footer";
import { Header } from "~/app/-components/Header";
import { Toaster } from "~/components/ui/toaster";
import "~/styles/globals.css";
import { ClerkProvider, useAuth } from "@clerk/tanstack-react-start";
import { AppLink } from "~/components/ui/app-link";
import { QueryClient } from "@tanstack/react-query";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { authQueries } from "~/lib/auth";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "ExpenseMate" },
      { description: "Simple expense tracking app" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "/src/styles/globals.css",
      },
      {
        rel: "icon",
        href: "/icon.png",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-icon.png",
      },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const { token, userId } = await context.queryClient.ensureQueryData(
      authQueries.current,
    );

    if (token) {
      context.convexQueryClient.serverHttpClient?.setAuth(token);
    }

    return {
      userId,
      token,
    };
  },
  component: RootComponent,
  errorComponent: ({ error, info, reset }) => {
    return (
      <div>
        <h2>Error</h2>
        <p>{error.message}</p>
        <button
          onClick={() => {
            return reset();
          }}
        >
          Reset
        </button>
        <p>{info?.componentStack}</p>
      </div>
    );
  },
  notFoundComponent: () => {
    return (
      <div>
        <h2>Not Found</h2>
        <AppLink to="/">Return Home</AppLink>
      </div>
    );
  },
});

function RootComponent() {
  const context = useRouteContext({ from: Route.id });

  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={context.convexClient} useAuth={useAuth}>
        <RootDocument>
          <Outlet />
        </RootDocument>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <body>
          <div className="flex flex-col">
            <div className="flex min-h-screen flex-col">
              <Header />
              <div className="relative container mx-auto flex grow flex-col">
                {children}
              </div>
              <Footer />
            </div>
          </div>

          <Toaster />

          <Scripts />
        </body>
      </body>
    </html>
  );
}
