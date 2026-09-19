import {
  createContext,
  createUniqueId,
  createSignal,
  Show,
  useContext,
  type Accessor,
  type ParentProps,
} from "solid-js";
import { Modal } from "./modal";
import { X } from "lucide";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";

type DialogCtx = {
  titleId: string;
  descriptionId: string;
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
  const id = createUniqueId();
  const [uncontrolled, setUncontrolled] = createSignal(false);
  const isControlled = () => props.open !== undefined;
  const open = () => (isControlled() ? Boolean(props.open) : uncontrolled());
  const setOpen = (next: boolean) => {
    if (!isControlled()) setUncontrolled(next);
    props.onOpenChange?.(next);
  };

  return (
    <DialogContext
      value={{
        open,
        setOpen,
        titleId: `${id}-title`,
        descriptionId: `${id}-description`,
      }}
    >
      {props.children}
    </DialogContext>
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

  return (
    <Show when={dialog.open()}>
      <Modal
        titleId={dialog.titleId}
        descriptionId={dialog.descriptionId}
        onDismiss={() => dialog.setOpen(false)}
        dismissOnBackdrop
        class={cn(
          "inset-0 h-dvh max-h-dvh w-screen max-w-none rounded-none p-4 sm:h-auto sm:max-h-[85dvh] sm:w-full sm:max-w-lg sm:rounded-lg sm:p-6",
          props.class,
        )}
      >
        <div class="mt-8 grid gap-4">{props.children}</div>
        <button
          type="button"
          class="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
          aria-label="Close"
          onClick={() => dialog.setOpen(false)}
        >
          <Icon icon={X} class="size-6 sm:size-4" />
        </button>
      </Modal>
    </Show>
  );
}

export function DialogHeader(props: ParentProps<{ class?: string }>) {
  return (
    <div
      class={cn("flex flex-col gap-1.5 text-center sm:text-left", props.class)}
    >
      {props.children}
    </div>
  );
}

export function DialogFooter(props: ParentProps<{ class?: string }>) {
  return (
    <div
      class={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2",
        props.class,
      )}
    >
      {props.children}
    </div>
  );
}

export function DialogTitle(props: ParentProps<{ class?: string }>) {
  const dialog = useContext(DialogContext);
  return (
    <h2
      id={dialog.titleId}
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
  const dialog = useContext(DialogContext);
  return (
    <p
      id={dialog.descriptionId}
      class={cn("text-sm text-muted-foreground", props.class)}
    >
      {props.children}
    </p>
  );
}
