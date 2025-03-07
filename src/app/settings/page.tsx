import { auth } from "@clerk/nextjs/server";
import SettingsForm from "./settings-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { AppLink } from "~/components/ui/app-link";

export default async function SettingsPage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }

  return (
    <div className="container p-4">
      <div className="mb-6">
        <Button asChild variant="ghost" className="hover:bg-transparent">
          <AppLink
            href="/dashboard"
            className="inline-flex items-center text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </AppLink>
        </Button>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>
      <SettingsForm />
    </div>
  );
}
