import {
  createContext,
  createEffect,
  createSignal,
  Show,
  useContext,
  type Accessor,
  type ParentProps,
} from "solid-js";
import { Portal } from "@solidjs/web";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type AlertCtx = {
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
};

const AlertDialogContext = createContext<AlertCtx>();

export function AlertDialog(
  props: ParentProps<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>,
) {
  const [uncontrolled, setUncontrolled] = createSignal(false);
  const isControlled = () => props.open !== undefined;
  const open = () => (isControlled() ? Boolean(props.open) : uncontrolled());
  const setOpen = (next: boolean) => {
    if (!isControlled()) setUncontrolled(next);
    props.onOpenChange?.(next);
  };

  return (
    <AlertDialogContext value={{ open, setOpen }}>
      {props.children}
    </AlertDialogContext>
  );
}

export function AlertDialogContent(props: ParentProps<{ class?: string }>) {
  const dialog = useContext(AlertDialogContext);

  createEffect(
    () => dialog.open(),
    (isOpen) => {
      if (!isOpen) return;
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") dialog.setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    },
  );

  return (
    <Show when={dialog.open()}>
      <Portal>
        <div class="fixed inset-0 z-50">
          <div class="fixed inset-0 bg-black/80" />
          <div
            role="alertdialog"
            aria-modal="true"
            class={cn(
              "fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
              props.class,
            )}
          >
            {props.children}
          </div>
        </div>
      </Portal>
    </Show>
  );
}

export function AlertDialogHeader(props: ParentProps<{ class?: string }>) {
  return (
    <div
      class={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        props.class,
      )}
    >
      {props.children}
    </div>
  );
}

export function AlertDialogFooter(props: ParentProps<{ class?: string }>) {
  return (
    <div
      class={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        props.class,
      )}
    >
      {props.children}
    </div>
  );
}

export function AlertDialogTitle(props: ParentProps<{ class?: string }>) {
  return (
    <h2 class={cn("text-lg font-semibold", props.class)}>{props.children}</h2>
  );
}

export function AlertDialogDescription(props: ParentProps<{ class?: string }>) {
  return (
    <p class={cn("text-sm text-muted-foreground", props.class)}>
      {props.children}
    </p>
  );
}

export function AlertDialogCancel(
  props: ParentProps<{ class?: string; disabled?: boolean }>,
) {
  const dialog = useContext(AlertDialogContext);
  return (
    <button
      type="button"
      disabled={props.disabled}
      class={cn(
        buttonVariants({ variant: "outline" }),
        "mt-2 sm:mt-0",
        props.class,
      )}
      onClick={() => dialog.setOpen(false)}
    >
      {props.children}
    </button>
  );
}

export function AlertDialogAction(
  props: ParentProps<{
    class?: string;
    disabled?: boolean;
    onClick?: (event: MouseEvent) => void;
  }>,
) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      class={cn(buttonVariants(), props.class)}
      onClick={(event) => props.onClick?.(event)}
    >
      {props.children}
    </button>
  );
}
