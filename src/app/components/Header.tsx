import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export async function Header() {
  const { userId } = await auth();

  // The header should be dashboard for logged in users,
  // and just continue to go home for anonymous users.
  const headerLink = userId ? "/dashboard" : "/";

  return (
    <header className="flex items-center justify-between bg-accent p-4">
      <div className="flex items-center gap-2">
        <Link
          href={headerLink}
          className="inline-flex items-center gap-2 text-black"
        >
          <Image
            src="/logo.png"
            width={40}
            height={40}
            quality={75}
            alt="Expenses App Logo"
            className="rounded-full"
            priority
          ></Image>

          <span className="text-xl font-bold">ExpenseMate</span>
        </Link>
      </div>

      <div className="flex items-center">
        <SignedOut>
          <SignInButton>
            <Button variant={"link"}>Sign in</Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton userProfileUrl="/settings" />
        </SignedIn>
      </div>
    </header>
  );
}
