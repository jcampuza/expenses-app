import { Id } from "convex/_generated/dataModel";
import { ConnectionsPageContainer } from "~/app/(protected)/dashboard/connection/[connectionId]/ConnectionsPageContent";

export default async function ConnectionPage({
  params,
}: {
  params: Promise<{ connectionId: Id<"user_connections"> }>;
}) {
  const { connectionId } = await params;

  return <ConnectionsPageContainer connectionId={connectionId} />;
}
