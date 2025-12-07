import { ProtectedLayout } from "@/components/ProtectedLayout";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      redirect({ to: "/", replace: true, throw: true });
    }
  },
});

function RouteComponent() {
  return (
    <ProtectedLayout>
      <Outlet />
    </ProtectedLayout>
  );
}
