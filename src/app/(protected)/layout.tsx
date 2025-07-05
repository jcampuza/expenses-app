"use client";

import { ConnectionsPageLoading } from "~/app/(protected)/dashboard/connection/[connectionId]/ConnectionsPageContent";
import { usePersistUserEffect } from "~/hooks/use-persist-user";
import { RedirectToSignIn } from "@clerk/nextjs";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = usePersistUserEffect();

  if (isLoading) {
    return <ConnectionsPageLoading />;
  }

  if (!isAuthenticated) {
    return <RedirectToSignIn />;
  }

  return <div>{children}</div>;
}
