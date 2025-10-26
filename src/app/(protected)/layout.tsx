"use client";

import { usePersistUserEffect } from "@/hooks/use-persist-user";
import { LoadingComponent } from "@/components/LoadingComponent";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex min-h-screen flex-col">
        <Header />

        <ProtectedLayoutInnerPersistor>
          {children}
        </ProtectedLayoutInnerPersistor>

        <Footer />
      </div>
    </div>
  );
}

function ProtectedLayoutInnerPersistor({
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

  // Once user is persisted, show the children/inner content
  return (
    <div className="relative container mx-auto flex grow flex-col">
      {children}
    </div>
  );
}
