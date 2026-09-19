import { SignedIn, SignedOut, SignInButton } from "@/lib/clerk";
import { useConvexAuth } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { CustomUserButton } from "@/components/CustomUserButton";

export function Header() {
  const { isAuthenticated } = useConvexAuth();
  const headerLink = () => (isAuthenticated() ? "/dashboard" : "/");

  return (
    <header class="flex items-center justify-between border-b bg-accent p-4">
      <div class="flex items-center gap-2">
        <a href={headerLink()} class="inline-flex items-center gap-2">
          <img
            src="/logo.webp"
            width={40}
            height={40}
            alt="Expenses App Logo"
            class="rounded-full"
            loading="lazy"
          />
          <span class="text-xl font-bold">ExpenseMate</span>
        </a>
      </div>
      <div class="flex items-center">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="link">Sign in</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <CustomUserButton />
        </SignedIn>
      </div>
    </header>
  );
}
