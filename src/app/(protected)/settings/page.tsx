import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingComponent } from "@/components/LoadingComponent";
import { SettingsPageContent } from "./SettingsPageContent";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <SettingsPageContent />
    </Suspense>
  );
}
