import { createSignal, For, Show } from "solid-js";

export type ToastVariant = "default" | "destructive";

export type ToastRecord = {
  id: number;
  title?: string;
  description?: string;
  variant: ToastVariant;
};

const [toasts, setToasts] = createSignal<ToastRecord[]>([]);
let nextId = 1;

export function toast(input: {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  timeout?: number;
}) {
  const id = nextId++;
  const record: ToastRecord = {
    id,
    title: input.title,
    description: input.description,
    variant: input.variant ?? "default",
  };
  setToasts((current) => [...current, record]);
  const duration = input.duration ?? input.timeout ?? 4000;
  window.setTimeout(() => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, duration);
  return {
    id,
    dismiss: () =>
      setToasts((current) => current.filter((item) => item.id !== id)),
  };
}

export function useToast() {
  return {
    toast,
    dismiss: (id?: number) => {
      if (id === undefined) {
        setToasts([]);
        return;
      }
      setToasts((current) => current.filter((item) => item.id !== id));
    },
  };
}

export function Toaster() {
  return (
    <div class="fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2">
      <For each={toasts()}>
        {(item) => (
          <div
            class={
              item.variant === "destructive"
                ? "rounded-md border border-destructive bg-destructive text-destructive-foreground p-3 shadow"
                : "rounded-md border bg-popover text-popover-foreground p-3 shadow"
            }
          >
            <Show when={item.title}>
              <p class="text-sm font-medium">{item.title}</p>
            </Show>
            <Show when={item.description}>
              <p class="text-sm opacity-90">{item.description}</p>
            </Show>
          </div>
        )}
      </For>
    </div>
  );
}
