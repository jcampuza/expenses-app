import { Errored } from "solid-js";
import { pageRoutes } from "virtual:file-routes";
import { createRouter } from "@solidjs/router";
import { fileRoutes } from "@solidjs/router/fs";
import { ClerkProvider, ConvexClerkAuth, useClerkState } from "@/lib/clerk";
import { ConvexSessionProvider } from "@/lib/convex";
import { PersistGate } from "@/lib/persist-user";
import { Toaster } from "@/components/ui/toaster";
import { RouteError } from "@/components/RouteError";
import "@/styles/globals.css";

const Router = createRouter({ routes: fileRoutes(pageRoutes) });

export default function App() {
  return (
    <ClerkProvider>
      <SessionApp />
    </ClerkProvider>
  );
}

function SessionApp() {
  const state = useClerkState();
  return (
    <ConvexSessionProvider sessionKey={state().session?.id ?? "signed-out"}>
      {() => (
        <ConvexClerkAuth>
          <PersistGate>
            <Errored
              fallback={(err, reset) => (
                <RouteError error={err()} reset={reset} />
              )}
            >
              <Router>
                {(props) => (
                  <>
                    {props.children}
                    <Toaster />
                  </>
                )}
              </Router>
            </Errored>
          </PersistGate>
        </ConvexClerkAuth>
      )}
    </ConvexSessionProvider>
  );
}
