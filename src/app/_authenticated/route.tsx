import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
  beforeLoad: async ({ context }) => {
    if (context.auth.status === "signedOut") {
      redirect({ to: "/", replace: true, throw: true });
    }
  },
});

function AuthenticatedLayout() {
  return (
    <div className="flex flex-col">
      <div className="flex min-h-screen flex-col">
        <Header />

        <div className="container relative  mx-auto flex grow flex-col">
          <Outlet />
        </div>

        <Footer />
      </div>
    </div>
  );
}
