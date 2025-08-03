import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingComponent } from "@/components/LoadingComponent";
import DashboardContent from "./DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <DashboardContent />
    </Suspense>
  );
}
