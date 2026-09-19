import { onSettled, type ParentProps } from "solid-js";
import { Portal } from "@solidjs/web";
import { cn } from "@/lib/utils";

/** Mounted only while open; the native top layer handles focus and inertness. */
export function Modal(
  props: ParentProps<{
    titleId: string;
    descriptionId: string;
    role?: "dialog" | "alertdialog";
    class?: string;
    dismissOnBackdrop?: boolean;
    onDismiss: () => void;
  }>,
) {
  let element!: HTMLDialogElement;
  let pointerStartedOutside = false;

  onSettled(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    if (document.getElementById(props.descriptionId)) {
      element.setAttribute("aria-describedby", props.descriptionId);
    }
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  });

  const outside = (event: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    return (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
  };

  return (
    <Portal>
      <dialog
        ref={(el) => {
          element = el;
        }}
        role={props.role ?? "dialog"}
        aria-labelledby={props.titleId}
        class={cn(
          "fixed m-auto border bg-background text-foreground shadow-lg backdrop:bg-black/80",
          props.class,
        )}
        onCancel={(event) => {
          event.preventDefault();
          props.onDismiss();
        }}
        onPointerDown={(event) => {
          pointerStartedOutside = outside(event);
        }}
        onClick={(event) => {
          if (
            props.dismissOnBackdrop &&
            pointerStartedOutside &&
            outside(event)
          )
            props.onDismiss();
          pointerStartedOutside = false;
        }}
      >
        {props.children}
      </dialog>
    </Portal>
  );
}
