import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InvitationContent } from "~/app/(protected)/invite/[invitationId]/InvitationContent";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }

  if (!invitationId) {
    return redirect("/dashboard");
  }

  return (
    <main>
      <InvitationContent invitationId={invitationId} />
    </main>
  );
}
