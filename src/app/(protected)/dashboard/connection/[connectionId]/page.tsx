import type { Metadata } from "next";
import { Id } from "@convex/_generated/dataModel";
import { ConnectionsPageContainer } from "./ConnectionsPageContent";

export const metadata: Metadata = {
  title: "Connection",
};

interface PageProps {
  params: Promise<{
    connectionId: string;
  }>;
}

export default async function ConnectionPage({ params }: PageProps) {
  const { connectionId } = await params;

  return (
    <ConnectionsPageContainer
      connectionId={connectionId as Id<"user_connections">}
    />
  );
}
