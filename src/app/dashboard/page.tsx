import { SignedIn, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

export default async function Dashboard() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Image
            src="https://picsum.photos/40/40"
            alt="Expenses App Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <span className="text-xl font-bold">ExpenseTracker</span>
        </div>
        <SignedIn>
          <UserButton userProfileUrl="/settings" />
        </SignedIn>
      </header>

      <main className="flex flex-grow flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>
        <p className="mb-6 max-w-md text-muted-foreground">
          Welcome to your dashboard! Here you can manage your expenses and track
          your spending.
        </p>
        <Link
          href="/expenses"
          className="rounded-full bg-primary px-6 py-3 text-lg font-medium text-primary-foreground"
        >
          View Expenses
        </Link>
      </main>

      <footer className="p-4 text-center text-sm text-muted-foreground">
        © 2025 ExpenseTracker. All rights reserved.
      </footer>
    </div>
  );
}
