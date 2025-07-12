import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { LoadingComponent } from "~/app/-components/LoadingComponent";
import { useConvexAuth } from "convex/react";

export const Route = createFileRoute("/_public")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
}
