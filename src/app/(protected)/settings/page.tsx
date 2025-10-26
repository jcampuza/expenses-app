import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsPageSkeleton } from "@/components/Skeletons";
import { SettingsPageContent } from "./SettingsPageContent";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsPageContent />
    </Suspense>
  );
}
