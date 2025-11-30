"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "warning" | "success" | "destructive";

interface DismissibleAlertProps {
  id: string;
  title: string;
  description: string;
  variant?: AlertVariant;
  className?: string;
}

const variantStyles = {
  info: "border-blue-500/20 border-l-4 bg-blue-500/10 text-blue-600 [&>svg]:text-blue-600",
  warning:
    "border-amber-200 border-l-4 bg-amber-50 text-amber-900 [&>svg]:text-amber-700",
  success:
    "border-success/20 border-l-4 bg-success/10 text-success [&>svg]:text-success",
  destructive:
    "border-destructive/20 border-l-4 bg-destructive/10 text-destructive [&>svg]:text-destructive",
};

const variantIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  destructive: AlertTriangle,
};

export function DismissibleAlert({
  id,
  title,
  description,
  variant = "info",
  className,
}: DismissibleAlertProps) {
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    const dismissed = localStorage.getItem(`alert-dismissed-${id}`);
    return dismissed === "true";
  });

  const handleDismiss = () => {
    localStorage.setItem(`alert-dismissed-${id}`, "true");
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  const Icon = variantIcons[variant];

  return (
    <Alert className={cn(variantStyles[variant], className)}>
      <Icon />
      <AlertTitle className="flex items-center justify-between">
        {title}
        <button
          onClick={handleDismiss}
          className="ml-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      </AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
