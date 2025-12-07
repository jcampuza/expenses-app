import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { SettingsPageSkeleton } from "@/components/Skeletons";
import { SettingsPageContent } from "@/features/settings/SettingsPageContent";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsPageContent />
    </Suspense>
  );
}
