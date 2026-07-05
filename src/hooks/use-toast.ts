import type * as React from "react";
import { toast as sonnerToast } from "sonner";
import type { ExternalToast } from "sonner";

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ExternalToast["action"];
  variant?: "default" | "destructive";
  duration?: number;
  timeout?: number;
};

function toast({
  title,
  description,
  action,
  variant,
  duration,
  timeout,
}: ToastProps) {
  const options: ExternalToast = {
    description,
    action,
    duration: duration ?? timeout,
  };

  const id =
    variant === "destructive"
      ? sonnerToast.error(title, options)
      : sonnerToast(title, options);

  return {
    id,
    dismiss: () => sonnerToast.dismiss(id),
    update: (props: ToastProps) => {
      const nextOptions: ExternalToast = {
        id,
        description: props.description,
        action: props.action,
        duration: props.duration ?? props.timeout,
      };

      if (props.variant === "destructive") {
        sonnerToast.error(props.title, nextOptions);
      } else {
        sonnerToast(props.title, nextOptions);
      }
    },
  };
}

function useToast() {
  return {
    toasts: sonnerToast.getToasts(),
    toast,
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
  };
}

export { useToast, toast };
