import type { JSX } from "@solidjs/web";
import { cn } from "@/lib/utils";

export function Input(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      class={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        props.class,
      )}
    />
  );
}

export function Select(props: JSX.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      class={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        props.class,
      )}
    />
  );
}
