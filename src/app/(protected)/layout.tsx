"use client";

import { ConnectionsPageLoading } from "~/app/(protected)/dashboard/connection/[connectionId]/ConnectionsPageContent";
import { usePersistUserEffect } from "~/hooks/use-persist-user";

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
    return <div>Not authenticated</div>;
  }

  return <div>{children}</div>;
}
