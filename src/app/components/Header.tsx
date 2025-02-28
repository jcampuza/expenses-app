import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

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

          <span className="text-xl font-bold">ExpenseThing</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton>
            <span className="cursor-pointer text-accent-foreground hover:underline focus:underline">
              Sign in
            </span>
          </SignInButton>
          <SignUpButton>
            <span className="cursor-pointer text-accent-foreground hover:underline focus:underline">
              Sign up
            </span>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <UserButton userProfileUrl="/settings" />
        </SignedIn>
      </div>
    </header>
  );
}
