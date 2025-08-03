"use client";

import { usePersistUserEffect } from "@/hooks/use-persist-user";
import { LoadingComponent } from "@/components/LoadingComponent";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = usePersistUserEffect();

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center p-12">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoadingComponent />;
  }

  // Once user is persisted, show the full layout with Header/Footer
  return (
    <div className="flex flex-col">
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="relative container mx-auto flex grow flex-col">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
