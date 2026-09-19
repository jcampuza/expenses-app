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
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type AlertCtx = {
  titleId: string;
  descriptionId: string;
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
  const id = createUniqueId();
  const [uncontrolled, setUncontrolled] = createSignal(false);
  const isControlled = () => props.open !== undefined;
  const open = () => (isControlled() ? Boolean(props.open) : uncontrolled());
  const setOpen = (next: boolean) => {
    if (!isControlled()) setUncontrolled(next);
    props.onOpenChange?.(next);
  };

  return (
    <AlertDialogContext
      value={{
        open,
        setOpen,
        titleId: `${id}-title`,
        descriptionId: `${id}-description`,
      }}
    >
      {props.children}
    </AlertDialogContext>
  );
}

export function AlertDialogContent(props: ParentProps<{ class?: string }>) {
  const dialog = useContext(AlertDialogContext);

  return (
    <Show when={dialog.open()}>
      <Modal
        titleId={dialog.titleId}
        descriptionId={dialog.descriptionId}
        role="alertdialog"
        onDismiss={() => dialog.setOpen(false)}
        class={cn(
          "inset-0 max-h-[85dvh] w-full max-w-lg rounded-lg p-6",
          props.class,
        )}
      >
        <div class="grid gap-4">{props.children}</div>
      </Modal>
    </Show>
  );
}

export function AlertDialogHeader(props: ParentProps<{ class?: string }>) {
  return (
    <div
      class={cn("flex flex-col gap-2 text-center sm:text-left", props.class)}
    >
      {props.children}
    </div>
  );
}

export function AlertDialogFooter(props: ParentProps<{ class?: string }>) {
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

export function AlertDialogTitle(props: ParentProps<{ class?: string }>) {
  const dialog = useContext(AlertDialogContext);
  return (
    <h2 id={dialog.titleId} class={cn("text-lg font-semibold", props.class)}>
      {props.children}
    </h2>
  );
}

export function AlertDialogDescription(props: ParentProps<{ class?: string }>) {
  const dialog = useContext(AlertDialogContext);
  return (
    <p
      id={dialog.descriptionId}
      class={cn("text-sm text-muted-foreground", props.class)}
    >
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
