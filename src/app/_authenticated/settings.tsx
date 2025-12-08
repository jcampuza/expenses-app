import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex/_generated/api";
import { SettingsPageSkeleton } from "@/components/Skeletons";
import { SettingsPageContent } from "@/components/SettingsPageContent";

export const Route = createFileRoute("/_authenticated/settings")({
  loader: async ({ context }) => {
    await context.clients.queryClient.ensureQueryData(
      convexQuery(api.connections.getConnectedUsersForSettings, {}),
    );
  },
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsPageContent />
    </Suspense>
  );
}
