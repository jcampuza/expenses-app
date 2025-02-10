import { Suspense } from "react";
import SettingsForm from "./settings-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="hover:bg-transparent">
          <Link href="/dashboard" className="flex items-center text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SettingsForm />
      </Suspense>
    </div>
  );
}
