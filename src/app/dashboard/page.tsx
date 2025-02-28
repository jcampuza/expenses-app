import { auth } from "@clerk/nextjs/server";
import { DashboardContent } from "./DashboardContent";

export default async function Dashboard() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }

  return <DashboardContent />;
}
