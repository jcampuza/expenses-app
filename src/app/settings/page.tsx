import { auth } from "@clerk/nextjs/server";
import SettingsForm from "./settings-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function SettingsPage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }

  return (
    <div className="container p-4">
      <div className="mb-6">
        <Button asChild variant="ghost" className="hover:bg-transparent">
          <Link href="/dashboard" className="flex items-center text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>
      <SettingsForm />
    </div>
  );
}
