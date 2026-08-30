import type { JSX } from "@solidjs/web";
import { cn } from "@/lib/utils";

export function Skeleton(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      class={cn("animate-pulse rounded-md bg-primary/10", props.class)}
    />
  );
}
