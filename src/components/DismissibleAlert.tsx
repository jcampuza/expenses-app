"use client";

import { useState, useEffect } from "react";
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
  info: "border-blue-200 border-l-4 bg-blue-50 text-blue-900 [&>svg]:text-blue-700",
  warning:
    "border-amber-200 border-l-4 bg-amber-50 text-amber-900 [&>svg]:text-amber-700",
  success:
    "border-green-200 border-l-4 bg-green-50 text-green-900 [&>svg]:text-green-700",
  destructive:
    "border-red-200 border-l-4 bg-red-50 text-red-900 [&>svg]:text-red-700",
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
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`alert-dismissed-${id}`);
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, [id]);

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
