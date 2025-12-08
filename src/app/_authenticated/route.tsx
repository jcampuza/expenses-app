import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import React from "react";
import { usePersistUserEffect } from "@/hooks/use-persist-user";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

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
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  );
}

function AuthenticatedLayoutInnerPersistor({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = usePersistUserEffect();

  if (isLoading || !isAuthenticated) {
    return (
      <div className="relative container mx-auto flex grow flex-col items-center p-12">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative container mx-auto flex grow flex-col">
      {children}
    </div>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="flex min-h-screen flex-col">
        <Header />

        <AuthenticatedLayoutInnerPersistor>
          {children}
        </AuthenticatedLayoutInnerPersistor>

        <Footer />
      </div>
    </div>
  );
}
