"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { ArrowLeft, QrCode } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

type State =
  | { status: "idle"; data: null }
  | { status: "loading"; data: null }
  | { status: "ready"; data: string };

export default function SettingsForm() {
  const user = useUser();
  const [state, setState] = useState<State>({
    status: "idle",
    data: null,
  });

  if (!user) {
    return null;
  }

  // Mock user data - replace with actual data fetching logic
  const userData = {
    name: user.user?.fullName ?? "",
    email: user.user?.emailAddresses[0]?.emailAddress ?? "",
  };

  const generateQRCode = async () => {
    setState({ status: "loading", data: null });

    const { renderSVG } = await import("uqr");
    const svg = renderSVG(`${userData.name}\n${userData.email}`);
    setState({ status: "ready", data: svg });
  };

  const close = () => {
    setState({ status: "idle", data: null });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={userData.name} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={userData.email} disabled />
      </div>
      <Dialog
        open={state.status === "ready" || state.status === "loading"}
        onOpenChange={() => {
          close();
        }}
      >
        <DialogTrigger asChild>
          <Button onClick={generateQRCode}>
            <QrCode className="mr-2 h-4 w-4" />
            Generate Account QR Code
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Account QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {state.data ? (
              <div
                dangerouslySetInnerHTML={{ __html: state.data }}
                style={{ width: 100 }}
              />
            ) : (
              <p className="text-center text-sm text-gray-500">
                Generating QR code...
              </p>
            )}

            <p className="text-center text-sm text-gray-500">
              Scan this QR code to link to your account
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
