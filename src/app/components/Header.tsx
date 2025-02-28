import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export function Header() {
  return (
    <header className="flex items-center justify-between bg-accent p-4">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-black"
        >
          <Image
            src="/logo.png"
            alt="Expenses App Logo"
            width={40}
            height={40}
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

          <SignUpButton>
            <Button variant={"link"}>Sign out</Button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <UserButton userProfileUrl="/settings" />
        </SignedIn>
      </div>
    </header>
  );
}
