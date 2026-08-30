import { createSignal, Show, type ParentProps } from "solid-js";
import { cn } from "@/lib/utils";

export function Avatar(props: ParentProps<{ class?: string }>) {
  return (
    <span
      class={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        props.class,
      )}
    >
      {props.children}
    </span>
  );
}

export function AvatarImage(props: {
  src?: string;
  alt?: string;
  class?: string;
}) {
  const [failed, setFailed] = createSignal(false);
  return (
    <Show when={props.src && !failed()}>
      <img
        src={props.src}
        alt={props.alt}
        class={cn("aspect-square size-full", props.class)}
        onError={() => setFailed(true)}
      />
    </Show>
  );
}

export function AvatarFallback(props: ParentProps<{ class?: string }>) {
  return (
    <span
      class={cn(
        "flex size-full items-center justify-center rounded-full bg-muted",
        props.class,
      )}
    >
      {props.children}
    </span>
  );
}
