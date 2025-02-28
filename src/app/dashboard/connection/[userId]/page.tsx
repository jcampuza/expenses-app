import { ConnectionsPageContainer } from "~/app/dashboard/connection/[userId]/ConnectionsPageContent";

export default async function ConnectionPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return <ConnectionsPageContainer participantId={userId} />;
}
