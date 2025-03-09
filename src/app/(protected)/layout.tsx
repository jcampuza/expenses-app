import { auth } from "@clerk/nextjs/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { redirectToSignIn, userId } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }

  return <div>{children}</div>;
}
