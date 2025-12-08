import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toaster";
import React from "react";
import { useConvexAuth } from "convex/react";
import { ClientSet } from "@/lib/queryClient";

export const Route = createRootRouteWithContext<{
  auth: ReturnType<typeof useConvexAuth>;
  clients: ClientSet;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "description", content: "Simple expense tracking app" },
      { title: "ExpenseMate" },
    ],
    links: [
      { rel: "icon", href: "/icon.png" },
      { rel: "apple-touch-icon", href: "/apple-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeadContent />
      {children}
      <Scripts />
    </>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
