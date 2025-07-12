import { usePersistUserEffect } from "~/hooks/use-persist-user";
import { RedirectToSignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_protected")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuthenticated, isLoading } = usePersistUserEffect();

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center p-12">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <RedirectToSignIn />;
  }

  return <Outlet />;
}
