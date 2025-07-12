import { createFileRoute } from "@tanstack/react-router";
import SettingsForm from "./-settings-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { AppLink } from "~/components/ui/app-link";
import { SkeletonFormField } from "~/app/-components/Skeletons";
import { Skeleton } from "~/components/ui/skeleton";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex/_generated/api";

export const Route = createFileRoute("/_protected/settings/")({
  component: RouteComponent,
  pendingComponent: () => {
    return (
      <div className="container space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />

        <SkeletonFormField />
        <SkeletonFormField />

        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-1/3" />
      </div>
    );
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.connections.getConnectedUsersForSettings, {}),
    );
  },
});

function RouteComponent() {
  return (
    <div className="container p-4">
      <div className="mb-6">
        <Button asChild variant="ghost" className="hover:bg-transparent">
          <AppLink
            href="/dashboard"
            className="text-primary inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </AppLink>
        </Button>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>
      <SettingsForm />
    </div>
  );
}
