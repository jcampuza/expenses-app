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
import { X } from "lucide";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";

type DialogCtx = {
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
};

const DialogContext = createContext<DialogCtx>();

export function Dialog(
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
    <DialogContext value={{ open, setOpen }}>{props.children}</DialogContext>
  );
}

export function DialogTrigger(
  props: ParentProps<{ class?: string; onClick?: (event: MouseEvent) => void }>,
) {
  const dialog = useContext(DialogContext);
  return (
    <span
      class={cn("contents", props.class)}
      onClick={(event) => {
        props.onClick?.(event);
        dialog.setOpen(true);
      }}
    >
      {props.children}
    </span>
  );
}

export function DialogClose(
  props: ParentProps<{ class?: string; onClick?: (event: MouseEvent) => void }>,
) {
  const dialog = useContext(DialogContext);
  return (
    <span
      class={cn("contents", props.class)}
      onClick={(event) => {
        props.onClick?.(event);
        dialog.setOpen(false);
      }}
    >
      {props.children}
    </span>
  );
}

export function DialogContent(props: ParentProps<{ class?: string }>) {
  const dialog = useContext(DialogContext);

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
          <div
            class="fixed inset-0 bg-black/80"
            onClick={() => dialog.setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            class={cn(
              "fixed z-50 grid w-full gap-4 border bg-background shadow-lg",
              "inset-0 h-full max-h-screen rounded-none p-4",
              "sm:top-[50%] sm:left-[50%] sm:h-fit sm:max-h-[85vh] sm:w-full sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:p-6",
              props.class,
            )}
          >
            <div class="mt-8 h-full overflow-y-auto sm:h-auto sm:overflow-visible">
              {props.children}
            </div>
            <button
              type="button"
              class="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
              aria-label="Close"
              onClick={() => dialog.setOpen(false)}
            >
              <Icon icon={X} class="h-6 w-6 sm:h-4 sm:w-4" />
              <span class="sr-only">Close</span>
            </button>
          </div>
        </div>
      </Portal>
    </Show>
  );
}

export function DialogHeader(props: ParentProps<{ class?: string }>) {
  return (
    <div
      class={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        props.class,
      )}
    >
      {props.children}
    </div>
  );
}

export function DialogFooter(props: ParentProps<{ class?: string }>) {
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

export function DialogTitle(props: ParentProps<{ class?: string }>) {
  return (
    <h2
      class={cn(
        "text-lg leading-none font-semibold tracking-tight",
        props.class,
      )}
    >
      {props.children}
    </h2>
  );
}

export function DialogDescription(props: ParentProps<{ class?: string }>) {
  return (
    <p class={cn("text-sm text-muted-foreground", props.class)}>
      {props.children}
    </p>
  );
}
