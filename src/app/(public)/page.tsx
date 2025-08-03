import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: {
    absolute: "ExpenseMate",
  },
};

export default async function PublicHome() {
  const user = await auth();
  if (user.isAuthenticated) {
    return redirect("/dashboard");
  }

  return (
    <div className="flex flex-col">
      <main className="mt-12 flex grow flex-col items-center justify-center p-4 text-center">
        <img
          src="/logo.webp"
          alt="Expenses App Illustration"
          width={150}
          height={150}
          className="mb-6 rounded-full"
        />
        <h1 className="mb-4 text-3xl font-bold">Track Your Expenses with Ease</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          ExpenseMate helps you split bills, track shared expenses, and settle debts with friends
          and roommates. Stay organized and eliminate awkward money conversations.
        </p>

        <SignInButton>
          <Button variant={"default"}>Sign up now</Button>
        </SignInButton>
      </main>
    </div>
  );
}
