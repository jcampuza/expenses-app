import { SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    return redirect("/dashboard");
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
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        {/* <Link
          href="/signin"
          className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
        >
          Sign In
        </Link> */}
      </header>

      <main className="flex flex-grow flex-col items-center justify-center p-4 text-center">
        <Image
          src="https://picsum.photos/200/200"
          alt="Expenses App Illustration"
          width={200}
          height={200}
          className="mb-6"
        />
        <h1 className="mb-4 text-3xl font-bold">
          Track Your Expenses with Ease
        </h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Simplify your financial life with our intuitive expense tracking app.
          Stay on top of your spending and reach your financial goals.
        </p>

        <SignInButton />
      </main>

      <footer className="text-muted-foreground p-4 text-center text-sm">
        © 2025 ExpenseTracker. All rights reserved.
      </footer>
    </div>
  );
}
