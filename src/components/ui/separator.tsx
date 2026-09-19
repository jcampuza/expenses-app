import type { JSX } from "@solidjs/web";
import { cn } from "@/lib/utils";

export function Separator(
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical";
  },
) {
  const orientation = () => props.orientation ?? "horizontal";
  return (
    <div
      role="separator"
      {...props}
      class={cn(
        "shrink-0 bg-border",
        orientation() === "horizontal" ? "h-px w-full" : "h-full w-px",
        props.class,
      )}
    />
  );
}
