"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useConvexAuth } from "convex/react";

import { Button } from "@/components/ui/button";

export function Header() {
  const { isAuthenticated } = useConvexAuth();

  // The header should be dashboard for logged in users,
  // and just continue to go home for anonymous users.
  const headerLink = isAuthenticated ? "/dashboard" : "/";

  return (
    <header className="bg-accent flex items-center justify-between p-4">
      <div className="flex items-center gap-2">
        <Link href={headerLink} className="inline-flex items-center gap-2 text-black">
          <img
            src="/logo.webp"
            width={40}
            height={40}
            alt="Expenses App Logo"
            className="rounded-full"
          />

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
