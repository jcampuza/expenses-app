import {
  createContext,
  createEffect,
  createSignal,
  Show,
  useContext,
  type Accessor,
  type ParentProps,
} from "solid-js";
import { cn } from "@/lib/utils";

type MenuCtx = {
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
};

const DropdownMenuContext = createContext<MenuCtx>();

export function DropdownMenu(props: ParentProps) {
  const [open, setOpen] = createSignal(false);
  return (
    <DropdownMenuContext value={{ open, setOpen }}>
      <div class="relative inline-block">{props.children}</div>
    </DropdownMenuContext>
  );
}

export function DropdownMenuTrigger(props: ParentProps<{ class?: string }>) {
  const menu = useContext(DropdownMenuContext);
  return (
    <span
      class={cn("contents", props.class)}
      onClick={(event) => {
        event.stopPropagation();
        menu.setOpen(!menu.open());
      }}
    >
      {props.children}
    </span>
  );
}

export function DropdownMenuContent(
  props: ParentProps<{ class?: string; align?: "start" | "end" }>,
) {
  const menu = useContext(DropdownMenuContext);
  let panel: HTMLDivElement | undefined;

  createEffect(
    () => menu.open(),
    (isOpen) => {
      if (!isOpen) return;
      const onPointer = (event: MouseEvent) => {
        if (panel && !panel.contains(event.target as Node)) {
          menu.setOpen(false);
        }
      };
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") menu.setOpen(false);
      };
      window.addEventListener("mousedown", onPointer);
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("mousedown", onPointer);
        window.removeEventListener("keydown", onKey);
      };
    },
  );

  return (
    <Show when={menu.open()}>
      <div
        ref={(el) => {
          panel = el;
        }}
        role="menu"
        class={cn(
          "absolute z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          props.align === "end" ? "right-0" : "left-0",
          "mt-2",
          props.class,
        )}
      >
        {props.children}
      </div>
    </Show>
  );
}

export function DropdownMenuItem(
  props: ParentProps<{
    class?: string;
    onClick?: (event: MouseEvent) => void;
  }>,
) {
  const menu = useContext(DropdownMenuContext);
  return (
    <button
      type="button"
      role="menuitem"
      class={cn(
        "flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground",
        props.class,
      )}
      onClick={(event) => {
        props.onClick?.(event);
        menu.setOpen(false);
      }}
    >
      {props.children}
    </button>
  );
}

export function DropdownMenuLabel(props: ParentProps<{ class?: string }>) {
  return (
    <div class={cn("px-2 py-1.5 text-sm font-semibold", props.class)}>
      {props.children}
    </div>
  );
}

export function DropdownMenuSeparator(props: { class?: string }) {
  return <div class={cn("-mx-1 my-1 h-px bg-muted", props.class)} />;
}

export function DropdownMenuGroup(props: ParentProps) {
  return <div>{props.children}</div>;
}
