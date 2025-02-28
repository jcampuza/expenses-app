import { SignInButton } from "@clerk/nextjs";
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
      <main className="flex flex-grow flex-col items-center justify-center p-4 text-center">
        <Image
          src="/logo.png"
          alt="Expenses App Illustration"
          width={200}
          height={200}
          className="mb-6 rounded-full"
        />
        <h1 className="mb-4 text-3xl font-bold">
          Track Your Expenses with Ease
        </h1>
        <p className="mb-6 max-w-md text-muted-foreground">
          Simplify your financial life with our intuitive expense tracking app.
          Stay on top of your spending and reach your financial goals.
        </p>

        <SignInButton />
      </main>
    </div>
  );
}
